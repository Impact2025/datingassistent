# Q&A Sessions - Setup & Gebruikshandleiding

Quick MVP implementatie voor Live Q&A Sessies in het Transformatie programma.

## ✅ Wat is geïmplementeerd

### 1. Database
- ✅ `qa_sessions` tabel met alle sessie details
- ✅ Indexen op `session_date` en `program`
- ✅ Sample data voor testing

### 2. API Endpoints
- ✅ `GET /api/transformatie/qa-sessions` - Haal sessies op (gebruiker)
- ✅ `GET /api/admin/qa-sessions` - Alle sessies (admin)
- ✅ `POST /api/admin/qa-sessions` - Nieuwe sessie aanmaken
- ✅ `PUT /api/admin/qa-sessions/[id]` - Sessie updaten
- ✅ `DELETE /api/admin/qa-sessions/[id]` - Sessie verwijderen

### 3. User Interface
- ✅ Q&A Calendar in Transformatie dashboard
  - Toont upcoming sessies met countdown
  - Toont past sessies met opnames
  - Direct Zoom link klikken
  - Mobile responsive
- ✅ Admin UI op `/admin/qa-sessions`
  - Sessies toevoegen/bewerken/verwijderen
  - Zoom links manueel toevoegen
  - Status beheer (scheduled/completed/cancelled)

### 4. Email Notificaties
- ✅ Cron job voor automatische reminders
- ✅ Verstuurt 24 uur van tevoren
- ✅ Inclusief Zoom link in email

---

## 🚀 Setup Instructies

### Stap 1: Database Migratie

Run de migratie om de tabel aan te maken:

