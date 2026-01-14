# Use Debian-based image for better compatibility with python/ffmpeg
FROM node:20-bookworm-slim

# Install system dependencies required for yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and set permissions for Hugging Face user (1000)
WORKDIR /usr/src/app
RUN chown -R 1000:1000 /usr/src/app

# Switch to non-root user
USER 1000

# Install app dependencies
# COPY from server/ directory since this Dockerfile is in root
COPY --chown=1000:1000 server/package*.json ./
RUN npm install

# Copy app source from server/ directory
COPY --chown=1000:1000 server/ .

# Create downloads directory
RUN mkdir -p downloads

# Expose port (Hugging Face uses 7860)
EXPOSE 7860

# Start server
# Set DOCKER_MODE to true to handle path differences if needed
ENV DOCKER_MODE=true
ENV PORT=7860
CMD [ "node", "index.js" ]
