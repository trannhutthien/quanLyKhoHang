# Base image - Node.js 20 Alpine (nhẹ nhất)
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
