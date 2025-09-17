# Multi-stage build for Vue 3 (Vite)

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# 2) Runtime stage (Nginx)
FROM nginx:1.27-alpine AS runtime

# Copy nginx config for SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets//
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


