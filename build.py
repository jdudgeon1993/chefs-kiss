#!/usr/bin/env python3
"""
build.py — Minify CSS and JS assets in-place for production.

Run once during Docker image assembly (after COPY, before serving).
Strips comments and whitespace from every frontend CSS/JS file using
pure-Python tools (rcssmin, rjsmin) — no Node.js required.

Usage:
    python build.py          # minify everything
    python build.py --dry    # report sizes without writing
"""

import sys
import pathlib

try:
    import rcssmin
    import rjsmin
except ImportError:
    print("rcssmin / rjsmin not installed — skipping minification.")
    print("Run:  pip install rcssmin rjsmin")
    sys.exit(0)

ROOT = pathlib.Path(__file__).parent

# Directories that contain frontend assets
FRONTEND_DIRS = ["css", "shopping", "recipes", "pantry", "meals", "js"]

# JS files at root level that should also be minified
ROOT_JS = ["service-worker.js"]

DRY_RUN = "--dry" in sys.argv


def collect_css():
    files = []
    for d in FRONTEND_DIRS:
        files.extend((ROOT / d).glob("*.css"))
    return sorted(files)


def collect_js():
    files = []
    for d in FRONTEND_DIRS:
        files.extend((ROOT / d).glob("*.js"))
    for name in ROOT_JS:
        p = ROOT / name
        if p.exists():
            files.append(p)
    return sorted(files)


def fmt_bytes(n):
    if abs(n) >= 1024:
        return f"{n / 1024:.1f} KB"
    return f"{n} B"


def minify_files(files, minify_fn, label):
    total_before = total_after = 0
    for f in files:
        original = f.read_text(encoding="utf-8")
        minified = minify_fn(original)
        before = len(original.encode())
        after = len(minified.encode())
        saving = before - after
        pct = (saving / before * 100) if before else 0
        total_before += before
        total_after += after
        tag = "(dry)" if DRY_RUN else ""
        print(f"  {label}  {str(f.relative_to(ROOT)):<45}  {fmt_bytes(before):>8} → {fmt_bytes(after):>8}  (-{pct:.0f}%) {tag}")
        if not DRY_RUN:
            f.write_text(minified, encoding="utf-8")
    return total_before, total_after


print("=" * 70)
print("Peachy Pantry — asset minification")
print("=" * 70)

css_files = collect_css()
js_files = collect_js()

print(f"\nCSS ({len(css_files)} files):")
css_before, css_after = minify_files(css_files, rcssmin.cssmin, "CSS")

print(f"\nJS  ({len(js_files)} files):")
js_before, js_after = minify_files(js_files, rjsmin.jsmin, "JS ")

total_before = css_before + js_before
total_after = css_after + js_after
total_saving = total_before - total_after

print("\n" + "=" * 70)
print(f"  CSS  {fmt_bytes(css_before):>8} → {fmt_bytes(css_after):>8}  saved {fmt_bytes(css_before - css_after)}")
print(f"  JS   {fmt_bytes(js_before):>8} → {fmt_bytes(js_after):>8}  saved {fmt_bytes(js_before - js_after)}")
print(f"  TOTAL saved: {fmt_bytes(total_saving)}")
if DRY_RUN:
    print("  (dry run — no files written)")
print("=" * 70)
