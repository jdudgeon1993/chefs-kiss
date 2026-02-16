-- Migration: Add preferred_store column to pantry_items
-- Run this in Supabase SQL Editor

ALTER TABLE pantry_items
ADD COLUMN IF NOT EXISTS preferred_store text;

-- Also create the recipe-photos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-photos', 'recipe-photos', true)
ON CONFLICT (id) DO NOTHING;
