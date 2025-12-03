# Admin Panel - Professional Setup Guide

## 🎯 Overzicht

Het admin panel is een volledige administratie interface voor DatingAssistent met role-based access control (RBAC) en real-time dashboard statistieken.

## 🔐 Admin Credentials

**Primary Admin Account:**
- Email: `admin@datingassistent.nl`
- Temporary Password: `AdminDatingSpark2024!`
- **⚠️ BELANGRIJK**: Wijzig dit wachtwoord direct na eerste login!

**Additional Admin Accounts:**
- `v.munster@weareimpact.nl`
- `kak2@365ways.nl`

## 🏗️ Architectuur

### Database Schema
```sql
-- Users tabel heeft een 'role' kolom
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
CREATE INDEX idx_users_role ON users(role);

-- Admin users hebben role = 'admin'
UPDATE users SET role = 'admin' WHERE email = 'admin@datingassistent.nl';
```

### Authentication Flow
1. **Login**: User logt in via `/admin/login`
2. **JWT Token**: Bij succesvolle login wordt een JWT token aangemaakt
3. **Role Check**: Admin layout checkt via `/api/auth/check-admin` of user admin is
4. **Authorization**: Alle admin API routes gebruiken `requireAdmin()` middleware

### Security Features
- ✅ Role-based access control (RBAC)
- ✅ JWT token authentication
- ✅ Database role verification
- ✅ Automatic redirect voor non-admins
- ✅ Admin-only API endpoints
- ✅ Secure password hashing (bcrypt)

## 📊 Admin Panel Features

### Dashboard (`/admin`)
- Real-time statistieken van database
- Totaal aantal gebruikers
- Actieve gebruikers (laatste 7 dagen)
- Premium gebruikers
- Conversion rate
- Recent activity feed
- System health monitoring

### Beschikbare Secties
1. **Dashboard** - Overzicht en key metrics
2. **Users** - Gebruikersbeheer en analytics
3. **Analytics** - Gedetailleerde gebruikersdata
4. **Coupons** - Coupon codes beheren
5. **Content** - Content en assessment beheer
6. **Security** - Beveiliging en monitoring
7. **Settings** - Systeem configuratie

## 🛠️ API Endpoints

### Admin Authentication
```typescript
GET /api/auth/check-admin
// Returns: { isAdmin: boolean, userId: number, email: string }
```

### Dashboard Stats
```typescript
GET /api/admin/dashboard
// Requires: Admin authentication
// Returns: DashboardStats with real-time database data
```

## 🚀 Usage

### Voor Nieuwe Admin Users
```bash
# Voer setup script uit
node setup-admin-pro.js

# Dit script:
# 1. Checkt of admin@datingassistent.nl bestaat
# 2. Creëert de user indien nodig met veilig wachtwoord
# 3. Zet role op 'admin'
# 4. Toont alle admin users
```

### Login Process
1. Ga naar: `http://localhost:9000/admin/login`
2. Login met admin credentials
3. Je wordt automatisch doorgestuurd naar dashboard
4. Verander je wachtwoord in Settings (coming soon)

### Non-Admin Users
- Krijgen automatisch "Toegang geweigerd" scherm
- Worden doorgestuurd naar `/dashboard`
- Kunnen geen admin API endpoints aanroepen

## 📁 Code Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx           # Admin layout met role checking
│   │   ├── page.tsx              # Dashboard met real-time stats
│   │   ├── login/
│   │   │   └── page.tsx          # Admin login pagina
│   │   └── [andere secties]/
│   └── api/
│       ├── admin/
│       │   └── dashboard/
│       │       └── route.ts      # Dashboard stats API
│       └── auth/
│           └── check-admin/
│               └── route.ts      # Admin check API
└── lib/
    ├── auth.ts                   # Main auth library met isAdmin()
    └── admin-auth.ts             # Dedicated admin auth module
```

## 🔧 Maintenance Scripts

### Setup Admin User
```bash
node setup-admin-pro.js
```
Professioneel script om admin users te setup en verifiëren.

## 🎨 UI/UX Features

### Admin Layout
- Responsive sidebar navigatie
- Mobile-friendly met hamburger menu
- Admin badge en user info
- Quick logout functie
- Real-time status indicators

### Dashboard
- Live statistieken met auto-refresh
- Visual health indicators
- Recent activity timeline
- Quick action buttons
- Progress bars en metrics

## 🔒 Security Best Practices

1. **Wachtwoorden**
   - Gebruik sterke wachtwoorden (min. 16 karakters)
   - Wijzig default wachtwoorden direct
   - Gebruik bcrypt hashing (salt rounds: 10)

2. **Access Control**
   - Alle admin routes zijn beveiligd met `requireAdmin()`
   - JWT tokens verlopen na 7 dagen
   - Role verification bij elke request

3. **Environment Variables**
   - `JWT_SECRET` moet worden ingesteld in productie
   - `ADMIN_EMAILS` voor fallback admin lijst
   - Nooit hardcoded wachtwoorden in code

## 📈 Future Enhancements

- [ ] Admin user management UI
- [ ] Password change functionaliteit
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging voor admin acties
- [ ] Email notifications voor admin events
- [ ] Advanced analytics en reporting
- [ ] Bulk user operations

## ⚡ Performance

- Dashboard statistieken worden gecached
- Optimale SQL queries met indexen
- Edge runtime voor snelle responses
- Lazy loading voor grote datasets

## 🐛 Troubleshooting

### "Toegang geweigerd" bij login
1. Verifieer dat user role = 'admin' in database
2. Check of JWT token geldig is
3. Controleer `/api/auth/check-admin` response

### Dashboard laadt niet
1. Check browser console voor errors
2. Verifieer dat `/api/admin/dashboard` bereikbaar is
3. Check database connectie

### Role kolom bestaat niet
```bash
# Voer migratie uit
node setup-admin-pro.js
```

## 📞 Support

Voor vragen of problemen met het admin panel:
1. Check deze documentatie
2. Check console logs in browser en server
3. Verifieer database schema en data

---

**Laatste update**: 3 december 2025
**Versie**: 1.0.0
**Status**: Production Ready ✅
