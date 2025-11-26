#!/usr/bin/env node

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Configuratie
const API_KEY = process.env.GEMINI_API_KEY || prompt("Voer je Gemini API key in: ");
const MODEL = "gemini-1.5-pro";

// Cursus details die je wilt toevoegen
const courseName = process.argv[2] || "Dating Mastery Curse";
const courseDescription = process.argv[3] || "Een diepgaande cursus over dating en relaties";
const targetAudience = process.argv[4] || "Volwassenen met persoonlijke omstandigheden";

async function generateCourseContent() {
  const client = new GoogleGenerativeAI(API_KEY);
  const model = client.getGenerativeModel({ model: MODEL });

  const prompt = `
Je bent een expert dating coach en cursusmaker. Maak een professionele, diepgaande cursus met deze details:

**Cursusnaam:** ${courseName}
**Beschrijving:** ${courseDescription}
**Doelgroep:** ${targetAudience}

Genereer een volledige cursusstructuur in JSON formaat met:
1. Cursus titel, beschrijving en doelen
2. 5-8 modules (elk met titel, beschrijving, lesdoelen)
3. Voor elke module: 3-4 lessen met:
   - Lestitel
   - Lesdoelen (2-3 punten)
   - Kerninhoud (100-150 woorden)
   - Praktische oefening
   - Reflectievraag
4. Eindtoets vragen
5. Certificering criteria

Zorg voor hoog-kwaliteit psychologische frameworks. Maak het professioneel, praktisch en transformatief.

Geef ALLEEN het JSON object, geen extra tekst.`;

  console.log(`\n🚀 Genereer cursus: "${courseName}"`);
  console.log(`📚 Model: ${MODEL}`);
  console.log("⏳ Even geduld...\n");

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON
    let courseData;
    try {
      // Verwijder markdown code blocks als die erin zitten
      let cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      courseData = JSON.parse(cleanText);
    } catch (e) {
      console.error("❌ Fout bij JSON parsing:", e.message);
      console.log("Raw response:", text);
      process.exit(1);
    }

    // Voeg metadata toe
    courseData.createdAt = new Date().toISOString();
    courseData.createdWith = "Gemini 1.5 Pro";
    courseData.status = "draft";
    courseData.version = "1.0";

    // Sla op naar bestand
    const fileName = `course-${courseName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}.json`;
    const filePath = path.join(process.cwd(), "courses", fileName);

    // Maak courses directory als die niet bestaat
    const courseDir = path.join(process.cwd(), "courses");
    if (!fs.existsSync(courseDir)) {
      fs.mkdirSync(courseDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(courseData, null, 2));

    console.log("✅ Cursus succesvol gegenereerd!");
    console.log(`📁 Opgeslagen: ${filePath}`);
    console.log(`\n📊 Cursusoverzicht:`);
    console.log(`   Naam: ${courseData.title || courseName}`);
    console.log(
      `   Modules: ${courseData.modules?.length || 0}`
    );
    console.log(
      `   Totale lessen: ${courseData.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0}`
    );
    console.log(`   Status: ${courseData.status}`);
    console.log("\n💡 Tips:");
    console.log("   - Review de inhoud en pas aan waar nodig");
    console.log("   - Test de oefeningen en vragen");
    console.log("   - Zet status op 'published' wanneer klaar");

    return courseData;
  } catch (error) {
    console.error("❌ Fout bij genereren:", error.message);
    process.exit(1);
  }
}

// Run
generateCourseContent().then(() => {
  console.log("\n✨ Klaar!");
});
