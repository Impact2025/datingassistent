# DatingAssistant Pro Cursus Generator - Setup Gids

## 🚀 Quick Start

### 1. Setup (eenmalig)

```powershell
# Open PowerShell in je DatingAssistant project folder
cd C:\Users\v_mun\.claude\projects\Datingassistent\Datingassistentapp

# Zorg dat @google/generative-ai geïnstalleerd is
npm install @google/generative-ai

# Zet je Gemini API key als environment variabele (permanent)
$env:GEMINI_API_KEY = "jouw-api-key-hier"

# Of sla het in Windows op (permanent):
# Systeemeigenschappen → Omgevingsvariabelen → Nieuwe variabele toevoegen
# Naam: GEMINI_API_KEY
# Waarde: jouw-api-key-hier
```

### 2. Cursus Toevoegen

```powershell
# Basis (met defaults)
node add-course.js

# Met je eigen parameters
node add-course.js "De Fundering" "Bouw een solide basis voor je dating leven" "Volwassenen met persoonlijke omstandigheden"

# Of via PowerShell script
.\add-course.ps1 -CourseName "Het Onweerstaanbare Profiel" -Description "Maak jezelf onweerstaanbaar aantrekkelijk" -Audience "Alleenstaande mannen 25-45"
```

## 📚 Wat het Script Doet

1. **Genereert cursus inhoud** met Gemini 1.5 Pro:
   - Gedetailleerde modules (5-8 stuks)
   - Lessen met lesdoelen
   - Praktische oefeningen
   - Reflectievragen
   - Eindtoets

2. **Slaat op als JSON** in `./courses/` map:
   ```
   courses/
   ├── course-de-fundering-1732000000000.json
   ├── course-het-onweerstaanbare-profiel-1732000001000.json
   └── ...
   ```

3. **Metadata toevoegen**:
   - `createdAt`: Timestamp
   - `status`: "draft" (je kunt dit wijzigen naar "published")
   - `version`: "1.0"

## ⚙️ Parameters Uitleggen

```powershell
node add-course.js [CourseName] [Description] [Audience]
```

- **CourseName**: Titel van je cursus (default: "Dating Mastery Course")
- **Description**: Wat de cursus doet (default: "Een diepgaande cursus...")
- **Audience**: Wie het is voor (default: "Volwassenen met persoonlijke omstandigheden")

### Voorbeelden:

```powershell
# Romantisch gericht
node add-course.js "Liefde Vinden" "Effectieve strategie voor het vinden van echte liefde" "Alleenstaande mannen"

# Voor meisjes
node add-course.js "Alpha Female" "Wees zelfbewust en aantrekkelijk" "Alleenstaande vrouwen 20-40"

# Voor koppels
node add-course.js "Relatie Reparatie" "Repareer en versterk je relatie" "Koppels in crisis"
```

## 🎯 Tips voor Beste Resultaten

1. **Wees specifiek** in je parameters:
   - Goed: "Hoe bouw je vertrouwen op met jezelf"
   - Slecht: "Dating cursus"

2. **Test de inhoud**:
   - Lees de gegenereerde JSON
   - Check of de psychologische frameworks kloppen
   - Pas aan waar nodig

3. **Stel status in**:
   - Open de .json file
   - Verander `"status": "draft"` naar `"status": "published"` als klaar
   - Voeg `"price": 29` toe als je het wilt ververkopen

## 📊 Cursus JSON Structuur

```json
{
  "title": "De Fundering",
  "description": "Bouw een solide basis...",
  "targetAudience": "Volwassenen",
  "objectives": [...],
  "modules": [
    {
      "title": "Module 1: ...",
      "lessons": [
        {
          "title": "Les 1: ...",
          "objectives": [...],
          "content": "...",
          "exercise": "...",
          "reflection": "..."
        }
      ]
    }
  ],
  "assessment": [...],
  "certification": {...},
  "createdAt": "2024-11-26T...",
  "status": "draft",
  "version": "1.0"
}
```

## 🔧 Troubleshooting

### "GEMINI_API_KEY not found"
```powershell
$env:GEMINI_API_KEY = "jouw-api-key-hier"
node add-course.js
```

### "Module not found: @google/generative-ai"
```powershell
npm install @google/generative-ai
```

### PowerShell script execution policy error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\add-course.ps1
```

### Script werkt niet als je niet in project folder bent
```powershell
cd C:\Users\v_mun\.claude\projects\Datingassistent\Datingassistentapp
node add-course.js
```

## 💡 Integration met je App

Na het genereren kun je de cursus files integreren:

```javascript
// Load cursus in je app
const fs = require("fs");
const course = JSON.parse(fs.readFileSync("./courses/course-de-fundering-xyz.json"));

// Of via API
app.get("/api/courses/:id", (req, res) => {
  const course = JSON.parse(fs.readFileSync(`./courses/course-${req.params.id}.json`));
  res.json(course);
});
```

## 📞 Vragen?

Als iets niet werkt:
1. Check je API key is correct
2. Zorg @google/generative-ai is geïnstalleerd
3. Zorg je in de juiste folder zit
4. Check PowerShell execution policy

---

**Veel succes met je pro cursussen! 🚀**
