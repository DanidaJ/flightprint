# Use Node.js LTS version
FROM node:18-alpine

# Build arguments
ARG VERSION
ARG VITE_API_URL
LABEL version=$VERSION

# Set environment variable for Vite build
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]
