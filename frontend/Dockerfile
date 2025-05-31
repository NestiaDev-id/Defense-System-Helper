# Stage 1: Build the React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
# Jika frontend memiliki dependensi workspace dari root, Anda mungkin perlu menyalin package.json root juga
# COPY package.json package-lock.json ./ 
# RUN npm install --workspaces # Jika menggunakan npm workspaces
RUN npm install
COPY frontend/ ./
RUN npm run build # Menghasilkan output di /app/dist

# Stage 2: Serve static files with a lightweight server
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Anda mungkin perlu konfigurasi Nginx untuk SPA routing (mengarahkan semua ke index.html)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf # Contoh file konfigurasi Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]