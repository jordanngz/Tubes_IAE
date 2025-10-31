# 🏪 Halaman Manajemen Toko - Dokumentasi

## 📍 Lokasi File
- **Halaman**: `/app/seller/stores/page.tsx`
- **Layout**: `/app/seller/layout.tsx`
- **URL**: `http://localhost:3000/seller/stores`

## 🎨 Fitur Utama

### 1. **Header Section**
- Judul halaman dengan icon 🏪
- Deskripsi singkat
- Button "Edit Toko" / "Simpan" (toggle mode edit)

### 2. **Status Banner**
- Status toko (Buka/Tutup) dengan icon visual
- Informasi real-time
- Toggle button untuk mengubah status

### 3. **Tab Navigation** (4 Tab Utama)

#### Tab 1: **Profil Toko** 🏪
**Grid 2 Kolom (Responsive)**

**Kolom Kiri - Profil Toko:**
- Banner placeholder (aspect ratio 3:1)
- Logo toko (80x80px, rounded-xl)
- Nama toko & slug
- Deskripsi
- Email kontak
- Nomor telepon
- Status badge (pending/approved/rejected)
- Rating & jumlah ulasan

**Kolom Kanan - Alamat Toko:**
- Label alamat
- Nama penerima
- Nomor telepon
- Alamat lengkap (line1, line2, city, state, postal code)
- Link "Lihat di Peta" (dengan koordinat lat/long)

#### Tab 2: **Operasional** ⏰
**Grid 2 Kolom (Responsive)**

**Kolom Kiri - Jam Operasional:**
- 7 Hari dalam seminggu
- Status per hari (✅ buka / 🔒 tutup)
- Jam operasional atau "Tutup"
- Visual card per hari dengan hover effect

**Kolom Kanan - Opsi Pengiriman:**
- List kurir yang tersedia (JNE, POS, dll)
- Status aktif/non-aktif dengan toggle switch
- Service code
- Estimasi hari pengiriman
- Button "Tambah Kurir"

#### Tab 3: **Verifikasi** ✅
**Single Column Layout**

- **Status Verifikasi Card:**
  - Icon status besar
  - Nama toko yang diajukan
  - Deskripsi bisnis
  - Badge status (submitted/approved/rejected)

- **Dokumen yang Diunggah:**
  - Grid 2 kolom (responsive)
  - Kartu per dokumen (KTP, NPWP, dll)
  - Preview link
  - Button "Upload Dokumen Tambahan"

#### Tab 4: **Kebijakan** 📜
**Card per Kebijakan**

- Kebijakan Pengembalian Barang
- Kebijakan Pengiriman
- Kebijakan Privasi
- Setiap card punya button "Edit"
- Content text yang dapat diedit

### 4. **Activity Log Section** 📊
- Timeline aktivitas terbaru
- Numbered badge per aktivitas
- Deskripsi aktivitas
- Timestamp dalam format lokal Indonesia
- Hover effect per item

## 🎨 Design Features

### Color Palette
- Primary: Orange-to-red gradients
- Background: Cream/amber tones
- Accent: Green untuk status aktif
- Status colors: Yellow (pending), Blue (submitted), Green (approved), Red (rejected)

### Interactive Elements
- ✨ **Hover Effects**: Scale & shadow pada cards
- 🎯 **Active States**: Tab highlighting dengan gradient
- 💫 **Animations**: Fade-in, scale transitions
- 🔄 **Toggle Switches**: Smooth transitions untuk delivery options
- 📱 **Responsive**: Mobile-first, 1 column → 2 columns pada lg screens

### Components Used
- Backdrop blur cards
- Gradient backgrounds
- Rounded borders (rounded-xl, rounded-2xl)
- Shadow layers (shadow-lg, shadow-xl)
- Icon emojis untuk visual appeal
- Badge pills untuk status

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Stacked elements
- Full-width buttons
- Compressed spacing

### Tablet (768px - 1024px)
- 2-column grid untuk cards
- Better spacing
- Larger touch targets

### Desktop (≥ 1024px)
- Full 2-column layouts
- Sidebar visible
- Optimal spacing
- Enhanced hover effects

## 🔧 Future Enhancements

1. **Edit Mode Implementation**
   - Form inputs saat edit mode aktif
   - Validation
   - Save/cancel actions

2. **Image Upload**
   - Drag & drop untuk logo/banner
   - Preview sebelum upload
   - Crop tool

3. **Map Integration**
   - Google Maps embed
   - Pin location picker
   - Geocoding

4. **Real-time Updates**
   - WebSocket untuk notifikasi
   - Auto-refresh activity log
   - Status sync

5. **Analytics**
   - Store performance metrics
   - Visitor statistics
   - Conversion tracking

## 🚀 How to Test

1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/seller/stores`

3. Test interactions:
   - Click tabs untuk switch content
   - Hover pada cards untuk effects
   - Test responsive dengan resize browser
   - Click toggle switches
   - Try edit mode button

## 📦 Data Structure

Halaman ini menggunakan data placeholder yang match dengan JSON structure yang diberikan:
- `store_profile` → Tab Profil
- `store_address` → Tab Profil (kolom kanan)
- `store_operational_settings` → Tab Operasional
- `store_verification` → Tab Verifikasi
- `store_policy_templates` → Tab Kebijakan
- `store_activity_log` → Activity Log Section

## ✅ Checklist

- [x] Header dengan title & actions
- [x] Status banner
- [x] 4 Tab navigation
- [x] Profil Toko section
- [x] Alamat section
- [x] Jam Operasional section
- [x] Opsi Pengiriman section
- [x] Verifikasi section
- [x] Kebijakan section
- [x] Activity Log
- [x] Responsive layout
- [x] Interactive elements
- [x] Color consistency
- [x] TypeScript types
- [x] No compile errors

---

**Created**: November 1, 2025  
**Framework**: Next.js 15 + React 19 + TypeScript  
**Styling**: Tailwind CSS 4
