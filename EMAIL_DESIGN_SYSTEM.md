# Email Design System - DatingAssistent

## Overzicht

Het Email Design System van DatingAssistent zorgt voor consistente branding en gebruikerservaring across alle email communicatie. Het systeem is opgebouwd uit herbruikbare componenten, design tokens en templates die eenvoudig te gebruiken zijn voor zowel bestaande als nieuwe emails.

## 📁 Structuur

```
src/components/emails/
├── base-email-template.tsx     # Basis template met header/footer
├── components/                 # Herbruikbare componenten
│   ├── email-card.tsx         # Verschillende card varianten
│   ├── email-button.tsx       # Button componenten
│   ├── email-badge.tsx        # Badges en status indicators
│   ├── email-stats-grid.tsx   # Statistieken grid
│   ├── email-step-indicator.tsx # Step indicators
│   ├── email-logo.tsx         # Logo component
│   └── index.ts              # Component exports
├── styles/                    # Design tokens
│   ├── colors.ts             # Kleurensysteem
│   ├── typography.ts         # Typografie
│   ├── layout.ts             # Layout & spacing
│   └── index.ts              # Style exports
├── templates/                 # Email templates
│   ├── welcome-template.tsx  # Welcome emails
│   ├── achievement-template.tsx # Achievement emails
│   ├── notification-template.tsx # Notification emails
│   └── index.ts              # Template exports
└── index.ts                   # Hoofd export
```

## 🎨 Design Principes

### Kleurenpalet
```typescript
// Primaire kleuren
primary: '#E14874'     // Roze/Magenta - CTA buttons
secondary: '#8B5CF6'   // Paars - accenten

// Functionele kleuren
success: '#10b981'     // Groen - success states
communication: '#3b82f6' // Blauw - info states
warning: '#f59e0b'     // Oranje - warnings
error: '#ef4444'       // Rood - errors

// Neutrale kleuren
background: '#ffffff'  // Witte achtergrond
text: '#1a1a1a'        // Primaire tekst
muted: '#6b7280'       // Secundaire tekst
```

