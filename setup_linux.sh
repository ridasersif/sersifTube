#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================="
echo "   SersifTube Linux Setup Script"
echo "=========================================="

# 1. Update Packages
echo "[1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install FFmpeg & Basic Tools
echo "[2/5] Installing FFmpeg and tools..."
sudo apt-get install -y ffmpeg curl git build-essential

# 3. Install Node.js (Version 20.x)
echo "[3/5] Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed. Skipping..."
fi

# 4. Install Global Process Manager (PM2)
echo "[4/5] Installing PM2 (Process Manager)..."
sudo npm install -g pm2

# 5. Install Project Dependencies
echo "[5/5] Installing Project Dependencies..."

# Server
if [ -d "./server" ]; then
    echo " -> Installing Server dependencies..."
    cd server
    npm install
    cd ..
else
    echo "ERROR: 'server' directory not found!"
    exit 1
fi

# Client
if [ -d "./client" ]; then
    echo " -> Installing Client dependencies..."
    cd client
    npm install
    # Optional: Build for production if desired
    # npm run build 
    cd ..
else
    echo "ERROR: 'client' directory not found!"
    exit 1
fi

echo "=========================================="
echo "   Setup Complete!"
echo "=========================================="
echo ""
echo "To run the application with PM2 (Recommended for deployment):"
echo "  1. Start Server: pm2 start server/index.js --name sersif-server"
echo "  2. Start Client: cd client && pm2 start npm --name sersif-client -- run dev"
echo ""
echo "Or run manually:"
echo "  Server: cd server && npm start"
echo "  Client: cd client && npm run dev"
echo ""
