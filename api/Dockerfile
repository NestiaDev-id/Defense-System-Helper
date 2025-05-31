# Menggunakan base image Node.js
FROM node:18-alpine

WORKDIR /usr/src/app

# Salin package.json dan package-lock.json (atau yarn.lock, pnpm-lock.yaml)
# Jika ini adalah bagian dari monorepo dengan workspace, Anda mungkin perlu menyalin struktur yang lebih tinggi
COPY package*.json ./
# Jika ada direktori lain yang di-link oleh workspace, salin juga
# COPY ../shared-library ./shared-library 

# Instal dependensi
# Jika menggunakan npm workspaces dari root, Anda mungkin perlu menjalankan ini di root
RUN npm install 
# Jika ini hanya untuk API dan dependensinya ada di package.json root, maka RUN npm ci --only=production dari root mungkin lebih baik

# Salin semua file aplikasi
# Ini mengasumsikan Dockerfile ada di root proyek, dan kita menyalin semuanya
COPY . .
# Jika Dockerfile ada di dalam direktori 'api', path COPY mungkin perlu disesuaikan

# Build TypeScript (jika belum di-build sebelum membuat image)
# Anda mungkin memiliki skrip build di package.json
RUN npm run build # Asumsi skrip 'build' Anda (misalnya tsc) mengeluarkan ke 'dist'

# Expose port yang digunakan aplikasi Anda
EXPOSE 3000 

# Perintah untuk menjalankan aplikasi
# Ini mengasumsikan output build ada di 'dist' dan entry point adalah 'dist/src/index.js'
# atau 'dist/api/index.js' tergantung konfigurasi tsconfig dan struktur output
CMD [ "node", "dist/src/index.js" ] # Sesuaikan dengan entry point Anda