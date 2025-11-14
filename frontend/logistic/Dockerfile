# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - OpenShift compatible
FROM registry.access.redhat.com/ubi8/nginx-120

# Switch to root to make changes
USER root

# Copy built files from builder stage
COPY --from=builder /app/dist /opt/app-root/src

# Create runtime config script that injects env vars into built files
RUN echo '#!/bin/sh\n\
set -e\n\
# Replace environment variables in runtime-config.js\n\
if [ -f /opt/app-root/src/runtime-config.js ]; then\n\
  envsubst < /opt/app-root/src/runtime-config.js > /opt/app-root/src/runtime-config.js.tmp\n\
  mv /opt/app-root/src/runtime-config.js.tmp /opt/app-root/src/runtime-config.js\n\
fi\n\
# Start nginx\n\
exec nginx -g "daemon off;"\n\
' > /opt/app-root/src/start.sh && chmod +x /opt/app-root/src/start.sh

# Create nginx config for SPA
RUN echo 'server {\n\
    listen 8080;\n\
    server_name _;\n\
    root /opt/app-root/src;\n\
    index index.html;\n\
    \n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    location /runtime-config.js {\n\
        add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
        add_header Pragma "no-cache";\n\
        add_header Expires 0;\n\
    }\n\
    \n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 1024;\n\
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;\n\
}\n\
' > /etc/nginx/nginx.d/default.conf

# Fix permissions for OpenShift (runs as arbitrary UID)
RUN chgrp -R 0 /opt/app-root && \
    chmod -R g=u /opt/app-root && \
    chgrp -R 0 /var/log/nginx && \
    chmod -R g=u /var/log/nginx && \
    chgrp -R 0 /var/lib/nginx && \
    chmod -R g=u /var/lib/nginx

# Switch back to non-root user (OpenShift requirement)
USER 1001

# Expose port 8080 (OpenShift default)
EXPOSE 8080

# Start with our custom script
CMD ["/opt/app-root/src/start.sh"]
