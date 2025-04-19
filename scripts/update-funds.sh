#!/bin/bash

# Set script directory as working directory
cd "$(dirname "$0")"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies if they don't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the update script
echo "Updating fund data..."
npm run update

# Output success message
echo "Fund data update process completed!" 