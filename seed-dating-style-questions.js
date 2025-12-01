const { sql } = require('@vercel/postgres');

async function seedDatingStyleQuestions() {
  try {
    console.log('🌱 Seeding dating style questions...');

    // Clear existing data
    await sql`DELETE FROM dating_style_scenarios`;
    await sql`DELETE FROM dating_style_questions`;

    // Insert questions
    const questions = [
      {
        type: 'statement',
        text: 'Ik neem vaak het initiatief in gesprekken met mensen die ik aantrekkelijk vind',
        category: 'communication',
        isReverseScored: false,
        weight: 1.0,
        order: 1
      },
      {
        type: 'statement',
        text: 'Ik plan mijn dates altijd van tevoren, inclusief back-up plannen',
        category: 'planning',
        isReverseScored: false,
        weight: 1.0,
        order: 2
      },
      {
        type: 'statement',
        text: 'Ik hou van spontane avonturen en laat me graag verrassen',
        category: 'spontaneity',
        isReverseScored: false,
        weight: 1.0,
        order: 3
      },
      {
        type: 'statement',
        text: 'Ik probeer altijd rekening te houden met de gevoelens van mijn date',
        category: 'empathy',
        isReverseScored: false,
        weight: 1.0,
        order: 4
      },
      {
        type: 'statement',
        text: 'Ik ben heel selectief over wie ik een kans geef',
        category: 'selectivity',
        isReverseScored: false,
        weight: 1.0,
        order: 5
      },
      {
        type: 'statement',
        text: 'Ik geef niet snel persoonlijke informatie prijs tijdens dates',
        category: 'openness',
        isReverseScored: true,
        weight: 1.0,
        order: 6
      },
      {
        type: 'statement',
        text: 'Ik deel vaak verhalen over mijn leven tijdens eerste dates',
        category: 'sharing',
        isReverseScored: false,
        weight: 1.0,
        order: 7
      },
      {
        type: 'statement',
        text: 'Ik reageer soms niet op berichten als ik niet weet wat ik moet zeggen',
        category: 'responsiveness',
        isReverseScored: true,
        weight: 1.0,
        order: 8
      },
      {
        type: 'statement',
        text: 'Ik maak altijd oogcontact en glimlach tijdens gesprekken',
        category: 'engagement',
        isReverseScored: false,
        weight: 1.0,
        order: 9
      },
      {
        type: 'statement',
        text: 'Ik check mijn telefoon regelmatig tijdens dates',
        category: 'focus',
        isReverseScored: true,
        weight: 1.0,
        order: 10
      },
      {
        type: 'scenario',
        text: 'Je hebt een leuke date gehad en wilt een vervolg plannen. Wat doe je?',
        category: 'followup',
        isReverseScored: false,
        weight: 1.2,
        order: 11
      },
      {
        type: 'scenario',
        text: 'Iemand waar je mee datet stelt een vraag waar je niet direct een antwoord op hebt. Hoe reageer je?',
        category: 'communication',
        isReverseScored: false,
        weight: 1.2,
        order: 12
      },
      {
        type: 'scenario',
        text: 'Je voelt dat de chemistry niet helemaal goed zit tijdens een date. Wat doe je?',
        category: 'boundaries',
        isReverseScored: false,
        weight: 1.2,
        order: 13
      },
      {
        type: 'scenario',
        text: 'Je match lijkt perfect op papier, maar tijdens de date klikt het niet. Hoe ga je hiermee om?',
        category: 'realism',
        isReverseScored: false,
        weight: 1.2,
        order: 14
      },
      {
        type: 'scenario',
        text: 'Je date vraagt naar je vorige relaties. Hoeveel deel je?',
        category: 'openness',
        isReverseScored: false,
        weight: 1.2,
        order: 15
      }
    ];

    // Insert questions and get their IDs
    const insertedQuestions = [];
    for (const question of questions) {
      const result = await sql`
        INSERT INTO dating_style_questions (
          question_type, question_text, category, is_reverse_scored, weight, order_position
        ) VALUES (
          ${question.type}, ${question.text}, ${question.category},
          ${question.isReverseScored}, ${question.weight}, ${question.order}
        ) RETURNING id
      `;
      insertedQuestions.push({
        ...question,
        id: result.rows[0].id
      });
    }

    console.log(`✅ Inserted ${insertedQuestions.length} questions`);

    // Insert scenarios
    const scenarios = [
      // Question 11 scenarios
      {
        questionOrder: 11,
        text: 'Ik stuur direct een berichtje om een nieuwe date voor te stellen',
        styles: ['initiator'],
        weight: 1.5,
        order: 1
      },
      {
        questionOrder: 11,
        text: 'Ik wacht een paar dagen en plan dan zorgvuldig een speciale date',
        styles: ['planner'],
        weight: 1.5,
        order: 2
      },
      {
        questionOrder: 11,
        text: 'Ik stel iets spontans voor, zoals een wandeling in het park',
        styles: ['adventurer'],
        weight: 1.5,
        order: 3
      },
      {
        questionOrder: 11,
        text: 'Ik vraag eerst wat hij/zij leuk vindt voordat ik iets voorstel',
        styles: ['pleaser'],
        weight: 1.5,
        order: 4
      },
      {
        questionOrder: 11,
        text: 'Ik neem de tijd om te beslissen of deze persoon wel bij me past',
        styles: ['selector'],
        weight: 1.5,
        order: 5
      },

      // Question 12 scenarios
      {
        questionOrder: 12,
        text: 'Ik geef eerlijk toe dat ik even moet nadenken en stel een tegenvraag',
        styles: ['pleaser', 'initiator'],
        weight: 1.3,
        order: 1
      },
      {
        questionOrder: 12,
        text: 'Ik verander van onderwerp om de aandacht af te leiden',
        styles: ['distant'],
        weight: 1.3,
        order: 2
      },
      {
        questionOrder: 12,
        text: 'Ik vertel een grappig verhaal om de spanning te breken',
        styles: ['adventurer'],
        weight: 1.3,
        order: 3
      },
      {
        questionOrder: 12,
        text: 'Ik denk eerst goed na voordat ik antwoord geef',
        styles: ['planner'],
        weight: 1.3,
        order: 4
      },
      {
        questionOrder: 12,
        text: 'Ik zeg dat ik het niet weet en laat het daarbij',
        styles: ['selector'],
        weight: 1.3,
        order: 5
      },

      // Question 13 scenarios
      {
        questionOrder: 13,
        text: 'Ik probeer het gesprek een andere richting op te sturen',
        styles: ['pleaser', 'initiator'],
        weight: 1.4,
        order: 1
      },
      {
        questionOrder: 13,
        text: 'Ik geef het op en eindig de date vroegtijdig',
        styles: ['selector'],
        weight: 1.4,
        order: 2
      },
      {
        questionOrder: 13,
        text: 'Ik stel voor om iets anders te doen om de sfeer te verbeteren',
        styles: ['adventurer'],
        weight: 1.4,
        order: 3
      },
      {
        questionOrder: 13,
        text: 'Ik analyseer wat er misgaat en probeer het op te lossen',
        styles: ['planner'],
        weight: 1.4,
        order: 4
      },
      {
        questionOrder: 13,
        text: 'Ik zeg eerlijk dat het niet klikt en neem afscheid',
        styles: ['distant'],
        weight: 1.4,
        order: 5
      },

      // Question 14 scenarios
      {
        questionOrder: 14,
        text: 'Ik geef het nog een kans, misschien komt de chemistry later',
        styles: ['pleaser'],
        weight: 1.3,
        order: 1
      },
      {
        questionOrder: 14,
        text: 'Ik stop ermee omdat ik weet wat ik wil',
        styles: ['selector'],
        weight: 1.3,
        order: 2
      },
      {
        questionOrder: 14,
        text: 'Ik probeer een spontaan avontuur om het leuker te maken',
        styles: ['adventurer'],
        weight: 1.3,
        order: 3
      },
      {
        questionOrder: 14,
        text: 'Ik plan een follow-up date om het beter te leren kennen',
        styles: ['planner'],
        weight: 1.3,
        order: 4
      },
      {
        questionOrder: 14,
        text: 'Ik ben eerlijk over mijn gevoelens',
        styles: ['distant'],
        weight: 1.3,
        order: 5
      },

      // Question 15 scenarios
      {
        questionOrder: 15,
        text: 'Ik deel een kort, positief verhaal om de connectie te versterken',
        styles: ['over_sharer'],
        weight: 1.2,
        order: 1
      },
      {
        questionOrder: 15,
        text: 'Ik geef een algemeen antwoord zonder details',
        styles: ['distant'],
        weight: 1.2,
        order: 2
      },
      {
        questionOrder: 15,
        text: 'Ik vraag eerst naar hun ervaringen voordat ik iets deel',
        styles: ['pleaser'],
        weight: 1.2,
        order: 3
      },
      {
        questionOrder: 15,
        text: 'Ik deel alleen de hoogtepunten, geen negatieve verhalen',
        styles: ['selector'],
        weight: 1.2,
        order: 4
      },
      {
        questionOrder: 15,
        text: 'Ik verander van onderwerp om niet te veel te delen',
        styles: ['ghost_prone'],
        weight: 1.2,
        order: 5
      }
    ];

    let scenarioCount = 0;
    for (const scenario of scenarios) {
      const question = insertedQuestions.find(q => q.order === scenario.questionOrder);
      if (question) {
        await sql`
          INSERT INTO dating_style_scenarios (
            question_id, option_text, associated_styles, weight, order_position
          ) VALUES (
            ${question.id}, ${scenario.text}, ${JSON.stringify(scenario.styles)},
            ${scenario.weight}, ${scenario.order}
          )
        `;
        scenarioCount++;
      }
    }

    console.log(`✅ Inserted ${scenarioCount} scenarios`);
    console.log('🎉 Dating style questions seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding dating style questions:', error);
    process.exit(1);
  }
}

seedDatingStyleQuestions();