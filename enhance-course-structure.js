require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function enhanceCourseStructure() {
  try {
    console.log('🚀 Enhancing course structure for world-class experience...\n');

    // Get the course ID
    const courseResult = await sql`
      SELECT id FROM courses WHERE title LIKE '%zelfvertrouwen%' LIMIT 1
    `;

    if (courseResult.rows.length === 0) {
      console.log('❌ Course not found');
      return;
    }

    const courseId = courseResult.rows[0].id;
    console.log(`📚 Enhancing course ID: ${courseId}\n`);

    // Add pre-course assessment module
    console.log('📝 Adding pre-course assessment module...');
    const preCourseResult = await sql`
      INSERT INTO course_modules (
        course_id,
        title,
        description,
        position
      ) VALUES (
        ${courseId},
        'PRE-COURSE: Jouw Zelfvertrouwen Assessment',
        'Ontdek je huidige zelfvertrouwen niveau en stel persoonlijke doelen voor deze transformatie.',
        0
      )
      RETURNING id
    `;

    const preCourseId = preCourseResult.rows[0].id;
    console.log(`✅ Created pre-course module ID: ${preCourseId}`);

    // Add assessment lessons
    const assessmentLessons = [
      {
        title: 'Welkom bij je Zelfvertrouwen Journey',
        type: 'video',
        content: 'Een persoonlijke introductie tot je zelfvertrouwen transformatie. Ontdek wat je kunt verwachten en hoe deze cursus anders is dan andere.',
        description: 'Introductievideo met persoonlijke boodschap'
      },
      {
        title: 'Zelfvertrouwen Baseline Assessment',
        type: 'interactive',
        content: 'Een uitgebreide assessment van 25 vragen om je huidige zelfvertrouwen niveau te meten in verschillende dating situaties.',
        description: 'Interactive assessment tool'
      },
      {
        title: 'Jouw Persoonlijke Uitdagingen Identificeren',
        type: 'assignment',
        content: 'Analyseer je antwoorden en identificeer je top 3 uitdagingen in dating zelfvertrouwen.',
        description: 'Reflectie op assessment resultaten'
      },
      {
        title: 'Doelen Stellen & Intentie Verklaring',
        type: 'assignment',
        content: 'Stel SMART doelen voor deze cursus en schrijf een persoonlijke intentieverklaring.',
        description: 'Doelen stellen voor transformatie'
      }
    ];

    for (let i = 0; i < assessmentLessons.length; i++) {
      const lesson = assessmentLessons[i];
      await sql`
        INSERT INTO course_lessons (
          module_id,
          title,
          lesson_type,
          content,
          description,
          position
        ) VALUES (
          ${preCourseId},
          ${lesson.title},
          ${lesson.type},
          ${lesson.content},
          ${lesson.description},
          ${i + 1}
        )
      `;
    }

    console.log('✅ Added 4 assessment lessons\n');

    // Update existing modules with enhanced content
    console.log('🔄 Enhancing existing modules...');

    const moduleEnhancements = [
      {
        position: 1,
        newTitle: 'MODULE 1: Mindset Reset & Psychologische Fundament',
        newDescription: 'Transformeer je interne dialoog en bouw een onwankelbaar zelfvertrouwen fundament met wetenschappelijk onderbouwde technieken.'
      },
      {
        position: 2,
        newTitle: 'MODULE 2: Lichaamstaal & Non-Verbale Uitstraling',
        newDescription: 'Meester lichaamstaal, presence en charisma. Leer hoe je zelfvertrouwen uitstraalt voordat je iets zegt.'
      },
      {
        position: 3,
        newTitle: 'MODULE 3: Sociale Skills & Conversatie Zelfvertrouwen',
        newDescription: 'Ontwikkel vloeiende sociale vaardigheden, leer gesprekken leiden en bouw connecties op met authentiek zelfvertrouwen.'
      },
      {
        position: 4,
        newTitle: 'MODULE 4: Afwijzing Verwerken & Resilience Bouwen',
        newDescription: 'Transformeer afwijzing in brandstof. Bouw emotionele veerkracht en leer van elke interactie.'
      }
    ];

    for (const enhancement of moduleEnhancements) {
      await sql`
        UPDATE course_modules
        SET title = ${enhancement.newTitle},
            description = ${enhancement.newDescription}
        WHERE course_id = ${courseId} AND position = ${enhancement.position}
      `;
      console.log(`✅ Enhanced module ${enhancement.position}: ${enhancement.newTitle}`);
    }

    // Add new advanced modules
    console.log('\n📚 Adding advanced modules...');

    const advancedModules = [
      {
        title: 'MODULE 5: Action Planning & Implementation',
        description: 'Zet je nieuwe zelfvertrouwen om in concrete acties. Creëer een persoonlijk actieplan voor dating succes.',
        position: 5
      },
      {
        title: 'MODULE 6: Community & Accountability',
        description: 'Sluit je aan bij een community van gelijkgestemden. Deel je journey en houd elkaar accountable.',
        position: 6
      },
      {
        title: 'POST-COURSE: Ongoing Support & Mastery',
        description: 'Levenslange toegang tot updates, advanced content en community support voor voortdurende groei.',
        position: 7
      }
    ];

    for (const module of advancedModules) {
      const result = await sql`
        INSERT INTO course_modules (
          course_id,
          title,
          description,
          position
        ) VALUES (
          ${courseId},
          ${module.title},
          ${module.description},
          ${module.position}
        )
        RETURNING id
      `;

      console.log(`✅ Added module: ${module.title} (ID: ${result.rows[0].id})`);
    }

    // Update course description to reflect new scope
    await sql`
      UPDATE courses
      SET description = 'Een complete 7-week zelfvertrouwen transformatie voor dating. Van mindset shift naar concrete actie, met AI-coaching, community support en levenslange toegang. Wetenschappelijk onderbouwd, praktisch toepasbaar.',
          duration_hours = 21
      WHERE id = ${courseId}
    `;

    console.log('\n📊 Final enhanced course structure:');
    const finalModules = await sql`
      SELECT position, title
      FROM course_modules
      WHERE course_id = ${courseId}
      ORDER BY position ASC
    `;

    finalModules.rows.forEach(module => {
      console.log(`   ${module.position}. ${module.title}`);
    });

    console.log('\n🎉 Course structure enhancement completed!');
    console.log('🚀 The course is now a comprehensive 7-module confidence transformation program!');

  } catch (error) {
    console.error('❌ Error enhancing course structure:', error);
  }
}

enhanceCourseStructure();