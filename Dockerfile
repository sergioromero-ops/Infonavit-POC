# Overridable base images (defaults are what Cloud Build uses)
ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:1.27-alpine

# ---- build stage: compile the Vite app ----
FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- serve stage: nginx on Cloud Run's $PORT ----
FROM ${NGINX_IMAGE}
# nginx's entrypoint runs envsubst on /etc/nginx/templates/*.template,
# so `listen ${PORT}` picks up the port Cloud Run injects (default 8080).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=8080
EXPOSE 8080
