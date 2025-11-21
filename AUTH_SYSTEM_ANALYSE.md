# 🔐 Authenticatie Systeem - Volledige Analyse

## 📋 Overzicht

DatingAssistent gebruikt een **JWT-based authenticatie systeem** met:
- JWT tokens (7 dagen geldig)
- Cookie + LocalStorage combinatie
- bcrypt password hashing
- Rate limiting op login endpoints
- Middleware voor route protection

---

## 🔑 Authenticatie Flow

### 1. **Registratie** (`/register`)

#### Flow:
```
Gebruiker → Registration Form → /api/auth/register → Database → JWT Token → Cookie + LocalStorage
```

#### Stappen:
1. Gebruiker vult formulier in (email, wachtwoord, naam)
2. API endpoint `/api/auth/register`:
   - Valideert input
   - Checkt of email al bestaat
   - Hash wachtwoord met bcrypt (10 rounds)
   - Maakt user record in database
   - Genereert JWT token (7 dagen geldig)
   - Retourneert user data + token
3. Frontend slaat token op:
   - LocalStorage: `datespark_auth_token`
   - Cookie: `datespark_auth_token` (httpOnly: false in dev, true in prod)
4. Gebruiker wordt automatisch ingelogd
5. Redirect naar onboarding/dashboard

#### Database Schema:
```sql
INSERT INTO users (email, display_name, password_hash, created_at)
VALUES (?, ?, ?, CURRENT_TIMESTAMP)
```

---

### 2. **Login** (`/login`)

#### Flow:
```
Gebruiker → Login Form → /api/auth/login → Database verificatie → JWT Token → Cookie + LocalStorage
```

#### Stappen:
1. Gebruiker vult email + wachtwoord in
2. **Rate Limiting** check:
   - Max 5 pogingen per 15 minuten per IP
   - Bij overschrijding: 429 Too Many Requests
3. API endpoint `/api/auth/login`:
   - Zoekt user in database op email
   - Vergelijkt wachtwoord met bcrypt hash
   - Bij succes:
     - Genereert JWT token
     - Update `last_login` timestamp
     - Retourneert user data + token
4. Frontend slaat token op:
   - LocalStorage: `datespark_auth_token`
   - Cookie: `datespark_auth_token`
5. Laadt user profiel van database
6. Check welcome tour (eerste login)
7. Redirect naar dashboard

#### Security Features:
- ✅ Rate limiting (5 attempts / 15 min)
- ✅ bcrypt password verification
- ✅ Generic error messages (geen hint of email bestaat)
- ✅ Logging van login attempts
- ✅ Last login timestamp tracking

---

### 3. **Session Verificatie** (`/api/auth/verify`)

#### Wanneer:
- Bij page load (mounting van UserProvider)
- Bij page navigatie
- Bij protected API calls

#### Flow:
```
LocalStorage/Cookie → /api/auth/verify → JWT verificatie → User data
```

#### Stappen:
1. Haalt token uit LocalStorage (primary) of Cookie (fallback)
2. Stuurt token naar `/api/auth/verify`
3. Backend verifieert JWT signature
4. Bij valid token: retourneert user data
5. Bij invalid: token wordt verwijderd, redirect naar login

---

### 4. **Logout** (`/logout`)

#### Flow:
```
Gebruiker → Logout button → /api/auth/logout → Clear cookie → Clear LocalStorage → Redirect
```

#### Stappen:
1. Gebruiker klikt logout button (in header)
2. Frontend:
   - Verwijdert token uit LocalStorage
   - Roept `/api/auth/logout` aan
3. Backend:
   - Verwijdert cookie (maxAge: 0)
4. Frontend:
   - Cleared user state (setUser(null))
   - Cleared profile state (setUserProfile(null))
5. Redirect naar homepage

---

## 🛡️ Security Implementatie

### JWT Token Structure

**Payload**:
```json
{
  "user": {
    "id": 123,
    "email": "user@example.com",
    "displayName": "User Name"
  },
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Security Settings**:
- Algorithm: HS256
- Secret: `process.env.JWT_SECRET` (required in production)
- Expiry: 7 days
- Stored in: LocalStorage (primary) + Cookie (backup)

### Password Security

**bcrypt Hashing**:
```typescript
// Registration/Password Change
const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds

