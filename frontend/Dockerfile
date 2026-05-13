# Stage 1: Compile React App
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Build assets with optimized bundle compression
RUN npm run build

# Stage 2: Serve static content with Nginx
FROM nginx:1.25-alpine

# Copy built dist artifacts
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy server config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
