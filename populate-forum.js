require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function populateForum() {
  try {
    console.log('🚀 Starting forum population...\n');

    // Clean up existing data first
    console.log('🧹 Cleaning up existing forum data...\n');
    try {
      await sql`DELETE FROM forum_replies`;
      console.log('✅ Deleted existing replies');
    } catch (error) {
      console.log('⚠️ No existing replies to delete or error:', error.message);
    }

    try {
      await sql`DELETE FROM forum_posts`;
      console.log('✅ Deleted existing posts');
    } catch (error) {
      console.log('⚠️ No existing posts to delete or error:', error.message);
    }

    console.log('✅ Cleanup completed\n');

    // Get categories first
    const categoriesResult = await sql`SELECT id, name FROM forum_categories ORDER BY id`;
    const categories = categoriesResult.rows;

    console.log('📂 Available categories:');
    categories.forEach(cat => {
      console.log(`  ${cat.id}: ${cat.name}`);
    });
    console.log('');

    // Create test users (6 women, 5 men)
    const users = [
      // Women
      { name: 'Sophie', email: 'sophie@example.com', gender: 'female' },
      { name: 'Emma', email: 'emma@example.com', gender: 'female' },
      { name: 'Lisa', email: 'lisa@example.com', gender: 'female' },
      { name: 'Anna', email: 'anna@example.com', gender: 'female' },
      { name: 'Julia', email: 'julia@example.com', gender: 'female' },
      { name: 'Marie', email: 'marie@example.com', gender: 'female' },
      // Men
      { name: 'Thomas', email: 'thomas@example.com', gender: 'male' },
      { name: 'Mark', email: 'mark@example.com', gender: 'male' },
      { name: 'David', email: 'david@example.com', gender: 'male' },
      { name: 'Peter', email: 'peter@example.com', gender: 'male' },
      { name: 'Jan', email: 'jan@example.com', gender: 'male' }
    ];

    // Create users if they don't exist
    const userIds = [];
    for (const user of users) {
      try {
        const existingUser = await sql`SELECT id FROM users WHERE email = ${user.email}`;
        if (existingUser.rows.length > 0) {
          userIds.push(existingUser.rows[0].id);
          console.log(`✅ User ${user.name} already exists`);
        } else {
          // Use a dummy password hash for test users
          const dummyPasswordHash = '$2b$10$dummy.hash.for.test.users.only';
          const result = await sql`
            INSERT INTO users (name, email, password_hash, created_at)
            VALUES (${user.name}, ${user.email}, ${dummyPasswordHash}, NOW())
            RETURNING id
          `;
          userIds.push(result.rows[0].id);
          console.log(`✅ Created user ${user.name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${user.name}:`, error);
      }
    }

    console.log(`\n👥 Created/found ${userIds.length} users\n`);

    // Sample forum posts (30 total, distributed across categories)
    const forumPosts = [
      // Category 1 - assuming this is "Algemeen" or similar
      {
        categoryId: categories[0]?.id || 1,
        userId: userIds[0],
        title: "Hoi allemaal! Nieuwe hier 👋",
        content: "Hallo iedereen! Ik ben Sophie en ik ben net begonnen met online daten. Het voelt allemaal een beetje overweldigend, maar ik ben blij dat ik deze community heb gevonden. Heeft iemand tips voor beginners?",
        date: "2025-09-01T10:30:00Z"
      },
      {
        categoryId: categories[0]?.id || 1,
        userId: userIds[6],
        title: "Welkom Sophie! Hier zijn mijn tips",
        content: "Hoi Sophie! Welkom in onze community. Ik date nu al 2 jaar online en heb veel geleerd. Mijn belangrijkste tip: neem de tijd voor je profiel. Een goede foto zegt meer dan 100 woorden!",
        date: "2025-09-01T14:20:00Z"
      },
      {
        categoryId: categories[0]?.id || 1,
        userId: userIds[1],
        title: "Profiel foto tips - deel je ervaringen",
        content: "Ik worstel altijd met welke foto ik als profielfoto moet gebruiken. Ik heb er zoveel, maar welke spreekt het meest aan? Deel jullie ervaringen!",
        date: "2025-09-03T16:45:00Z"
      },
      {
        categoryId: categories[0]?.id || 1,
        userId: userIds[7],
        title: "Profiel foto: kwaliteit boven kwantiteit",
        content: "Na veel experimenteren heb ik geleerd dat 1 goede profielfoto beter werkt dan 10 gemiddelde. Focus op kwaliteit, niet kwantiteit. Wat vinden jullie?",
        date: "2025-09-04T11:15:00Z"
      },
      {
        categoryId: categories[0]?.id || 1,
        userId: userIds[2],
        title: "Icebreakers die écht werken",
        content: "Ik probeer altijd originele openingsberichten te sturen, maar vaak kom ik niet verder dan 'Hoi!'. Welke icebreakers hebben bij jullie gewerkt?",
        date: "2025-09-06T09:30:00Z"
      },

      // Category 2 - assuming "Profiel hulp"
      {
        categoryId: categories[1]?.id || 2,
        userId: userIds[3],
        title: "Hulp nodig met mijn bio",
        content: "Ik weet nooit wat ik in mijn bio moet zetten. 'Leuk meisje op zoek naar liefde' klinkt zo cliché. Heeft iemand voorbeelden van goede bios?",
        date: "2025-09-08T13:20:00Z"
      },
      {
        categoryId: categories[1]?.id || 2,
        userId: userIds[8],
        title: "Bio tips: authentiek blijven",
        content: "Mijn bio is altijd: 'Avontuurlijk type dat van reizen houdt en graag lacht'. Het werkt goed omdat het echt over mij gaat. Niet liegen over jezelf!",
        date: "2025-09-09T15:40:00Z"
      },
      {
        categoryId: categories[1]?.id || 2,
        userId: userIds[4],
        title: "Foto selectie: welke kiezen?",
        content: "Ik heb 20 foto's gemaakt maar weet niet welke ik moet gebruiken. Kan iemand me helpen kiezen? Ik deel ze wel als iemand advies wil geven.",
        date: "2025-09-11T17:55:00Z"
      },
      {
        categoryId: categories[1]?.id || 2,
        userId: userIds[9],
        title: "Profiel optimalisatie checklist",
        content: "Ik heb een checklist gemaakt voor profiel optimalisatie:\n\n1. ✅ Scherpe, goed belichte foto\n2. ✅ Eerlijke bio\n3. ✅ Hobby's/interesses vermelden\n4. ✅ Leeftijd zichtbaar\n5. ✅ Wat je zoekt duidelijk maken\n\nWie heeft nog tips toe te voegen?",
        date: "2025-09-13T12:10:00Z"
      },
      {
        categoryId: categories[1]?.id || 2,
        userId: userIds[5],
        title: "Profiel foto: lach of serieus?",
        content: "Ik twijfel altijd tussen een lachende foto of een serieuzere. Wat werkt beter? Ik denk dat lachen benaderbaarder overkomt, maar ik ben benieuwd naar jullie ervaringen.",
        date: "2025-09-15T14:25:00Z"
      },

      // Category 3 - assuming "Gesprekken"
      {
        categoryId: categories[2]?.id || 3,
        userId: userIds[6],
        title: "Hoe ga je van app naar eerste date?",
        content: "Ik heb veel matches maar weet niet hoe ik van app-gesprekken naar een echte date moet komen. Wanneer stel je voor om af te spreken? Na hoeveel berichten?",
        date: "2025-09-17T16:40:00Z"
      },
      {
        categoryId: categories[2]?.id || 3,
        userId: userIds[0],
        title: "Gesprek starters die werken",
        content: "In plaats van 'Hoi hoe gaat het?' probeer ik nu: 'Ik zag dat je van reizen houdt - wat is je favoriete bestemming geweest?' Het leidt tot veel betere gesprekken!",
        date: "2025-09-18T11:05:00Z"
      },
      {
        categoryId: categories[2]?.id || 3,
        userId: userIds[7],
        title: "Ghosting voorkomen",
        content: "Ik word vaak geghost na een paar berichten. Hoe voorkom je dat? Stuur je te vaak berichten of stel je te snel persoonlijke vragen?",
        date: "2025-09-20T13:50:00Z"
      },
      {
        categoryId: categories[2]?.id || 3,
        userId: userIds[1],
        title: "Wanneer deel je telefoonnummer?",
        content: "Ik vind het altijd lastig om te bepalen wanneer je van de dating app naar WhatsApp gaat. Na hoeveel berichten? Of wacht je tot er een date gepland is?",
        date: "2025-09-22T15:30:00Z"
      },
      {
        categoryId: categories[2]?.id || 3,
        userId: userIds[8],
        title: "Flirten via tekst",
        content: "Hoe flirt je subtiel via berichten? Ik ben altijd bang dat ik te direct ben. Tips voor het vinden van de juiste balans?",
        date: "2025-09-24T10:15:00Z"
      },

      // Category 4 - assuming "Veiligheid"
      {
        categoryId: categories[3]?.id || 4,
        userId: userIds[2],
        title: "Veilig daten tips",
        content: "Ik ga morgen voor het eerst op date met iemand van een dating app. Welke veiligheidsmaatregelen nemen jullie? Moet ik een vriend(in) op de hoogte houden?",
        date: "2025-09-26T12:45:00Z"
      },
      {
        categoryId: categories[3]?.id || 4,
        userId: userIds[9],
        title: "Rode vlaggen herkennen",
        content: "Ik heb laatst iemand gesproken die meteen vroeg om geld te lenen. Dat voelde niet goed. Welke rode vlaggen hebben jullie gespot?",
        date: "2025-09-28T14:20:00Z"
      },
      {
        categoryId: categories[3]?.id || 4,
        userId: userIds[4],
        title: "Locatie delen: wanneer wel/niet?",
        content: "Ik deel nooit mijn exacte adres, maar hoe zit het met buurt/wijk? Wanneer is het veilig om locatie te delen?",
        date: "2025-09-30T16:55:00Z"
      },
      {
        categoryId: categories[3]?.id || 4,
        userId: userIds[10],
        title: "Date in het openbaar plannen",
        content: "Ik plan altijd eerste dates in een druk café of restaurant. Nooit thuis of bij de ander. Is dat overdreven of verstandig?",
        date: "2025-10-02T11:30:00Z"
      },
      {
        categoryId: categories[3]?.id || 4,
        userId: userIds[3],
        title: "Verificatie badges vertrouwen?",
        content: "Sommige profielen hebben verificatie badges. Kun je die vertrouwen? Of kunnen die ook fake zijn?",
        date: "2025-10-04T13:40:00Z"
      },

      // Category 5 - assuming "Succes verhalen"
      {
        categoryId: categories[4]?.id || 5,
        userId: userIds[5],
        title: "Mijn eerste date succes!",
        content: "Gisteren had ik mijn eerste date via een dating app en het was geweldig! We hebben 3 uur gepraat en er is meteen een klik. Dankzij de tips hier heb ik een goede eerste indruk gemaakt. Dank jullie wel! 💕",
        date: "2025-10-06T15:25:00Z"
      },
      {
        categoryId: categories[4]?.id || 5,
        userId: userIds[6],
        title: "Van skepticus naar believer",
        content: "Ik was eerst sceptisch over online daten, maar na 3 maanden heb ik nu een geweldige relatie! De sleutel was geduld hebben en niet te snel opgeven. Dit forum heeft me enorm geholpen.",
        date: "2025-10-08T17:10:00Z"
      },
      {
        categoryId: categories[4]?.id || 5,
        userId: userIds[0],
        title: "Profiel foto maakte het verschil",
        content: "Ik heb mijn profielfoto veranderd naar een lachende foto zoals geadviseerd, en mijn matches verdubbelden! Soms zijn de kleine dingen die het meeste impact hebben.",
        date: "2025-10-10T12:05:00Z"
      },
      {
        categoryId: categories[4]?.id || 5,
        userId: userIds[7],
        title: "Geduld loont",
        content: "Na 6 maanden daten heb ik eindelijk mijn soulmate gevonden! Het ging niet altijd even snel, maar door vol te houden en de tips hier op te volgen, heeft het geloond. Blijf geloven in de liefde! ❤️",
        date: "2025-10-12T14:50:00Z"
      },
      {
        categoryId: categories[4]?.id || 5,
        userId: userIds[1],
        title: "Community maakt het verschil",
        content: "Deze community heeft mijn dating leven compleet veranderd. Van eenzaam en ontmoedigd naar vol vertrouwen en met een geweldige partner. Dank aan iedereen die deelt en helpt!",
        date: "2025-10-14T16:35:00Z"
      },

      // Category 6 - assuming "Tips & Tricks"
      {
        categoryId: categories[5]?.id || 6,
        userId: userIds[8],
        title: "Beste tijd om te daten",
        content: "Ik merk dat ik meer matches krijg als ik 's avonds swipe. Wanneer swipen jullie het meest? Maakt tijd van de dag uit?",
        date: "2025-10-16T18:20:00Z"
      },
      {
        categoryId: categories[5]?.id || 6,
        userId: userIds[2],
        title: "Profiel swipe-worthy maken",
        content: "Naast goede foto's, wat maakt een profiel swipe-worthy? Ik heb gemerkt dat mensen met duidelijke interesses meer aandacht trekken.",
        date: "2025-10-18T11:55:00Z"
      },
      {
        categoryId: categories[5]?.id || 6,
        userId: userIds[9],
        title: "Bio schrijf tips",
        content: "Voor een goede bio: begin met iets unieks over jezelf, voeg humor toe, en eindig met wat je zoekt. Bijvoorbeeld: 'Koffie addict die van reizen droomt, op zoek naar iemand om avonturen mee te beleven ☕✈️'",
        date: "2025-10-20T13:15:00Z"
      },
      {
        categoryId: categories[5]?.id || 6,
        userId: userIds[4],
        title: "Foto volgorde optimaliseren",
        content: "Ik heb mijn beste foto als eerste gezet en zie veel meer interesse. Welke volgorde gebruiken jullie voor je foto's?",
        date: "2025-10-22T15:40:00Z"
      },
      {
        categoryId: categories[5]?.id || 6,
        userId: userIds[10],
        title: "Consistentie in berichten",
        content: "Ik probeer altijd consistent te zijn in mijn berichtjes - niet te lang, niet te kort. Het lijkt te werken! Hoe zorgen jullie voor goede gesprekken?",
        date: "2025-10-24T17:25:00Z"
      },

      // Extra posts to reach 30 total
      {
        categoryId: categories[0]?.id || 1,
        userId: userIds[3],
        title: "Weekend date ideeën",
        content: "Wat zijn jullie favoriete eerste date ideeën voor het weekend? Iets actief of relaxed?",
        date: "2025-10-26T10:50:00Z"
      },
      {
        categoryId: categories[1]?.id || 2,
        userId: userIds[5],
        title: "Leeftijd in profiel tonen?",
        content: "Ik twijfel of ik mijn leeftijd zichtbaar moet maken. Voordelen/nadelen?",
        date: "2025-10-28T12:30:00Z"
      },
      {
        categoryId: categories[2]?.id || 3,
        userId: userIds[6],
        title: "Follow-up na date",
        content: "Hoe snel stuur je een bericht na een date? Direct de volgende dag of wacht je even?",
        date: "2025-10-30T14:15:00Z"
      },
      {
        categoryId: categories[3]?.id || 4,
        userId: userIds[7],
        title: "Privacy instellingen controleren",
        content: "Controleer altijd je privacy instellingen op dating apps. Deel niet te veel te snel!",
        date: "2025-10-02T16:00:00Z"
      },
      {
        categoryId: categories[4]?.id || 5,
        userId: userIds[8],
        title: "Doorzetten loont!",
        content: "Na maanden van weinig succes eindelijk mijn match gevonden. Geef niet op! 💪❤️",
        date: "2025-10-04T18:45:00Z"
      }
    ];

    console.log(`📝 Creating ${forumPosts.length} forum posts...\n`);

    // Insert posts
    for (let i = 0; i < forumPosts.length; i++) {
      const post = forumPosts[i];
      try {
        const result = await sql`
          INSERT INTO forum_posts (user_id, category_id, title, content, created_at, updated_at)
          VALUES (${post.userId}, ${post.categoryId}, ${post.title}, ${post.content}, ${post.date}, ${post.date})
          RETURNING id
        `;

        console.log(`✅ Post ${i + 1}/30: "${post.title}" by user ${post.userId} in category ${post.categoryId}`);
      } catch (error) {
        console.error(`❌ Error creating post ${i + 1}:`, error);
      }
    }

    console.log('\n💬 Adding forum replies...\n');

    // Get the actual post IDs that were just created
    const createdPosts = await sql`SELECT id, title FROM forum_posts ORDER BY id`;
    console.log(`Found ${createdPosts.rows.length} posts in database`);

    // Create a mapping of post titles to IDs
    const postMap = {};
    createdPosts.rows.forEach(post => {
      if (post.title === "Hoi allemaal! Nieuwe hier 👋") postMap.welcome = post.id;
      else if (post.title === "Profiel foto tips - deel je ervaringen") postMap.photoTips = post.id;
      else if (post.title === "Icebreakers die écht werken") postMap.icebreakers = post.id;
      else if (post.title === "Hulp nodig met mijn bio") postMap.bioHelp = post.id;
      else if (post.title === "Hoe ga je van app naar eerste date?") postMap.appToDate = post.id;
      else if (post.title === "Ghosting voorkomen") postMap.ghosting = post.id;
      else if (post.title === "Veilig daten tips") postMap.safetyTips = post.id;
      else if (post.title === "Mijn eerste date succes!") postMap.firstDateSuccess = post.id;
      else if (post.title === "Beste tijd om te daten") postMap.bestTime = post.id;
      else if (post.title === "Bio schrijf tips") postMap.bioTips = post.id;
    });

    console.log('Post mapping:', postMap);

    // Add some realistic replies to posts using the actual IDs
    const forumReplies = [
      // Reply to "Hoi allemaal! Nieuwe hier 👋"
      {
        postId: postMap.welcome,
        userId: userIds[1],
        content: "Hoi Sophie! Welkom bij onze community! Ik ben hier nu 3 maanden en heb al zoveel geleerd. Het belangrijkste advies: neem de tijd voor je profiel. Een goede eerste indruk is key!",
        date: "2025-09-01T15:30:00Z"
      },
      {
        postId: postMap.welcome,
        userId: userIds[6],
        content: "Welkom Sophie! 💕 Ik vind het super dat je de stap zet om hulp te zoeken. Veel mensen worstelen in stilte. Stel gerust vragen, we helpen elkaar hier graag!",
        date: "2025-09-01T16:45:00Z"
      },

      // Reply to "Profiel foto tips"
      {
        postId: postMap.photoTips,
        userId: userIds[7],
        content: "Ik heb gemerkt dat lachende foto's veel meer swipes opleveren. Mensen willen iemand zien die vrolijk en benaderbaar lijkt. Wat vinden jullie daarvan?",
        date: "2025-09-03T18:20:00Z"
      },
      {
        postId: postMap.photoTips,
        userId: userIds[2],
        content: "Voor mij werkt een mix: 1 close-up waar je lacht, 1 half-body foto, en 1 hobby foto. Zo krijgen mensen een compleet beeld.",
        date: "2025-09-04T11:10:00Z"
      },

      // Reply to "Icebreakers die écht werken"
      {
        postId: postMap.icebreakers,
        userId: userIds[8],
        content: "Ik gebruik vaak: 'Ik zag dat je van reizen houdt - wat is je favoriete bestemming geweest?' Het leidt altijd tot goede gesprekken!",
        date: "2025-09-06T12:30:00Z"
      },
      {
        postId: postMap.icebreakers,
        userId: userIds[3],
        content: "Vermijd 'Hoi hoe gaat het?'. Wees specifiek over iets uit hun profiel. Het toont dat je echt geïnteresseerd bent!",
        date: "2025-09-07T14:15:00Z"
      },

      // Reply to "Hulp nodig met mijn bio"
      {
        postId: postMap.bioHelp,
        userId: userIds[9],
        content: "Voorbeeld bio: 'Koffie addict die van spontane avonturen houdt. Op zoek naar iemand om samen te lachen en de wereld te ontdekken ☕✈️'",
        date: "2025-09-08T16:40:00Z"
      },
      {
        postId: postMap.bioHelp,
        userId: userIds[4],
        content: "Wees authentiek! Liever een korte, echte bio dan een lange, cliché tekst. Mensen prikken daar doorheen.",
        date: "2025-09-09T10:25:00Z"
      },

      // Reply to "Hoe ga je van app naar eerste date?"
      {
        postId: postMap.appToDate,
        userId: userIds[10],
        content: "Ik wacht meestal tot we 10-15 berichten hebben uitgewisseld en er een klik is. Dan stel ik voor om ergens koffie te doen. Wat werkt voor jullie?",
        date: "2025-09-17T18:55:00Z"
      },
      {
        postId: postMap.appToDate,
        userId: userIds[5],
        content: "Belangrijk: stel een date voor in het openbaar en deel je locatie pas als je elkaar ontmoet. Veiligheid first! 🛡️",
        date: "2025-09-18T13:40:00Z"
      },

      // Reply to "Ghosting voorkomen"
      {
        postId: postMap.ghosting,
        userId: userIds[6],
        content: "Ik denk dat consistentie helpt. Stuur niet te vaak, maar ook niet te weinig. En stel vragen om het gesprek gaande te houden!",
        date: "2025-09-20T15:50:00Z"
      },
      {
        postId: postMap.ghosting,
        userId: userIds[0],
        content: "Soms is ghosting gewoon deel van online daten. Niet persoonlijk opvatten. Er zijn genoeg mensen die wél reageren! 💪",
        date: "2025-09-21T11:20:00Z"
      },

      // Reply to "Veilig daten tips"
      {
        postId: postMap.safetyTips,
        userId: userIds[7],
        content: "Goed plan! Ik deel altijd mijn locatie met een vriend(in) en check in tijdens de date. Beter safe than sorry.",
        date: "2025-09-26T15:30:00Z"
      },
      {
        postId: postMap.safetyTips,
        userId: userIds[1],
        content: "Plan altijd eerste dates overdag in een drukke plek. Neem je eigen vervoer en vertrouw op je gevoel!",
        date: "2025-09-27T12:15:00Z"
      },

      // Reply to "Mijn eerste date succes!"
      {
        postId: postMap.firstDateSuccess,
        userId: userIds[8],
        content: "Gefeliciteerd! 🎉 Dit geeft hoop voor ons allemaal. Wat was je geheim? Profiel foto of gesprek starters?",
        date: "2025-10-06T17:45:00Z"
      },
      {
        postId: postMap.firstDateSuccess,
        userId: userIds[2],
        content: "Zo blij voor je! Ik ben zelf nog op zoek naar mijn eerste succes. Tips voor anderen die wachten?",
        date: "2025-10-07T14:30:00Z"
      },

      // Reply to "Beste tijd om te daten"
      {
        postId: postMap.bestTime,
        userId: userIds[9],
        content: "'s Avonds swipe ik meer matches, maar quality gesprekken ontstaan overdag. Misschien omdat mensen dan meer tijd hebben?",
        date: "2025-10-16T21:10:00Z"
      },
      {
        postId: postMap.bestTime,
        userId: userIds[3],
        content: "Weekendavond lijkt voor mij het beste te werken. Mensen zijn relaxed en zoeken contact.",
        date: "2025-10-17T16:25:00Z"
      },

      // Reply to "Bio schrijf tips"
      {
        postId: postMap.bioTips,
        userId: userIds[10],
        content: "Goede tip! Ik voeg altijd een vraag toe aan het eind: 'Wat is jouw guilty pleasure?' Het nodigt uit tot reactie.",
        date: "2025-10-20T18:40:00Z"
      },
      {
        postId: postMap.bioTips,
        userId: userIds[4],
        content: "Humor is key! Maar zorg dat het niet geforceerd overkomt. Authentieke humor werkt het beste.",
        date: "2025-10-21T13:55:00Z"
      }
    ].filter(reply => reply.postId); // Only include replies where we found the post

    // Insert replies
    for (let i = 0; i < forumReplies.length; i++) {
      const reply = forumReplies[i];
      try {
        const result = await sql`
          INSERT INTO forum_replies (user_id, post_id, content, created_at, updated_at)
          VALUES (${reply.userId}, ${reply.postId}, ${reply.content}, ${reply.date}, ${reply.date})
          RETURNING id
        `;

        // Update post reply count
        await sql`
          UPDATE forum_posts
          SET replies_count = replies_count + 1, updated_at = NOW()
          WHERE id = ${reply.postId}
        `;

        console.log(`✅ Reply ${i + 1}/20: Added to post ${reply.postId} by user ${reply.userId}`);
      } catch (error) {
        console.error(`❌ Error creating reply ${i + 1}:`, error);
      }
    }

    console.log('\n🎉 Forum population completed!');
    console.log('📊 Check results with: node check-forum-posts.js');

  } catch (error) {
    console.error('❌ Error populating forum:', error);
  } finally {
    process.exit(0);
  }
}

populateForum();