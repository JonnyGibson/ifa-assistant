#!/bin/bash

# Set script directory as working directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create fund_data directory if it doesn't exist
mkdir -p ../public/fund_data

# Step 1: Generate ISINs list from morefunds.json
echo "Generating ISINs list..."
node generate-isins.js

# Step 2: Update fund data
echo "Updating fund data..."
node update-fund-links.js

# Step 3: Transform fund data
echo "Transforming fund data..."
node transform-fund-data.js

echo "Fund update process completed!"