// Login verification
const isValid = await bcrypt.compare(password, user.password_hash);
```

### Rate Limiting

**Login Endpoint** (`/api/auth/login`):
- **Limit**: 5 attempts per 15 minutes
- **Identifier**: IP address
- **Response**: 429 Too Many Requests
- **Headers**:
  - `X-RateLimit-Limit: 5`
  - `X-RateLimit-Remaining: X`
  - `X-RateLimit-Reset: timestamp`

### Cookie Configuration

```typescript
{
  httpOnly: false,        // false in dev (for debugging), true in prod
  secure: NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'lax',       // CSRF protection
  maxAge: 7 * 24 * 60 * 60,  // 7 days
  path: '/',
}
```

---

## 🚪 Route Protection

### Middleware (`middleware.ts`)

**Protected Routes**:
- `/dashboard/*`
- `/dashboard/subscription`
- `/dashboard/settings`
- `/dashboard/community`
- `/courses`
- `/community/forum`
- `/profile-analysis`

**Public Routes**:
- `/` (homepage)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/blog`
- `/contact`

**Onboarding Route**:
- `/onboarding` - Always accessible (but requires auth)

**Admin Routes**:
- `/admin/*` - Protected (admin check in layout)

### Protection Flow:

```
User navigates to /dashboard
    ↓
Middleware checks auth cookie
    ↓
Has token? → Verify JWT
    ↓
Valid? → Check journey completion
    ↓
Journey complete? → Allow access
    ↓
Journey incomplete? → Redirect to /onboarding
    ↓
No token? → Redirect to /login
```

---

## 📱 Client-Side Auth (UserProvider)

### State Management

**UserContext** provides:
```typescript
{
  user: User | null,              // Current user data
  userProfile: UserProfile | null, // User profile/preferences
  loading: boolean,               // Loading state
  error: string | null,           // Error messages
  login: (email, pass) => Promise<void>,
  logout: () => Promise<void>,
  signup: (email, pass, name?) => Promise<{user, token}>,
  updateProfile: (profile) => void,
  isUpdatingProfile: boolean,
  refreshUser: () => Promise<void>,
}
```

### Auto-Login on Mount

```typescript
useEffect(() => {
  // 1. Check LocalStorage for token
  let token = localStorage.getItem('datespark_auth_token');

  // 2. Fallback to cookie if not in LocalStorage
  if (!token) {
    token = getCookie('datespark_auth_token');
    if (token) {
      localStorage.setItem('datespark_auth_token', token);
    }
  }

  // 3. Verify token with backend
  if (token) {
    fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}, []);
```

### Auto-Redirect Logic

```typescript
// Redirect to login if accessing protected page without auth
useEffect(() => {
  const isProtectedPage = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/admin');

  if (!user && isProtectedPage) {
    if (pathname.startsWith('/admin')) {
      router.replace('/admin/login');  // Admin login
    } else {
      router.replace('/login');         // User login
    }
  }
}, [user, pathname]);
```

---

## 🔄 User Journey Flow

### New User Registration:
```
1. Register at /register
   ↓
2. Auto-login (token saved)
   ↓
3. Redirect to /onboarding
   ↓
4. Complete onboarding journey
   ↓
5. Journey marked complete in DB
   ↓
6. Access to /dashboard unlocked
```

### Returning User Login:
```
1. Login at /login
   ↓
2. Token verification
   ↓
3. Check journey status
   ↓
4. Journey complete? → /dashboard
   ↓
5. Journey incomplete? → /onboarding
```

---

## 🛠️ API Endpoints

### Auth Endpoints

| Endpoint | Method | Purpose | Rate Limited |
|----------|--------|---------|--------------|
| `/api/auth/register` | POST | Create new user | ❌ No |
| `/api/auth/login` | POST | Login user | ✅ Yes (5/15min) |
| `/api/auth/verify` | GET | Verify JWT token | ❌ No |
| `/api/auth/logout` | POST | Logout user | ❌ No |

### Protected Endpoint Pattern

```typescript
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  // Verify authentication
  const user = await requireAuth(request);

  // User is guaranteed authenticated here
  // Access user.id, user.email, user.displayName

  return NextResponse.json({ success: true });
}
```

### Admin Endpoint Pattern

```typescript
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  // Verify admin access
  const admin = await requireAdmin(request);

  // User is guaranteed to be an admin

  return NextResponse.json({ success: true });
}
```

---

## 🔍 Session Management

### Token Storage Priority:

1. **Primary**: LocalStorage (`datespark_auth_token`)
   - Fast client-side access
   - Persists across tabs
   - Used for API calls

2. **Backup**: HTTP Cookie (`datespark_auth_token`)
   - Server-side verification
   - Automatic expiry
   - Fallback if LocalStorage cleared

### Token Sync:

```typescript
// On login: Both locations updated
localStorage.setItem('datespark_auth_token', token);
cookie.set('datespark_auth_token', token);

// On load: Sync if mismatch
if (!localStorage.token && cookie.token) {
  localStorage.setItem('datespark_auth_token', cookie.token);
}

// On logout: Both cleared
localStorage.removeItem('datespark_auth_token');
cookie.set('datespark_auth_token', '', { maxAge: 0 });
```

---

## 🚨 Error Handling

### Common Error Scenarios:

| Scenario | HTTP Status | Frontend Handling |
|----------|-------------|-------------------|
| Invalid credentials | 401 Unauthorized | Show error message |
| Rate limit exceeded | 429 Too Many Requests | Show retry time |
| Token expired | 401 Unauthorized | Clear token, redirect to login |
| Token invalid | 401 Unauthorized | Clear token, redirect to login |
| Server error | 500 Internal Server Error | Show generic error |
| Journey incomplete | 302 Redirect | Redirect to /onboarding |

### Error Messages:

**Security Best Practice**: Generic messages to prevent user enumeration
```typescript
// ✅ Good (same message for both cases)
"Invalid email or password"

// ❌ Bad (reveals if email exists)
"Email not found"
"Incorrect password"
```

---

## 📊 Database Schema

### Users Table:
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  subscription_type VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user',  -- 'user' or 'admin'
  ...
);
```

### User Profiles Table:
```sql
CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  age INTEGER,
  gender VARCHAR(50),
  interests TEXT[],
  bio TEXT,
  location VARCHAR(255),
  dating_goals TEXT,
  ...
);
```

---

## ✅ Security Checklist

- [x] Passwords hashed with bcrypt (10 rounds)
- [x] JWT tokens signed with secret
- [x] JWT_SECRET required in production
- [x] Rate limiting on login endpoint
- [x] Generic error messages (no user enumeration)
- [x] HTTPS-only cookies in production
- [x] httpOnly cookies (true in prod, false in dev for debugging)
- [x] SameSite: lax (CSRF protection)
- [x] Token expiry (7 days)
- [x] Last login timestamp tracking
- [x] Middleware route protection
- [x] Admin role verification
- [x] User access verification helpers

---

## ⚠️ Security Recommendations

### Current Issues:

1. **httpOnly Cookie** is `false` in development
   - **Risk**: XSS attacks can steal token
   - **Fix**: Set to `true` always, use separate dev debugging

2. **JWT Secret Warning** in development
   - **Risk**: Weak secret in dev could leak to prod
   - **Fix**: Ensure JWT_SECRET is set in all environments

3. **LocalStorage Primary Storage**
   - **Risk**: Vulnerable to XSS
   - **Alternative**: Use httpOnly cookies only (more secure)

### Best Practices Applied:

- ✅ Never log passwords or tokens
- ✅ Use prepared statements (SQL injection prevention)
- ✅ Rate limiting on sensitive endpoints
- ✅ Generic error messages
- ✅ Password complexity requirements (frontend)
- ✅ Token expiry mechanism
- ✅ Secure cookie settings in production

---

## 🔮 Toekomstige Verbeteringen

### Fase 1 - Security:
- [ ] 2FA (Two-Factor Authentication)
- [ ] Email verification op registratie
- [ ] Password reset functionaliteit (al aanwezig, testen)
- [ ] Session management (meerdere devices)
- [ ] Suspicious login detection

### Fase 2 - Features:
- [ ] "Remember me" optie (30 dagen token)
- [ ] Social login (Google, Facebook)
- [ ] Biometric authentication (mobile)
- [ ] Password strength meter
- [ ] Account lockout na x failed attempts

### Fase 3 - Advanced:
- [ ] OAuth2 implementation
- [ ] Refresh tokens
- [ ] Device fingerprinting
- [ ] IP whitelisting voor admin
- [ ] Audit logs voor alle auth events

---

## 📝 Code Voorbeelden

### Protected Component:
```tsx
'use client';

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedComponent() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Welcome {user.name}!</div>;
}
```

### Protected API Route:
```typescript
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const user = await requireAuth(request);

    // Your protected logic here
    return NextResponse.json({
      success: true,
      userId: user.id
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

---

## 🎯 Conclusie

Het authenticatiesysteem van DatingAssistent is:

**Sterke punten:**
- ✅ Solide JWT implementatie
- ✅ bcrypt password hashing
- ✅ Rate limiting bescherming
- ✅ Middleware route protection
- ✅ Dual storage (cookie + localStorage)
- ✅ Clean separation of concerns

**Aandachtspunten:**
- ⚠️ httpOnly: false in development
- ⚠️ LocalStorage primary storage (XSS risk)
- 💡 Overweeg email verification
- 💡 Implementeer 2FA voor extra beveiliging

**Overall**: Professional, veilig en schaalbaar systeem! 🚀