### Typografie
- **Font Family**: Inter (fallback naar system fonts)
- **Headers**: 600 font-weight, primary color (#E14874)
- **Body**: 400 font-weight, dark text (#1a1a1a)
- **Line Height**: 1.6 voor body text, 1.2 voor headers

### Spacing Scale
```typescript
xs: '4px', sm: '8px', md: '16px',
lg: '24px', xl: '32px', '2xl': '48px'
```

## 🧩 Componenten

### EmailCard
```typescript
import { EmailCard, EmailHeroCard, EmailStatsCard } from '@/components/emails';

<EmailCard>
  <Text>Standaard card content</Text>
</EmailCard>

<EmailHeroCard>
  <Text>Hero content met speciale styling</Text>
</EmailHeroCard>
```

### EmailButton
```typescript
import { EmailPrimaryButton, EmailSecondaryButton } from '@/components/emails';

<EmailPrimaryButton href="/dashboard">
  Start Journey
</EmailPrimaryButton>

<EmailSecondaryButton href="/learn-more">
  Meer Info
</EmailSecondaryButton>
```

### EmailBadge
```typescript
import { EmailBadge, EmailStepBadge } from '@/components/emails';

<EmailBadge variant="success">Gelukt</EmailBadge>
<EmailStepBadge number={1} />
```

## 📧 Templates

### Welcome Email Template
```typescript
import { WelcomeEmailTemplate } from '@/components/emails';

<WelcomeEmailTemplate
  firstName="Jan"
  dashboardUrl="https://app.datingassistent.nl/dashboard"
  trialDays={7}
/>
```

### Achievement Email Template
```typescript
import { AchievementEmailTemplate } from '@/components/emails';

<AchievementEmailTemplate
  userName="Jan"
  achievement={{
    title: "Eerste Match!",
    description: "Gefeliciteerd met je eerste match!",
    icon: "🎯",
    rarity: "rare"
  }}
  stats={[...]}
  dashboardUrl="/dashboard"
/>
```

### Notification Email Template
```typescript
import { NotificationEmailTemplate, TrialExpiryEmail } from '@/components/emails';

// Generic notification
<NotificationEmailTemplate
  userName="Jan"
  type="warning"
  title="Proefperiode afloop"
  message="Nog 3 dagen tot je proefperiode afloopt"
  action={{ primary: { text: "Upgraden", url: "/upgrade" } }}
/>

// Specialized notification
<TrialExpiryEmail
  userName="Jan"
  daysLeft={3}
  dashboardUrl="/dashboard"
/>
```

## 🚀 Nieuwe Email Maken

### 1. Bepaal Email Type
- **Welcome/Onboarding**: Nieuwe gebruikers
- **Achievement**: Mijlpalen en successen
- **Notification**: Alerts, reminders, limits
- **Marketing**: Features, tips, updates
- **Transactional**: Betalingen, accounts

### 2. Kies Template
```typescript
import { BaseEmailTemplate, EmailHeader, EmailContent } from '@/components/emails';

export function CustomEmail({ userName, customData }) {
  return (
    <BaseEmailTemplate>
      <EmailHeader title="Custom Title" />
      <EmailContent>
        {/* Custom content using components */}
      </EmailContent>
    </BaseEmailTemplate>
  );
}
```

### 3. Gebruik Componenten
```typescript
import {
  EmailCard,
  EmailPrimaryButton,
  EmailStatsGrid,
  createTextStyle
} from '@/components/emails';

<EmailCard>
  <Text style={createTextStyle('h2')}>Custom Title</Text>
  <EmailStatsGrid stats={stats} />
  <EmailPrimaryButton href="/action">Actie</EmailPrimaryButton>
</EmailCard>
```

## 📏 Responsive Design

Het systeem is ontworpen voor optimale weergave in:
- **Desktop**: Gmail, Outlook, Apple Mail
- **Mobile**: iOS Mail, Gmail App
- **Web**: Browser clients

### Breakpoints
- **Mobile**: < 600px (container width: 100%)
- **Desktop**: ≥ 600px (container width: 600px)

## 🔧 Development Guidelines

### Component Naming
- `Email*` prefix voor alle email componenten
- Beschrijvende namen: `EmailHeroCard`, `EmailStatsGrid`
- Varianten: `EmailPrimaryButton`, `EmailSecondaryButton`

### Styling
- Gebruik altijd design tokens
- Inline styles voor React Email compatibility
- Vermijd CSS classes (behalve voor responsive)

### Testing
```bash
# Test email rendering
npm run test:emails

# Manual testing in different clients
# 1. Gmail web/desktop
# 2. Outlook web/desktop
# 3. Apple Mail
# 4. Mobile Gmail/iOS Mail
```

## 📊 Migration Status

### ✅ Voltooid
- [x] Design system foundation
- [x] Component library
- [x] Base templates (Welcome, Achievement, Notification)
- [x] Logo component
- [x] Documentation

### 🔄 In Uitvoering
- [ ] Migration van 15 bestaande emails
- [ ] Cross-client testing
- [ ] Performance optimalisatie

### 📋 Gepland
- [ ] Marketing email templates
- [ ] Transactional email templates
- [ ] A/B testing framework
- [ ] Analytics integration

## 🎯 Best Practices

### Content
- **Preview Text**: Max 50 karakters, aantrekkelijk
- **Subject Lines**: Action-oriented, persoonlijk
- **Call-to-Actions**: Duidelijk, urgent maar niet pushy

### Design
- **Logo**: Altijd zichtbaar, consistent gebruik
- **Whitespace**: Voldoende ruimte tussen elementen
- **Contrast**: Voldoende contrast voor accessibility
- **Mobile-first**: Test eerst op mobile

### Performance
- **Image Optimization**: Gebruik WebP waar mogelijk
- **File Size**: < 100KB per email
- **Loading**: Geen blocking resources

### Accessibility
- **Alt Text**: Voor alle images
- **Color Contrast**: WCAG AA compliant
- **Semantic HTML**: Correct gebruik van headings

## 📞 Support

Voor vragen over het Email Design System:
- **Component Usage**: Check deze documentatie
- **New Components**: Maak issue aan in repo
- **Design Changes**: Update design tokens centraal
- **Testing**: Gebruik test suite voor validatie

---

*Deze documentatie wordt bijgewerkt bij veranderingen aan het systeem.*