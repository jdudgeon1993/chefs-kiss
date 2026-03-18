FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project (backend + frontend files)
COPY . .

# Expose port (Railway will override with $PORT)
EXPOSE 8000

# Start the backend which also serves the frontend
CMD ["python", "backend/app.py"]
