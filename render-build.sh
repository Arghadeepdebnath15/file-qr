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

# Ensure frontend build files are accessible to the backend
echo "Setting up frontend build files..."
mkdir -p backend/public
cp -r frontend/build/* backend/public/

echo "Build completed successfully!" 