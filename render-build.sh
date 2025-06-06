#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies for both backend and frontend
echo "Installing dependencies..."
npm install
cd frontend
npm install

# Build frontend
echo "Building frontend..."
npm run build
cd ..

# Create uploads directory if it doesn't exist
mkdir -p backend/uploads

echo "Build completed successfully!" 