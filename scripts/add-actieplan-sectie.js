const { sql } = require('@vercel/postgres');

async function addActieplanSectie() {
  try {
    console.log('🎯 Adding Actieplan sectie to les 1...');

    // Voeg actieplan sectie toe aan les 1
    const result = await sql`
      INSERT INTO cursus_secties (
        les_id,
        slug,
        sectie_type,
        titel,
        inhoud,
        volgorde
      ) VALUES (
        1,
        'actieplan',
        'actieplan',
        'Jouw Foto Actieplan',
        '{
          "acties": [
            {
              "tekst": "Verwijder alle foto''s met zonnebril van je dating profiel",
              "deadline": "Binnen 24 uur"
            },
            {
              "tekst": "Plan een fotoshoot met een vriend(in) in natuurlijk licht",
              "deadline": "Deze week"
            },
            {
              "tekst": "Maak minimaal 20 nieuwe foto''s op verschillende locaties",
              "deadline": "Binnen 7 dagen"
            },
            {
              "tekst": "Vraag 3 vrienden om eerlijke feedback op je beste 5 foto''s",
              "deadline": "Binnen 10 dagen"
            },
            {
              "tekst": "Upload minimaal 2 nieuwe foto''s naar je dating profiel",
              "deadline": "Binnen 2 weken"
            },
            {
              "tekst": "Check je profiel opnieuw met de AI Foto Checker tool",
              "deadline": "Na uploaden"
            }
          ]
        }'::jsonb,
        7
      )
      RETURNING *;
    `;

    console.log('✅ Actieplan sectie toegevoegd!');
    console.log('Sectie:', result.rows[0]);
    console.log('\nActies:', result.rows[0].inhoud.acties);

  } catch (error) {
    console.error('❌ Error adding actieplan sectie:', error);
  }
}

addActieplanSectie();
