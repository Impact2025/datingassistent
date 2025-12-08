# 🚀 Quick Start: Universal Scans

**TL;DR:** Run one command, make all scans work for everyone.

---

## ⚡ 1-Minute Setup

### Run Migration
```bash
npx tsx src/scripts/migrate-all-scans-to-universal.ts
```

That's it! ✅

---

## 📊 What Changed?

### Before
```
"Ik plan dates altijd van tevoren"
```
❌ Only works if you've dated

### After
```
"Als ik een date zou plannen, zou ik graag van tevoren een duidelijk plan hebben"
```
✅ Works for everyone (hypothetical)

---

## 🎯 Quick Examples

### Emotionele Readiness
| Old | New |
|-----|-----|
| "Wanneer was je laatste relatie?" | "Als ik terugkijk op mijn verleden, voel ik me vreedzaam..." |

### Dating Stijl
| Old | New |
|-----|-----|
| "Je date loopt niet soepel" | "Stel je voor: tijdens een eerste ontmoeting loopt het gesprek wat stroef" |

### Hechtingsstijl
| Old | New |
|-----|-----|
| "Je date reageert niet" | "Stel je voor: iemand die je leuk vindt, reageert niet" |

---

## ✅ Verification

After migration, check:

1. **Database updated?**
   ```bash
   # Check questions in DB
   SELECT question_text FROM hechtingsstijl_questions WHERE order_position = 1;
   ```

2. **UI shows new questions?**
   - Go to `/hechtingsstijl`
   - Start scan
   - Verify first question uses new language

3. **Works for beginners?**
   - Create test user with "never dated"
   - Complete all scans
   - Should make sense!

---

## 🔧 Troubleshooting

### Issue: "Cannot find module"
```bash
# Install dependencies
npm install
```

### Issue: "Database connection failed"
```bash
# Check .env.local has DATABASE_URL
# Start dev server: npm run dev
```

### Issue: "Questions didn't update"
```bash
# Clear cache and retry
rm -rf .next
npx tsx src/scripts/migrate-all-scans-to-universal.ts
```

---

## 📖 Full Documentation

See [`UNIVERSAL_SCANS_MIGRATION.md`](./UNIVERSAL_SCANS_MIGRATION.md) for complete details.

---

## 🎉 Done!

Your scans now work for **everyone** - from complete beginners to dating pros!

**Questions?** Check the docs or scripts.
