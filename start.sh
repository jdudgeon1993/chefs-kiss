#!/bin/sh
# Railway startup script for Chef's Kiss backend

echo "Starting uvicorn on port ${PORT:-8080}..."

# Run app.py directly - it has uvicorn.run(app) which uses the loaded app object with routes
exec python backend/app.py
