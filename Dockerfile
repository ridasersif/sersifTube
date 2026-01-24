# Use Debian-based image for better compatibility with python/ffmpeg
FROM node:20-bookworm-slim

# Install system dependencies required for yt-dlp and general use
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Ensure python is available as python (for dependencies that expect it)
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Install yt-dlp explicitly
RUN pip3 install yt-dlp --break-system-packages

# Copy package files first to leverage cache
COPY package.json ./

# Install all dependencies (client and server)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose ports (5000 for server, 3000 for client default in this project)
EXPOSE 5000 3000

# Default command (can be overridden in docker-compose)
CMD ["npm", "start"]