\`\`\`bash
npx tsx src/scripts/migrate-create-qa-sessions.ts
\`\`\`

✅ Dit maakt de `qa_sessions` tabel aan en voegt een sample sessie toe.

---

### Stap 2: Eerste Sessie Aanmaken

1. Ga naar [http://localhost:9000/admin/qa-sessions](http://localhost:9000/admin/qa-sessions)
2. Klik op "Nieuwe Sessie"
3. Vul in:
   - **Titel**: Bijv. "Week 1 Q&A - Welkom & Kennismaking"
   - **Beschrijving**: Wat wordt besproken
   - **Datum**: YYYY-MM-DD formaat
   - **Tijd**: HH:MM formaat
   - **Zoom Link**: Maak een meeting aan in Zoom en plak de link hier
4. Klik "Opslaan"

✅ De sessie verschijnt nu in het Transformatie dashboard voor alle gebruikers.

---

### Stap 3: Email Notificaties Setup (Optioneel)

#### A. Lokaal testen

Test de cron job manueel:

\`\`\`bash
curl http://localhost:9000/api/cron/qa-reminders \
  -H "Authorization: Bearer test-secret-123"
\`\`\`

#### B. Productie Setup (Vercel Cron)

1. **Voeg CRON_SECRET toe aan Vercel env variables:**
   \`\`\`
   CRON_SECRET=your-random-secret-here-abc123xyz
   \`\`\`

2. **Voeg cron config toe aan `vercel.json`:**
   \`\`\`json
   {
     "crons": [{
       "path": "/api/cron/qa-reminders",
       "schedule": "0 10 * * *"
     }]
   }
   \`\`\`
   Dit draait elke dag om 10:00 AM UTC.

3. **Deploy naar Vercel**
   \`\`\`bash
   git add .
   git commit -m "Add Q&A sessions cron job"
   git push
   \`\`\`

✅ Vercel zal nu automatisch dagelijks checken en emails versturen.

---

## 📋 Workflow

### Admin Workflow:
1. **Plan een sessie** in je eigen Zoom account
2. **Kopieer de Zoom link**
3. **Ga naar** `/admin/qa-sessions`
4. **Voeg de sessie toe** met datum, tijd en Zoom link
5. **Done!** Gebruikers zien de sessie automatisch

### User Workflow:
1. Gebruiker gaat naar `/transformatie`
2. Ziet upcoming Q&A sessies bovenaan
3. Krijgt email reminder 24 uur van tevoren
4. Klikt op "Deelnemen via Zoom" button
5. Doet mee aan de live sessie

---

## 🎯 Aanbevolen Planning

Volgens de course structure zijn er 3 Q&A sessies:

### Week 1 Q&A
**Wanneer**: Eind van week 1
**Focus**: Modules 1-2 (DESIGN fase)
**Onderwerpen**:
- Waarden Kompas vragen
- Hechtingsstijl verwarring
- Dating intentie formuleren

### Week 6 Q&A
**Wanneer**: Halverwege programma
**Focus**: Modules 5-6 (ACTION fase)
**Onderwerpen**:
- Van chat naar date
- Match selectie
- Rode en groene vlaggen

### Week 12 Q&A
**Wanneer**: Einde programma
**Focus**: Modules 9-12 (SURRENDER fase)
**Onderwerpen**:
- DTR gesprek
- Relatie onderhoud
- Terugblik & toekomst

---

## 🔧 Technische Details

### Database Schema

\`\`\`sql
CREATE TABLE qa_sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  zoom_link TEXT,
  zoom_meeting_id VARCHAR(100),
  max_participants INTEGER DEFAULT 100,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  program VARCHAR(50) DEFAULT 'transformatie',
  is_recording_available BOOLEAN DEFAULT false,
  recording_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### API Response Format

\`\`\`typescript
{
  sessions: [
    {
      id: 1,
      title: "Week 1 Q&A - Welkom",
      description: "...",
      date: "2025-02-01",
      time: "19:00:00",
      durationMinutes: 60,
      zoomLink: "https://zoom.us/j/...",
      status: "scheduled"
    }
  ],
  count: 1
}
\`\`\`

---

## 🎨 UI Screenshots

### User View (Transformatie Dashboard)
- **Upcoming Sessions**: Prominent cards met countdown
- **Today Badge**: Groene highlight voor sessies vandaag
- **Zoom Button**: Direct klikken om deel te nemen
- **Past Sessions**: Collapsible lijst met opnames

### Admin View
- **Session List**: Overzicht van alle sessies
- **Form**: Simpel formulier voor toevoegen/bewerken
- **Status Badges**: Visuele indicatie van sessie status
- **Inline Edit**: Direct bewerken of verwijderen

---

## 🚨 Troubleshooting

### Sessies verschijnen niet in dashboard
- Check of sessie status = `'scheduled'`
- Check of datum in de toekomst ligt
- Check of program = `'transformatie'`

### Emails worden niet verstuurd
- Verify RESEND_API_KEY in env variables
- Check of CRON_SECRET correct is
- Check Vercel cron logs in dashboard
- Test manueel met curl command

### Zoom link werkt niet
- Verify dat je de VOLLEDIGE link hebt gekopieerd
- Test de link in je browser
- Check of de meeting nog niet verlopen is

---

## 📈 Toekomstige Verbeteringen (Post-MVP)

Als de Q&A sessies succesvol zijn, overweeg dan:

### Fase 2: Automation
- [ ] Zoom API integratie (automatisch meetings aanmaken)
- [ ] Registratie systeem (wie komt er?)
- [ ] Attendance tracking
- [ ] Automatische recording upload

### Fase 3: Engagement
- [ ] Q&A vragen indienen vóór de sessie
- [ ] Upvoting systeem voor vragen
- [ ] Chat tijdens sessie
- [ ] Post-sessie survey

### Fase 4: Content Library
- [ ] Automatisch opnames beschikbaar maken
- [ ] Searchable Q&A database
- [ ] AI-powered Q&A bot (getraind op oude sessies)

---

## ✨ Conclusie

Je hebt nu een **volledig werkend Q&A systeem** dat:
- ✅ Voldoet aan de marketing belofte
- ✅ Minimale setup vereist (1-2 dagen development)
- ✅ Schaalt tot ~100 gebruikers
- ✅ Gemakkelijk te beheren voor admin

**Next Steps:**
1. Run de migratie
2. Plan je eerste Q&A sessie
3. Test met een paar gebruikers
4. Verzamel feedback
5. Besluit of je verder wilt investeren in automatisering

**Kosten per maand:** €0 (behalve Zoom abonnement)

**Tijd per sessie:** ~15 min voorbereiding + 60 min sessie = 1.25 uur

Good luck! 🎉
