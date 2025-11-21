# 🔐 Admin Panel - DatingAssistent

## Toegang tot Admin Panel

### Login
1. Ga naar: **http://localhost:9002/admin** (of je productie URL)
2. Log in met je admin email: `v_mun@hotmail.com`
3. Alleen whitelisted emails hebben toegang

### Admin Email Whitelist
Om meer admins toe te voegen, edit het bestand en voeg emails toe:
- `src/app/admin/page.tsx`
- `src/app/admin/blogs/page.tsx`
- `src/app/admin/reviews/page.tsx`
- `src/app/admin/analytics/page.tsx`
- `src/app/admin/users/page.tsx`

Zoek naar: `const ADMIN_EMAILS = ['v_mun@hotmail.com'];`

---

## 📊 Features

### 1. **Dashboard** (`/admin`)
- Overzicht verkopen, gebruikers, abonnementen
- Quick links naar alle beheer pagina's

### 2. **Blog Beheer** (`/admin/blogs`)
- ✅ Blogs aanmaken, bewerken, verwijderen
- ✅ Titel, excerpt, afbeelding, volledige content
- ✅ Markdown support voor content
- ✅ Preview van blogs in lijst

**Firestore Collectie:** `blogs`
```
{
  title: string
  excerpt: string
  content: string
  image: string
  createdAt: Timestamp
}
```

### 3. **Review Beheer** (`/admin/reviews`)
- ✅ Reviews aanmaken, bewerken, verwijderen
- ✅ Naam, rol, avatar, rating (1-5 sterren)
- ✅ Review tekst
- ✅ Sorteer op datum

**Firestore Collectie:** `reviews`
```
{
  name: string
  role: string
  content: string
  avatar: string (optional)
  rating: number (1-5)
  createdAt: Timestamp
}
```

### 4. **Analytics & Verkopen** (`/admin/analytics`)
- 📈 Totale omzet
- 📅 Omzet deze maand
- 👥 Totaal aantal gebruikers
- 💳 Actieve abonnementen
- 📊 Gebruikersverdeling (Gratis/Premium/Pro)
- 🧾 Recente transacties

**Firestore Collectie:** `transactions`
```
{
  userId: string
  userEmail: string
  plan: string ('premium' | 'pro')
  amount: number
  date: Timestamp
}
```

### 5. **Gebruikers Beheer** (`/admin/users`)
- 👤 Overzicht alle gebruikers
- 🔍 Zoeken op email/naam
- 📋 Filter op plan type
- 📅 Registratie datum

**Firestore Collectie:** `users`
```
{
  email: string
  displayName: string
  plan: string ('free' | 'premium' | 'pro')
  createdAt: Timestamp
}
```

---

## 🗄️ Firebase Firestore Setup

### Collecties aanmaken
De volgende collecties worden automatisch aangemaakt bij eerste gebruik:

1. **`blogs`** - Blog posts
2. **`reviews`** - Gebruiker reviews
3. **`transactions`** - Verkopen/betalingen
4. **`users`** - Gebruikers info (wordt al gebruikt door auth)

### Firestore Rules (Voorbeeld)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Blogs - publiek leesbaar, admin kan schrijven
    match /blogs/{blogId} {
      allow read: if true;
      allow write: if request.auth != null &&
                   request.auth.token.email in ['v_mun@hotmail.com'];
    }

    // Reviews - publiek leesbaar, admin kan schrijven
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if request.auth != null &&
                   request.auth.token.email in ['v_mun@hotmail.com'];
    }

    // Transactions - alleen admin
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null &&
                          request.auth.token.email in ['v_mun@hotmail.com'];
    }

    // Users - eigen profiel + admin
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                    request.auth.token.email in ['v_mun@hotmail.com'];
    }
  }
}
```

---

## 🚀 Gebruik

### Blogs toevoegen
1. Ga naar `/admin/blogs`
2. Klik "Nieuw Blog"
3. Vul titel, excerpt, content in
4. Optioneel: voeg afbeelding URL toe
5. Klik "Opslaan"

### Reviews toevoegen
1. Ga naar `/admin/reviews`
2. Klik "Nieuwe Review"
3. Vul naam, rol, content in
4. Kies rating (1-5 sterren)
5. Optioneel: avatar URL
6. Klik "Opslaan"

### Analytics bekijken
1. Ga naar `/admin/analytics`
2. Bekijk verkopen, gebruikers stats
3. Zie recente transacties

### Gebruikers beheren
1. Ga naar `/admin/users`
2. Zoek gebruiker via email
3. Bekijk plan en registratie info

---

## 🔒 Beveiliging

### Frontend Beveiliging
- Email whitelist check op elke admin pagina
- Redirect naar `/dashboard` als niet-admin
- Redirect naar `/login` als niet ingelogd

### Backend Beveiliging (Firebase Rules)
- Firestore rules controleren admin email
- Alleen whitelisted emails kunnen schrijven
- Transactions alleen voor admins

### Productie Tips
1. **Gebruik Firebase Security Rules** (zie hierboven)
2. **Enable reCAPTCHA** voor login
3. **2FA toevoegen** voor admin accounts
4. **Audit logs** bijhouden van admin acties
5. **Rate limiting** op admin endpoints

---

## 📝 Todo

### Toekomstige Features
- [ ] Export data naar CSV/Excel
- [ ] Email notificaties bij nieuwe verkoop
- [ ] Bulk acties (meerdere blogs/reviews tegelijk verwijderen)
- [ ] Dashboard grafieken (verkopen over tijd)
- [ ] Coupon codes beheren
- [ ] Customer support chat

### Integraties
- [ ] Stripe/Mollie voor betalingen
- [ ] Mailchimp voor email marketing
- [ ] Google Analytics integratie
- [ ] Slack notificaties voor verkopen

---

## 🆘 Hulp Nodig?

### Problemen oplossen

**Kan niet inloggen als admin:**
- Check of je email in de whitelist staat
- Ververs Firebase auth tokens
- Check browser console voor errors

**Data wordt niet geladen:**
- Check Firebase console Firestore
- Controleer Firestore rules
- Check browser netwerk tab

**Wijzigingen worden niet opgeslagen:**
- Check Firestore rules (write permission)
- Check browser console errors
- Controleer of Firestore index nodig is

---

## 🔗 Links

- Admin Dashboard: `/admin`
- Blog Beheer: `/admin/blogs`
- Review Beheer: `/admin/reviews`
- Analytics: `/admin/analytics`
- Gebruikers: `/admin/users`

---

**Gemaakt voor DatingAssistent.nl** 🚀
