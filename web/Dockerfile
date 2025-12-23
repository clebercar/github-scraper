# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port 4000
EXPOSE 4000

# Default command (dev mode)
CMD ["npm", "run", "dev"]

