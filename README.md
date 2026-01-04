# SMART-MBG
Smart Monitoring & Recycling System for Makanan Bergizi Gratis

## 🛡️ Security Features
- JWT Authentication dengan refresh token
- Rate limiting untuk mencegah abuse
- Input validation & sanitization
- SQL injection protection (Sequelize ORM)
- XSS protection
- CORS configuration
- Helmet.js untuk security headers
- Password hashing dengan bcrypt (10 rounds)
- File upload validation
- Role-based access control (RBAC)

## 🎨 Design System
- **Primary Color**: Hijau (#10B981, #059669)
- **Secondary Color**: Biru (#3B82F6, #2563EB)
- **Neutral**: Putih (#FFFFFF), Abu-abu (#F9FAFB, #6B7280)
- **Success**: Hijau (#10B981)
- **Warning**: Kuning (#F59E0B)
- **Error**: Merah (#EF4444)

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database
npm run migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## 📁 Project Structure
```
smart-mbg/
├── backend/
│   ├── src/
│   │   ├── config/        # Database, cloudinary, etc
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth, validation, security
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # AI, image, points services
│   │   ├── utils/         # Helpers, validators
│   │   └── server.ts      # Entry point
│   └── migrations/        # Database migrations
├── frontend/
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # API, utilities
│   └── hooks/             # Custom hooks
└── shared/                # Shared types
```

