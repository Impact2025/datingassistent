const { sql } = require('@vercel/postgres');

async function createProfileTextCourse() {
  try {
    console.log('Creating profile text course...');

    // Create the main course
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

    // Create modules (sections)
    const modules = [
      {
        title: 'Introductie – De kracht van een goede bio',
        description: 'Ontdek waarom je bio je digitale eerste indruk is en hoe je met toon, positiviteit en helderheid nieuwsgierigheid wekt.',
        position: 0
      },
      {
        title: 'Wie ben jij echt?',
        description: 'Vang de kern van je persoonlijkheid in woorden en voorbeelden die voelen zoals jij.',
        position: 1
      },
      {
        title: 'Wat zoek je (echt)?',
        description: 'Bepaal welke connectie je zoekt en hoe iemand zich voelt wanneer die met jou praat.',
        position: 2
      },
      {
        title: 'Vermijd clichés, laat jezelf zien',
        description: 'Zet algemene uitspraken om naar persoonlijke beelden en anekdotes die je uniek maken.',
        position: 3
      },
      {
        title: 'De structuur van een bio die werkt',
        description: 'Bouw je tekst op met een intro, kern en uitnodigend slot.',
        position: 4
      },
      {
        title: 'Herschrijf & verbeter met AI',
        description: 'Gebruik AI als sparringpartner om varianten van je tekst te testen.',
        position: 5
      },
      {
        title: 'Checklist – Een bio die werkt',
        description: 'Controleer of je bio echt bij je past voordat je hem publiceert.',
        position: 6
      },
      {
        title: 'Bonusmateriaal',
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

    // Create lessons for each module
    const lessonsData = [
      // Module 0: Intro
      [
        {
          title: 'Les 1.1: Eerste indruk in woorden',
          description: 'Laat zien wie je bent, wat jou uniek maakt en wat iemand van een match met jou mag verwachten.',
          content: 'Je profieltekst is je digitale eerste indruk. In minder dan 3 seconden beslissen mensen of ze verder kijken. Leer hoe je met authentieke woorden nieuwsgierigheid wekt.',
          lesson_type: 'lesson',
          position: 0
        },
        {
          title: 'Les 1.2: Wat werkt wél en wat niet',
          description: 'Vergelijk veelgebruikte clichés met alternatieven die een gesprek op gang brengen.',
          content: 'Ontdek waarom standaardzinnen zoals "Ik hou van reizen en lekker eten" niet werken, en hoe je ze omzet naar persoonlijke verhalen.',
          lesson_type: 'lesson',
          position: 1
        }
      ],
      // Module 1: Wie ben jij echt?
      [
        {
          title: 'Les 2.1: Focus op gevoel en gedrag',
          description: 'Beschrijf jezelf met situaties en eigenschappen die laten zien hoe je je gedraagt, niet alleen wat je doet.',
          content: 'Gebruik concrete voorbeelden die laten zien hoe je denkt, voelt en handelt in verschillende situaties.',
          lesson_type: 'lesson',
          position: 0
        }
      ],
      // Module 2: Wat zoek je echt?
      [
        {
          title: 'Les 3.1: Benoem wat voor jou telt',
          description: 'Kies kernwaarden voor een relatie zodat je de juiste mensen aantrekt.',
          content: 'Leer onderscheid maken tussen must-haves, nice-to-haves en deal-breakers in relaties.',
          lesson_type: 'lesson',
          position: 0
        }
      ],
      // Module 3: Vermijd clichés
      [
        {
          title: 'Les 4.1: Van cliché naar karakter',
          description: 'Leer hoe je standaardzinnen herschrijft naar concrete details die nieuwsgierigheid opwekken.',
          content: 'Voorbeelden van hoe je "Ik ben spontaan" omzet naar "Ik plan mijn spontane momenten, maar ik ben stiekem heel netjes."',
          lesson_type: 'lesson',
          position: 0
        }
      ],
      // Module 4: Structuur
      [
        {
          title: 'Les 5.1: Drie-delige opbouw',
          description: 'Start met een persoonlijk haakje, laat je karakter zien en sluit af met een open uitnodiging.',
          content: 'De perfecte bio heeft een duidelijke structuur: introductie, kern en call-to-action.',
          lesson_type: 'lesson',
          position: 0
        },
        {
          title: 'Les 5.2: Inspirerende voorbeelden',
          description: 'Voorbeelden die je kunt gebruiken als referentie voor toon en structuur van je eigen tekst.',
          content: 'Bekijk succesvolle bio voorbeelden en leer wat ze gemeen hebben.',
          lesson_type: 'lesson',
          position: 1
        }
      ],
      // Module 5: AI verbetering
      [
        {
          title: 'Les 6.1: Laat AI met je meedenken',
          description: 'Plak je tekst in de AI Bio Generator, kies een toon en vergelijk de varianten.',
          content: 'Ontdek hoe AI je kan helpen om je tekst te verbeteren en te personaliseren.',
          lesson_type: 'lesson',
          position: 0
        },
        {
          title: 'Tool: AI Bio Generator',
          description: 'Knop om de AI Bio Generator te starten en drie suggesties te ontvangen.',
          content: 'Start de interactieve AI Bio Generator voor gepersonaliseerde suggesties.',
          lesson_type: 'interactive',
          position: 1
        }
      ],
      // Module 6: Checklist
      [
        {
          title: 'Checklist: Klaar om live te gaan?',
          description: 'Loop alle punten na zodat je tekst persoonlijk, uitnodigend en cliché-vrij is.',
          content: 'Gebruik deze checklist om te controleren of je bio klaar is voor publicatie.',
          lesson_type: 'lesson',
          position: 0
        }
      ],
      // Module 7: Bonus
      [
        {
          title: 'Download: De perfecte bio in 10 zinnen',
          description: 'Voorbeeldzinnen, openingszinnen en een mini-checklist om je tekst verder te verfijnen.',
          content: 'Extra materiaal om je bio verder te verbeteren.',
          lesson_type: 'download',
          position: 0
        }
      ]
    ];

    // Create lessons for each module
    for (let moduleIndex = 0; moduleIndex < lessonsData.length; moduleIndex++) {
      const moduleLessons = lessonsData[moduleIndex];
      const moduleId = moduleIds[moduleIndex];

      for (const lesson of moduleLessons) {
        await sql`
          INSERT INTO course_lessons (module_id, title, description, content, lesson_type, position)
          VALUES (${moduleId}, ${lesson.title}, ${lesson.description}, ${lesson.content}, ${lesson.lesson_type}, ${lesson.position})
        `;
      }
    }

    // Add special interactive lessons for profile text course
    // Pre-quiz for Module 0
    const introModuleId = moduleIds[0];
    await sql`
      INSERT INTO course_lessons (module_id, title, description, content, lesson_type, position)
      VALUES (
        ${introModuleId},
        'Pre-quiz: Hoe goed is jouw huidige bio?',
        'Test je kennis over effectieve profielteksten voordat je begint.',
        '[{"questions": [{"question": "Wat is het belangrijkste doel van je profieltekst?", "type": "multiple_choice", "options": ["Zoveel mogelijk likes krijgen", "De juiste mensen aantrekken", "Laten zien hoe cool je bent", "Alle bovenstaande"], "correct": 1}, {"question": "Welke van deze zinnen is GEEN cliché?", "type": "multiple_choice", "options": ["Ik hou van reizen en avontuur", "Ik ben dol op mijn hond en lange wandelingen", "Ik werk hard en speel harder", "Ik ben op zoek naar mijn soulmate"], "correct": 1}]}]',
        'quiz',
        2
      )
    `;

    // Reflection exercise for Module 1
    const personalityModuleId = moduleIds[1];
    await sql`
      INSERT INTO course_lessons (module_id, title, description, content, lesson_type, position)
      VALUES (
        ${personalityModuleId},
        'Reflectie: Wat maakt jou uniek?',
        'Neem tijd om na te denken over wat jou echt bijzonder maakt.',
        'Neem 5 minuten om na te denken over wat jou uniek maakt. Wat zijn je sterke punten? Wat zijn je bijzondere ervaringen? Hoe zien anderen jou?',
        'assignment',
        1
      )
    `;

    // Forum discussion for Module 2
    const seekingModuleId = moduleIds[2];
    await sql`
      INSERT INTO course_lessons (module_id, title, description, content, lesson_type, position)
      VALUES (
        ${seekingModuleId},
        'Forum discussie: Wat zoek je in een relatie?',
        'Deel je inzichten in de community en leer van anderen.',
        'Deel in het forum wat je hebt geleerd over wat je echt zoekt in een relatie. Wat verraste je het meest?',
        'text',
        1
      )
    `;

    // Post-quiz for Module 6
    const checklistModuleId = moduleIds[6];
    await sql`
      INSERT INTO course_lessons (module_id, title, description, content, lesson_type, position)
      VALUES (
        ${checklistModuleId},
        'Post-quiz: Bio kennis toetsen',
        'Test je kennis over het schrijven van effectieve profielteksten.',
        '[{"questions": [{"question": "Wat is het gevaar van clichés in je bio?", "type": "multiple_choice", "options": ["Ze vallen niet op", "Ze trekken de verkeerde mensen aan", "Ze zijn te lang", "Ze bevatten spelfouten"], "correct": 1}, {"question": "Wat moet je altijd vermijden in je bio?", "type": "multiple_choice", "options": ["Humor", "Negativiteit over exen", "Persoonlijke verhalen", "Nieuws over werk"], "correct": 1}]}]',
        'quiz',
        1
      )
    `;

    console.log('Profile text course created successfully!');
    console.log(`Course ID: ${courseId}`);
    console.log(`Modules created: ${moduleIds.length}`);

  } catch (error) {
    console.error('Error creating profile text course:', error);
  }
}

createProfileTextCourse();