# Logo Implementatie Overzicht

## Logo Ontwerp
Het DatingAssistent logo bestaat uit:
- **Icoon**: Hart met pijl (Heart with Arrow) in roze (#E14874)
  - Symboliseert liefde en vooruitgang/richting
  - Custom ontwerp specifiek voor DatingAssistent
- **Tekst**: "Dating" in roze (#E14874) + "Assistent" in zwart/foreground

## Logo Componenten

### 1. Web Logo Component
**Locatie**: `src/components/shared/logo.tsx`

**Gebruik**:
```tsx
import { Logo } from '@/components/shared/logo';

<Logo
  iconSize={32}      // Grootte van het hart icoon
  textSize="md"      // sm, md, lg, xl
  showIcon={true}    // Toon/verberg het hart icoon
/>
```

### 2. Email Logo Component
**Locatie**: `src/components/shared/email-logo.tsx`

**Gebruik**:
```tsx
import { EmailLogo } from '@/components/shared/email-logo';

<EmailLogo size="md" />  // sm, md, lg
```

## Waar het Logo wordt gebruikt

### ✅ Geïmplementeerd

1. **Public Header** (`src/components/layout/public-header.tsx`)
   - Logo in de navigatiebalk
   - Size: iconSize={32}, textSize="md"

2. **Dashboard Header** (`src/components/layout/header.tsx`)
   - Logo boven het dashboard
   - Size: iconSize={40}, textSize="lg"

3. **Public Footer** (`src/components/layout/public-footer.tsx`)
   - Logo in de footer
   - Size: iconSize={28}, textSize="md"

4. **Welcome Email** (`src/emails/welcome-email.tsx`)
   - Logo in welkomstmail
   - Size: lg

5. **Homepage Chat Widget** (`src/app/page.tsx`)
   - ChatWidget met huiskleur #E14874

### 📋 Nog te implementeren in andere emails

De volgende email templates moeten nog worden aangepast om het EmailLogo component te gebruiken:

- `src/emails/course-completion-email.tsx`
- `src/emails/course-introduction-email.tsx`
- `src/emails/weekly-digest-email.tsx`
- `src/emails/monthly-progress-report-email.tsx`
- `src/emails/payment-failed-email.tsx`
- `src/emails/subscription-renewal-email.tsx`
- `src/emails/milestone-achievement-email.tsx`
- `src/emails/inactivity-alert-3days-email.tsx`
- `src/emails/mid-trial-check-email.tsx`
- `src/emails/feature-deepdive-chat-email.tsx`
- `src/emails/weekly-checkin-email.tsx`
- `src/emails/first-win-email.tsx`
- `src/emails/profile-optimization-email.tsx`

### 🎨 Huiskleur

De officiële huiskleur is: **#E14874** (roze/pink)

Deze wordt gebruikt voor:
- Logo "Dating" tekst
- Hart icoon
- Primary buttons
- Accenten door de hele app

## Implementatie Template

Voor nieuwe pagina's of componenten:

```tsx
import { Logo } from '@/components/shared/logo';

// In je JSX:
<Logo iconSize={32} textSize="md" />
```

Voor emails:

```tsx
import { EmailLogo } from '@/components/shared/email-logo';

// In je email template:
<EmailLogo size="md" />
```

## Tips

- Gebruik `textSize="sm"` voor compacte ruimtes
- Gebruik `textSize="lg"` of `textSize="xl"` voor headers
- Het hart icoon is altijd ingevuld (filled) in de huiskleur
- In dark mode past de "Assistent" tekst automatisch aan naar light color
