# Stage 1: build Vite React app
FROM node:22-alpine AS build

WORKDIR /app

# Bake API base URL at build time. Empty = same-origin `/api/...` via nginx
# (see nginx.conf). Local default in code is http://localhost:8000.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: serve static assets + proxy /api → backend
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
