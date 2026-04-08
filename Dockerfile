# ── Build stage not needed for a pure static site ──────────────────────────
FROM nginx:alpine

# gettext provides envsubst, used by docker-entrypoint.sh
RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html

# Copy static application files
COPY . .

# Nginx site configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint script generates config.js at container startup from env vars
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
