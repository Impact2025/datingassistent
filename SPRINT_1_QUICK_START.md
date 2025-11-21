# Sprint 1: Quick Start Guide
## Van Coach Advice naar Actie - Implementatie Voltooid ✅

**Snel beginnen? Volg deze 5 stappen:**

---

## ⚡ Stap 1: Database Migratie (2 minuten)

```bash
node scripts/init-coaching-profiles.js
```

**Verwacht:** ✅ coaching_profiles tabel aangemaakt met 30+ kolommen

---

## ⚡ Stap 2: Integreer Enhanced Coach Advice (1 minuut)

**Optie A - Rename bestanden:**
```bash
cd src/components/journey
mv coach-advice.tsx coach-advice-OLD-BACKUP.tsx
mv coach-advice-enhanced.tsx coach-advice.tsx
```

**Optie B - Update imports:**
Zoek in je codebase naar imports van `coach-advice` en update naar `coach-advice-enhanced`

---

## ⚡ Stap 3: Test de Flow (5 minuten)

```bash
npm run dev
```

1. **Maak nieuwe test account** of logout
2. **Doe personality scan** (7 vragen)
3. **Zie coach advice** met tools
4. **Klik op een tool** (bijv. "Profiel Coach")
5. **Check:**
   - ✅ Toast "Aanbevelingen opgeslagen!"
   - ✅ Navigeert naar tool
   - ✅ Goals zijn aangemaakt (check Goals tab)
   - ✅ Dashboard toont "Jouw Huidige Focus"

---

## ⚡ Stap 4: Verify Current Focus Card (1 minuut)

Ga naar **Dashboard** en check:
- ✅ "Jouw Huidige Focus" card zichtbaar bovenaan
- ✅ Toont journey dag & fase
- ✅ Toont weekly focus
- ✅ Toont next action met priority
- ✅ Toont recommended tools
- ✅ Stats: tools gebruikt, steps voltooid, streak

---

## ⚡ Stap 5: Production Deployment (10 minuten)

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build test
npm run build

# 3. Backup production database (via Neon dashboard)

# 4. Run migratie op production
# Update .env naar production DATABASE_URL
node scripts/init-coaching-profiles.js

# 5. Deploy
vercel --prod
# of via Vercel dashboard
```

---

## 🎯 Wat is er veranderd?

### VOOR (❌ Probleem)
- Coach advice toont tools maar niet klikbaar
- Week/dag doelen getoond maar niet opgeslagen
- Dashboard weet niet wat coach adviseerde
- 85% drop-off na coach advice

### NA (✅ Oplossing)
- **Klikbare tools** die automatisch goals creëren
- **Current Focus card** op dashboard met next action
- **Tool usage tracking** door hele app
- **Smart routing** met onboarding context
- **Unified coaching profile** als single source of truth

---

## 📁 Nieuwe Bestanden

1. **`src/lib/coaching-profile-service.ts`** - Core service (650 regels)
2. **`src/components/journey/coach-advice-enhanced.tsx`** - Enhanced component (400 regels)
3. **`src/components/dashboard/current-focus-card.tsx`** - Dashboard card (280 regels)
4. **`src/app/api/coaching-profile/route.ts`** - Main API
5. **`src/app/api/coaching-profile/next-action/route.ts`** - Next action API
6. **`src/app/api/coaching-profile/track-tool/route.ts`** - Tracking API
7. **`scripts/init-coaching-profiles.js`** - Database migratie

### Geüpdatete Bestanden

1. **`src/components/dashboard/dashboard-tab.tsx`** - Toegevoegd: CurrentFocusCard component

---

## 🐛 Troubleshooting

### Issue: "Current Focus blijft laden"
```javascript
// Test in browser console:
const token = localStorage.getItem('datespark_auth_token');
const res = await fetch('/api/coaching-profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
console.log(await res.json());
```
**Fix:** Logout/login als token problemen

### Issue: "Tools niet klikbaar"
**Check:** Browser console voor JavaScript errors
**Fix:** Verify dat tool routes bestaan in app

### Issue: "Build errors"
```bash
# Missing components:
npx shadcn@latest add progress
npx shadcn@latest add toast

# Missing packages:
npm install @vercel/postgres jose
```

---

## 📊 Database Schema (Kort)

```sql
coaching_profiles:
  - user_id (unique, foreign key)
  - personality_type, comfort_level, primary_goal
  - current_phase, journey_day
  - recommended_tools (JSONB array)
  - tools_used (JSONB object)
  - weekly_focus, next_action
  - current_streak, longest_streak
  + 20 meer velden...
```

---

## 🎯 Success Metrics

Meet deze KPIs:
- **Tool Activation Rate**: Target >50% (was ~20%)
- **Completion Rate**: Target >70% (was <15%)
- **Return Rate (7d)**: Target >40% (was ~25%)

---

## 📖 Volledige Documentatie

Zie **`SPRINT_1_IMPLEMENTATION_GUIDE.md`** voor:
- Complete testing checklist (10 tests)
- Detailed API documentation
- Database schema details
- Security checklist
- Debug tips & tools
- Volgende sprint planning

---

## ✅ Klaar voor Deployment Checklist

- [ ] Database migratie succesvol
- [ ] Tests passing (zie guide)
- [ ] Build succesvol (`npm run build`)
- [ ] Type check succesvol (`npx tsc --noEmit`)
- [ ] Coach advice tools klikbaar
- [ ] Goals worden gecreëerd
- [ ] Current Focus card toont op dashboard
- [ ] Production database backup gemaakt

---

**Geschatte implementatietijd:** 2 weken (40 uur)
**Status:** ✅ **KLAAR VOOR TESTING**
**Volgende Sprint:** Smart Routing Throughout App (Weken 3-4)

**Vragen?** Check `SPRINT_1_IMPLEMENTATION_GUIDE.md` voor gedetailleerde troubleshooting.
