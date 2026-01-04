# Panduan Instalasi SMART-MBG

## 📋 Prerequisites

- Node.js 18+ dan npm/yarn
- PostgreSQL 12+
- Cloudinary account (untuk storage foto)
- OpenAI API key (optional, untuk AI assistant)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd smart-mbg
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# - Database credentials
# - JWT secrets
# - Cloudinary credentials
# - OpenAI API key (optional)

# Setup database
# Buat database PostgreSQL
createdb smart_mbg

# Run migrations (jika menggunakan Sequelize CLI)
npx sequelize-cli db:migrate

# Start development server
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# JWT (generate dengan: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_mbg
DB_USER=postgres
DB_PASSWORD=your-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (optional)
OPENAI_API_KEY=your-openai-key

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_MAX_SIZE=5242880

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🗄️ Database Setup

### Manual Setup (SQL)

Jalankan SQL berikut di PostgreSQL:

```sql
-- Create database
CREATE DATABASE smart_mbg;

-- Connect to database
\c smart_mbg;

-- Run migrations (lihat file migrations/)
```

### Using Sequelize CLI

```bash
cd backend

# Initialize Sequelize (jika belum)
npx sequelize-cli init

# Create migration
npx sequelize-cli migration:generate --name create-users

# Run migrations
npx sequelize-cli db:migrate

# Rollback migration
npx sequelize-cli db:migrate:undo
```

## 📦 Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## 🐳 Docker (Optional)

```dockerfile
# Dockerfile untuk backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## ✅ Verification

1. **Backend Health Check**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"OK","message":"SMART-MBG API is running"}`

2. **Frontend**
   - Buka `http://localhost:3000`
   - Should show login page

3. **Database Connection**
   - Check backend logs
   - Should see: `✅ Database connected`

## 🔍 Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL running
- Check credentials di `.env`
- Pastikan database sudah dibuat

### Port Already in Use
- Backend: Change `PORT` di `.env`
- Frontend: Change port dengan `npm run dev -- -p 3001`

### CORS Error
- Pastikan `FRONTEND_URL` di backend `.env` sesuai dengan frontend URL
- Check CORS configuration di `server.ts`

### File Upload Error
- Check Cloudinary credentials
- Pastikan file size tidak melebihi limit
- Check file type (hanya image)

## 📚 Next Steps

1. **Create Admin User**
   - Register melalui API atau langsung insert ke database
   - Set role sebagai 'admin'

2. **Configure Cloudinary**
   - Setup Cloudinary account
   - Get API credentials
   - Update `.env`

3. **Setup AI (Optional)**
   - Get OpenAI API key
   - Update `.env`
   - AI assistant akan menggunakan default suggestions jika tidak ada API key

4. **Test Features**
   - Login sebagai siswa
   - Upload foto absen
   - Test AI detection
   - Upload pemanfaatan limbah

## 🆘 Support

Jika ada masalah, check:
- `SECURITY.md` untuk security best practices
- `UX_GUIDELINES.md` untuk design guidelines
- Backend logs untuk error details
- Frontend console untuk client errors

