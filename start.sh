#!/bin/bash
# Railway deployment script

echo "Installing backend dependencies..."
cd backend
npm install

echo "Building TypeScript..."
npm run build

echo "Starting server..."
npm start