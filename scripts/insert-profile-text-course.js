const { sql } = require('@vercel/postgres');

async function insertProfileTextCourse() {
  try {
    console.log('Inserting profile text course...');

    // Insert the course
    const courseResult = await sql`
      INSERT INTO courses (title, description, is_published, is_free, level, position)
      VALUES (
        'Je profieltekst die wél werkt',
        'Werk in een half uur een authentieke, uitnodigende profieltekst uit met concrete prompts, voorbeelden en AI-ondersteuning.',
        true,
        true,
        'beginner',
        5
      )
      RETURNING id
    `;

    const courseId = courseResult.rows[0].id;
    console.log(`Created course with ID: ${courseId}`);

    // Insert modules
    const modules = [
      {
        title: 'INTRO – De kracht van een goede bio',
        description: 'Ontdek waarom je bio je digitale eerste indruk is en hoe je met toon, positiviteit en helderheid nieuwsgierigheid wekt.',
        position: 0
      },
      {
        title: 'STAP 1 – Wie ben jij echt?',
        description: 'Vang de kern van je persoonlijkheid in woorden en voorbeelden die voelen zoals jij.',
        position: 1
      },
      {
        title: 'STAP 2 – Wat zoek je (echt)?',
        description: 'Bepaal welke connectie je zoekt en hoe iemand zich voelt wanneer die met jou praat.',
        position: 2
      },
      {
        title: 'STAP 3 – Vermijd clichés, laat jezelf zien',
        description: 'Zet algemene uitspraken om naar persoonlijke beelden en anekdotes die je uniek maken.',
        position: 3
      },
      {
        title: 'STAP 4 – De structuur van een bio die werkt',
        description: 'Bouw je tekst op met een intro, kern en uitnodigend slot.',
        position: 4
      },
      {
        title: 'STAP 5 – Herschrijf & verbeter met AI',
        description: 'Gebruik AI als sparringpartner om varianten van je tekst te testen.',
        position: 5
      },
      {
        title: 'CHECKLIST – Een bio die werkt',
        description: 'Controleer of je bio echt bij je past voordat je hem publiceert.',
        position: 6
      },
      {
        title: 'BONUS – Bonusmateriaal',
        description: 'Verdiep je bio met extra inspiratie en praktische hulpmiddelen.',
        position: 7
      }
    ];

    const moduleIds = [];

    for (const module of modules) {
      const moduleResult = await sql`
        INSERT INTO course_modules (course_id, title, description, position)
        VALUES (${courseId}, ${module.title}, ${module.description}, ${module.position})
        RETURNING id
      `;
      moduleIds.push(moduleResult.rows[0].id);
    }

    console.log('Created modules:', moduleIds);

    // Insert some key lessons with interactive elements
    const lessons = [
      // Pre-quiz in intro module
      {
        moduleIndex: 0,
        title: 'Pre-quiz: Hoe goed is jouw huidige bio?',
        description: 'Test je kennis over effectieve profielteksten voordat je begint.',
        content: '[{"questions": [{"question": "Wat is het belangrijkste doel van je profieltekst?", "type": "multiple_choice", "options": ["Zoveel mogelijk likes krijgen", "De juiste mensen aantrekken", "Laten zien hoe cool je bent", "Alle bovenstaande"], "correct": 1}, {"question": "Welke van deze zinnen is GEEN cliché?", "type": "multiple_choice", "options": ["Ik hou van reizen en avontuur", "Ik ben dol op mijn hond en lange wandelingen", "Ik werk hard en speel harder", "Ik ben op zoek naar mijn soulmate"], "correct": 1}]}]',
        type: 'quiz',
        position: 2
      },
      // Reflection exercise
      {
        moduleIndex: 1,
        title: 'Reflectie: Wat maakt jou uniek?',
        description: 'Neem tijd om na te denken over wat jou echt bijzonder maakt.',
        content: 'Neem 5 minuten om na te denken over wat jou uniek maakt. Wat zijn je sterke punten? Wat zijn je bijzondere ervaringen? Hoe zien anderen jou?',
        type: 'assignment',
        position: 1
      },
      // AI Bio Generator
      {
        moduleIndex: 5,
        title: 'Tool: AI Bio Generator',
        description: 'Knop om de AI Bio Generator te starten en drie suggesties te ontvangen.',
        content: 'Start de interactieve AI Bio Generator voor gepersonaliseerde suggesties.',
        type: 'interactive',
        position: 1
      },
      // Post-quiz
      {
        moduleIndex: 6,
        title: 'Post-quiz: Bio kennis toetsen',
        description: 'Test je kennis over het schrijven van effectieve profielteksten.',
        content: '[{"questions": [{"question": "Wat is het gevaar van clichés in je bio?", "type": "multiple_choice", "options": ["Ze vallen niet op", "Ze trekken de verkeerde mensen aan", "Ze zijn te lang", "Ze bevatten spelfouten"], "correct": 1}, {"question": "Wat moet je altijd vermijden in je bio?", "type": "multiple_choice", "options": ["Humor", "Negativiteit over exen", "Persoonlijke verhalen", "Nieuws over werk"], "correct": 1}]}]',
        type: 'quiz',
        position: 1
      }
    ];

    for (const lesson of lessons) {
      await sql`
        INSERT INTO course_lessons (module_id, title, description, content, lesson_type, position)
        VALUES (${moduleIds[lesson.moduleIndex]}, ${lesson.title}, ${lesson.description}, ${lesson.content}, ${lesson.type}, ${lesson.position})
      `;
    }

    console.log('Profile text course inserted successfully!');
    console.log(`Course ID: ${courseId}`);

  } catch (error) {
    console.error('Error inserting profile text course:', error);
  }
}

insertProfileTextCourse();