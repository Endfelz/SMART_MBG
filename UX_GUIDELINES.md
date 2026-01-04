# UX Guidelines - SMART-MBG

## 🎨 Design System

### Color Palette

#### Primary Colors (Hijau)
- **Primary 50**: `#f0fdf4` - Background light
- **Primary 500**: `#22c55e` - Main action buttons
- **Primary 600**: `#16a34a` - Hover states
- **Primary 700**: `#15803d` - Active states

#### Secondary Colors (Biru)
- **Secondary 500**: `#3b82f6` - Secondary actions
- **Secondary 600**: `#2563eb` - Links, info badges

#### Neutral Colors (Putih & Abu-abu)
- **White**: `#ffffff` - Cards, backgrounds
- **Neutral 50**: `#f9fafb` - Page background
- **Neutral 200**: `#e5e7eb` - Borders
- **Neutral 600**: `#4b5563` - Text secondary
- **Neutral 900**: `#111827` - Text primary

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: Bold, clear hierarchy
- **Body**: Regular, readable size (16px base)

### Spacing
- Consistent spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px
- Card padding: 24px (1.5rem)
- Section spacing: 32px (2rem)

## 🎯 UX Principles

### 1. Clarity
- **Clear Labels**: Setiap input memiliki label yang jelas
- **Helpful Hints**: Tips dan instruksi di tempat yang tepat
- **Visual Feedback**: Status jelas dengan warna dan icon

### 2. Consistency
- **Button Styles**: Konsisten di seluruh aplikasi
- **Form Layout**: Struktur form yang sama
- **Navigation**: Pola navigasi yang konsisten

### 3. Feedback
- **Loading States**: Tampilkan loading saat proses
- **Success Messages**: Konfirmasi saat aksi berhasil
- **Error Messages**: Pesan error yang jelas dan actionable
- **Toast Notifications**: Feedback real-time dengan react-hot-toast

### 4. Accessibility
- **Keyboard Navigation**: Semua fungsi bisa diakses dengan keyboard
- **Screen Reader**: Label dan ARIA attributes
- **Color Contrast**: Kontras warna memenuhi WCAG AA
- **Focus States**: Visible focus indicators

### 5. Mobile-First
- **Responsive Design**: Optimal di semua device
- **Touch Targets**: Minimal 44x44px untuk touch
- **Readable Text**: Minimal 16px untuk body text

## 📱 Component Patterns

### Buttons
```tsx
// Primary Action
<button className="btn btn-primary">Submit</button>

// Secondary Action
<button className="btn btn-secondary">Cancel</button>

// Outline
<button className="btn btn-outline">View Details</button>

// Ghost
<button className="btn btn-ghost">Skip</button>
```

### Forms
- Label selalu di atas input
- Error message di bawah input
- Helper text dengan warna neutral-500
- Required fields ditandai dengan *

### Cards
- White background dengan shadow subtle
- Rounded corners (12px)
- Padding konsisten (24px)
- Border subtle untuk definition

### Badges
```tsx
// Success
<span className="badge badge-success">Habis</span>

// Warning
<span className="badge badge-warning">Sisa Sedikit</span>

// Error
<span className="badge badge-error">Sisa Banyak</span>

// Info
<span className="badge badge-info">Pending</span>
```

## 🎭 User Flows

### Siswa Flow
1. **Login** → Dashboard Siswa
2. **Upload Foto** → Pilih file → Preview → Upload → Lihat hasil
3. **Isi Alasan** (jika ada sisa) → Pilih alasan → Submit
4. **Lihat Poin** → Dashboard → History poin
5. **Upload Limbah** → Pilih jenis → Upload foto → Tunggu verifikasi

### Guru Flow
1. **Login** → Dashboard Guru
2. **Verifikasi Absen** → List pending → Verifikasi
3. **Verifikasi Limbah** → List pending → Approve/Reject
4. **Lihat Statistik** → Dashboard dengan grafik

### Admin Flow
1. **Login** → Dashboard Admin
2. **Kelola User** → List users → Edit/Delete
3. **Lihat Statistik** → Dashboard lengkap
4. **Export Data** → Filter → Download CSV

## 💡 UX Best Practices

### Form Design
- ✅ Group related fields
- ✅ Show validation errors immediately
- ✅ Provide helpful placeholder text
- ✅ Disable submit button saat loading
- ✅ Show character count untuk textarea

### Error Handling
- ✅ Clear error messages
- ✅ Suggest solutions
- ✅ Highlight error fields
- ✅ Don't lose user input

### Loading States
- ✅ Show loading spinner
- ✅ Disable actions saat loading
- ✅ Skeleton screens untuk content loading
- ✅ Progress indicators untuk long operations

### Success States
- ✅ Clear success message
- ✅ Visual confirmation (checkmark)
- ✅ Next action suggestion
- ✅ Auto-redirect jika perlu

## 🎨 Visual Hierarchy

1. **Primary Actions**: Hijau (Primary 600)
2. **Secondary Actions**: Biru (Secondary 600)
3. **Destructive Actions**: Merah (Red 600)
4. **Text Hierarchy**: 
   - Headings: Neutral 900, Bold
   - Body: Neutral 700, Regular
   - Secondary: Neutral 600, Regular
   - Muted: Neutral 500, Regular

## 📊 Feedback Patterns

### Toast Notifications
- **Success**: Green, checkmark icon
- **Error**: Red, X icon
- **Info**: Blue, info icon
- **Warning**: Yellow, warning icon

### Status Badges
- **Habis**: Green badge
- **Sisa Sedikit**: Yellow badge
- **Sisa Banyak**: Red badge
- **Pending**: Blue badge

## 🚀 Performance

- **Image Optimization**: Lazy loading, thumbnails
- **Code Splitting**: Route-based splitting
- **Caching**: API response caching
- **Loading States**: Prevent multiple submissions

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🎯 User Goals

### Siswa
- Upload foto absen dengan mudah
- Lihat status dan poin
- Upload pemanfaatan limbah
- Dapat saran dari AI

### Guru
- Verifikasi absen dengan cepat
- Lihat statistik kelas
- Verifikasi pemanfaatan limbah

### Admin
- Monitor seluruh sistem
- Export data untuk analisis
- Kelola users

### SPPG
- Lihat data evaluasi menu
- Export data untuk laporan
- Analisis alasan sisa makanan

