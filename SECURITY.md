# Dokumentasi Keamanan SMART-MBG

## 🛡️ Security Features

### 1. Authentication & Authorization
- **JWT Token**: Menggunakan JSON Web Token untuk autentikasi
- **Password Hashing**: Bcrypt dengan 10 rounds
- **Role-Based Access Control (RBAC)**: Setiap endpoint dilindungi berdasarkan role
- **Token Expiration**: Token berlaku 7 hari, bisa di-refresh

### 2. Input Validation & Sanitization
- **Express Validator**: Validasi semua input dari user
- **Input Sanitization**: Escape HTML dan trim whitespace
- **SQL Injection Protection**: Menggunakan Sequelize ORM (parameterized queries)
- **NoSQL Injection Protection**: express-mongo-sanitize middleware
- **XSS Protection**: Helmet.js dengan Content Security Policy

### 3. Rate Limiting
- **General API**: 100 requests per 15 menit
- **Authentication**: 5 login attempts per 15 menit
- **File Upload**: 20 uploads per jam
- **IP-based**: Rate limiting berdasarkan IP address

### 4. File Upload Security
- **File Type Validation**: Hanya menerima image/jpeg, image/png, image/webp
- **File Size Limit**: Maksimal 5MB per file
- **Image Validation**: Validasi dimensi dan format gambar
- **Face Cropping**: Otomatis crop bagian atas gambar (area wajah)
- **Cloud Storage**: File disimpan di Cloudinary dengan secure URL

### 5. Data Privacy
- **No Face Storage**: Foto di-crop untuk menghindari penyimpanan wajah
- **Data Encryption**: Data sensitif dienkripsi
- **Access Control**: User hanya bisa akses data mereka sendiri
- **SPPG Read-Only**: Role SPPG hanya bisa membaca data, tidak bisa edit

### 6. API Security
- **CORS**: Configured untuk hanya allow frontend URL
- **Helmet.js**: Security headers (XSS, clickjacking, dll)
- **HTTPS**: Wajib di production
- **Request Logging**: Log semua request untuk audit

### 7. Error Handling
- **No Information Leakage**: Error message tidak expose detail sistem
- **Structured Errors**: Error response yang konsisten
- **Error Logging**: Log error untuk monitoring

## 🔒 Security Best Practices

### Password Requirements
- Minimal 8 karakter
- Maksimal 128 karakter
- Harus mengandung huruf kapital
- Harus mengandung huruf kecil
- Harus mengandung angka

### API Usage
- Selalu gunakan HTTPS di production
- Jangan expose JWT secret di client
- Gunakan environment variables untuk secrets
- Rotate secrets secara berkala

### Database
- Gunakan connection pooling
- Backup database secara rutin
- Monitor query performance
- Gunakan indexes untuk query optimization

### File Upload
- Validasi file type dan size di client dan server
- Scan file untuk malware (optional, bisa ditambahkan)
- Limit jumlah upload per user
- Clean up old/unused files

## 🚨 Security Checklist

### Before Deployment
- [ ] Semua environment variables sudah di-set
- [ ] JWT_SECRET sudah di-generate dengan aman
- [ ] Database password kuat
- [ ] CORS sudah dikonfigurasi dengan benar
- [ ] Rate limiting sudah diaktifkan
- [ ] HTTPS sudah diaktifkan
- [ ] Error logging sudah dikonfigurasi
- [ ] Backup strategy sudah ada

### Regular Maintenance
- [ ] Update dependencies secara rutin
- [ ] Review security logs
- [ ] Audit user access
- [ ] Test rate limiting
- [ ] Monitor suspicious activities
- [ ] Backup database
- [ ] Review error logs

## 🔐 Environment Variables

Pastikan semua environment variables berikut di-set dengan aman:

```env
# JWT Secrets (generate dengan: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Database (gunakan password kuat)
DB_PASSWORD=strong-password-here

# Cloudinary (dari dashboard Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (optional)
OPENAI_API_KEY=your-openai-key
```

## 📝 Security Incident Response

Jika terjadi security incident:

1. **Isolate**: Segera isolasi sistem yang terpengaruh
2. **Assess**: Evaluasi scope dan impact
3. **Contain**: Cegah penyebaran lebih lanjut
4. **Notify**: Laporkan ke tim security/admin
5. **Recover**: Restore dari backup jika perlu
6. **Document**: Dokumentasikan incident dan response

## 🔍 Security Monitoring

Monitor hal-hal berikut:
- Failed login attempts
- Unusual API usage patterns
- Large file uploads
- Access from unknown IPs
- Error rates
- Database query performance

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

