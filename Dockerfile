# Stage 1: Development and Build Environment
FROM node:20-alpine AS dev

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy the rest of the application files
COPY . .

# Expose port (Nginx reverse proxies http://frontend:80)
EXPOSE 80

# Start development server with file polling for docker volumes
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "80"]

# CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "80", "--watch", "false", "--poll", "2000"]

# Stage 2: Builder for production
FROM dev AS builder
RUN npm run build

# Stage 3: Serve the application with Nginx (production)
FROM nginx:alpine AS prod

# Copy the build output to replace the default nginx contents.
# Angular build:application builder outputs to dist/frontend/browser
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copy the Nginx configuration for Angular SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
