#!/bin/bash

# Start the WorkflowAI backend server

echo "Starting WorkflowAI Backend..."

# Change to the backend directory (where this script is located)
cd "$(dirname "$0")"

# Remove existing virtual environment if it exists (to fix _signal module error)
if [ -d "venv" ]; then
    echo "Removing existing virtual environment..."
    rm -rf venv
fi

# Create a fresh virtual environment
echo "Creating new virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
touch .last_install

# Start the server
echo "Starting FastAPI server on http://localhost:8000"
python run.py