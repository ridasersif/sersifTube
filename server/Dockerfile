# Use Debian-based image for better compatibility with python/ffmpeg
FROM node:20-bookworm-slim

# Install system dependencies required for yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Create downloads directory
RUN mkdir -p downloads

# Expose port
EXPOSE 5000

# Start server
# Set DOCKER_MODE to true to handle path differences if needed
ENV DOCKER_MODE=true
CMD [ "node", "index.js" ]
