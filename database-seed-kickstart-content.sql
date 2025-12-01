-- ============================================
-- SEED: Kickstart Program Content
-- Complete program structure met modules en lessons
-- ============================================

-- First, get the Kickstart program ID
DO $$
DECLARE
  v_kickstart_id INTEGER;
  v_module1_id INTEGER;
  v_module2_id INTEGER;
  v_module3_id INTEGER;
  v_lesson_id INTEGER;
BEGIN
  -- Get Kickstart program ID
  SELECT id INTO v_kickstart_id FROM programs WHERE slug = 'kickstart' LIMIT 1;

  IF v_kickstart_id IS NULL THEN
    RAISE EXCEPTION 'Kickstart program not found! Please run database-setup-programs.sql first.';
  END IF;

  RAISE NOTICE '📚 Seeding Kickstart program (ID: %)', v_kickstart_id;

  -- ============================================
  -- MODULE 1: Dating Fundament (Week 1-2)
  -- ============================================

  INSERT INTO program_modules (
    program_id, module_number, title, description,
    learning_objectives,
    unlock_immediately, estimated_duration_minutes,
    icon_emoji, display_order, is_published
  ) VALUES (
    v_kickstart_id,
    1,
    'Dating Fundament',
    'Bouw de basis voor dating succes. Ontdek jouw unieke dating DNA en leer de fundamenten van aantrekkelijk online daten.',
    ARRAY[
      'Begrijp je persoonlijke dating stijl en voorkeuren',
      'Leer de psychologie achter succesvol online daten',
      'Creëer een solide fundament voor je dating reis',
      'Identificeer je unique value proposition'
    ],
    true, -- Unlock immediately
    180, -- 3 hours
    '🎯',
    1,
    true
  ) RETURNING id INTO v_module1_id;

  RAISE NOTICE '✅ Created Module 1: Dating Fundament (ID: %)', v_module1_id;

  -- Lesson 1.1: Welkom bij Kickstart (Video)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type, video_provider, video_url, video_thumbnail_url,
    duration_seconds, is_preview,
    estimated_duration_minutes, difficulty_level, tags,
    requires_previous_completion, display_order, is_published
  ) VALUES (
    v_module1_id, 1,
    'Welkom bij Kickstart',
    'Start je dating transformatie! In deze welkomstvideo leer je wat je kunt verwachten en hoe je het meeste uit dit programma haalt.',
    'video', 'vimeo', 'https://vimeo.com/example-welcome', '/videos/thumbnails/welcome.jpg',
    900, -- 15 minutes
    true, -- FREE PREVIEW
    15, 'beginner', ARRAY['introductie', 'mindset', 'welkom'],
    false, -- First lesson, no requirements
    1, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 1.2: Jouw Dating DNA Assessment (Quiz)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type,
    quiz_data,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module1_id, 2,
    'Jouw Dating DNA Assessment',
    'Ontdek je persoonlijke dating stijl door deze korte assessment. Je krijgt inzicht in je sterke punten en aandachtspunten.',
    'quiz',
    '{
      "questions": [
        {
          "id": "q1",
          "question": "Wat is jouw grootste doel met online daten?",
          "type": "multiple_choice",
          "options": ["Een serieuze relatie", "Leuke dates en connecties", "Mijn zelfvertrouwen opbouwen", "Gewoon kijken wat er is"],
          "correct_answer": 0,
          "explanation": "Er is geen fout antwoord! Het is belangrijk om eerlijk te zijn over je intenties.",
          "points": 10
        },
        {
          "id": "q2",
          "question": "Wat vind je het moeilijkste aan online daten?",
          "type": "multiple_choice",
          "options": ["Het eerste gesprek starten", "Mijn profiel maken", "Matches krijgen", "Van match naar date"],
          "correct_answer": null,
          "explanation": "We gaan al deze punten in dit programma behandelen!",
          "points": 10
        }
      ],
      "passing_score": 0,
      "allow_retries": true
    }'::jsonb,
    10, 'beginner', ARRAY['assessment', 'zelfkennis', 'quiz'],
    v_lesson_id, true, -- Unlock after previous lesson
    2, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 1.3: De Psychologie van Aantrekkelijkheid (Video)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type, video_provider, video_url, video_thumbnail_url,
    duration_seconds,
    transcript,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module1_id, 3,
    'De Psychologie van Aantrekkelijkheid',
    'Leer wat mensen echt aantrekkelijk vinden in online dating. Gebaseerd op wetenschappelijk onderzoek en praktijkervaring.',
    'video', 'vimeo', 'https://vimeo.com/example-psychology', '/videos/thumbnails/psychology.jpg',
    1200, -- 20 minutes
    'Transcript beschikbaar voor toegankelijkheid...',
    20, 'intermediate', ARRAY['psychologie', 'aantrekkelijkheid', 'theorie'],
    v_lesson_id, true,
    3, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 1.4: Je Unique Value Proposition (Exercise)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type,
    text_content,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module1_id, 4,
    'Je Unique Value Proposition',
    'Oefening: Ontdek wat jou uniek maakt en hoe je dat kunt gebruiken in je dating profiel.',
    'exercise',
    '## Jouw Unique Value Proposition

Beantwoord de volgende vragen eerlijk:

1. **Wat zijn je 3 grootste sterke punten?**
   - Denk aan karaktereigenschappen, talenten, passies

2. **Wat doen mensen altijd als compliment naar je?**
   - Wat hoor je vaak terug van vrienden of familie?

3. **Wat maakt een date met jou bijzonder?**
   - Wat is de ervaring die iemand heeft als ze tijd met je doorbrengen?

### Template:
"Ik ben een [eigenschap] persoon die houdt van [passie]. Mijn vrienden zeggen altijd dat ik [compliment]. Een date met mij betekent [ervaring]."

**Download de werkbladen** om dieper in te gaan op deze oefening.',
    30, 'beginner', ARRAY['oefening', 'zelfkennis', 'profiel'],
    v_lesson_id, true,
    4, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 1.5: Actieplan Week 1 (Download)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type,
    download_url, download_filename, download_size_bytes,
    text_content,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module1_id, 5,
    'Actieplan Week 1',
    'Downloadbaar actieplan voor je eerste week. Volg deze stappen voor maximale resultaten!',
    'download',
    '/downloads/kickstart/week-1-actieplan.pdf',
    'Kickstart_Week1_Actieplan.pdf',
    524288, -- 512 KB
    '## Je Week 1 Actieplan

Download het PDF voor het complete actieplan.

**Deze week ga je:**
- ✅ Je dating DNA assessment voltooien
- ✅ Je unique value proposition formuleren
- ✅ 3 sterke punten identificeren
- ✅ Start maken met profiel strategie

**Tijd investering:** 2-3 uur deze week',
    5, 'beginner', ARRAY['actieplan', 'download', 'praktijk'],
    v_lesson_id, true,
    5, true
  );

  -- ============================================
  -- MODULE 2: Profiel Optimalisatie (Week 3-4)
  -- ============================================

  INSERT INTO program_modules (
    program_id, module_number, title, description,
    learning_objectives,
    unlock_after_module_id, estimated_duration_minutes,
    icon_emoji, display_order, is_published
  ) VALUES (
    v_kickstart_id,
    2,
    'Profiel Optimalisatie',
    'Maak een profiel dat opvalt en je persoonlijkheid laat zien. Leer de kunst van fotografie en bio writing voor maximum matches.',
    ARRAY[
      'Creëer een aantrekkelijk dating profiel',
      'Kies de perfecte foto''s die je persoonlijkheid tonen',
      'Schrijf een bio die mensen nieuwsgierig maakt',
      'Optimaliseer voor meer matches'
    ],
    v_module1_id, -- Unlock after Module 1
    210, -- 3.5 hours
    '📸',
    2,
    true
  ) RETURNING id INTO v_module2_id;

  RAISE NOTICE '✅ Created Module 2: Profiel Optimalisatie (ID: %)', v_module2_id;

  -- Lesson 2.1: Foto Psychologie (Video)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type, video_provider, video_url, video_thumbnail_url,
    duration_seconds,
    estimated_duration_minutes, difficulty_level, tags,
    requires_previous_completion, display_order, is_published
  ) VALUES (
    v_module2_id, 1,
    'De Psychologie van Dating Foto''s',
    'Welke foto''s werken echt? Leer de wetenschap achter foto selectie en hoe je de juiste eerste indruk maakt.',
    'video', 'vimeo', 'https://vimeo.com/example-photos', '/videos/thumbnails/photos.jpg',
    1500, -- 25 minutes
    25, 'intermediate', ARRAY['foto''s', 'profiel', 'psychologie'],
    false, -- First lesson in module
    1, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 2.2: Bio Writing Formula (Video)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type, video_provider, video_url, video_thumbnail_url,
    duration_seconds,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module2_id, 2,
    'De Bio Writing Formula',
    'Schrijf een bio die mensen aan het lachen maakt en nieuwsgierig naar je maakt. Inclusief concrete voorbeelden en templates.',
    'video', 'vimeo', 'https://vimeo.com/example-bio', '/videos/thumbnails/bio.jpg',
    1080, -- 18 minutes
    18, 'intermediate', ARRAY['bio', 'schrijven', 'profiel'],
    v_lesson_id, true,
    2, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 2.3: Profiel Review Checklist (Exercise)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type,
    text_content,
    download_url, download_filename,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module2_id, 3,
    'Profiel Review Checklist',
    'Gebruik deze checklist om je profiel te evalueren en te verbeteren.',
    'exercise',
    '## Profiel Review Checklist

Ga door deze checklist en geef jezelf een score (1-10) per item:

### Foto''s:
- [ ] Duidelijke, scherpe foto''s
- [ ] Oprechte glimlach
- [ ] Verschillende settings (binnen/buiten)
- [ ] Laat je hobby''s zien
- [ ] Geen groepsfoto als hoofdfoto
- [ ] Foto''s niet ouder dan 6 maanden

### Bio:
- [ ] Laat je persoonlijkheid zien
- [ ] Geen clichés
- [ ] Specifieke voorbeelden
- [ ] Call-to-action aan het eind
- [ ] Positieve tone
- [ ] Geen spelling fouten

**Download de complete checklist voor meer detail.**',
    '/downloads/kickstart/profile-checklist.pdf',
    'Profiel_Review_Checklist.pdf',
    15, 'intermediate', ARRAY['checklist', 'profiel', 'review'],
    v_lesson_id, true,
    3, true
  );

  -- ============================================
  -- MODULE 3: Match & Messaging (Week 5-6)
  -- ============================================

  INSERT INTO program_modules (
    program_id, module_number, title, description,
    learning_objectives,
    unlock_after_module_id, estimated_duration_minutes,
    icon_emoji, display_order, is_published
  ) VALUES (
    v_kickstart_id,
    3,
    'Match & Messaging Meesterschap',
    'Van match naar date. Leer hoe je boeiende gesprekken start en doorontwikkelt naar echte dates.',
    ARRAY[
      'Start boeiende gesprekken die opvallen',
      'Houd het momentum in een chat',
      'Vraag smooth naar een date',
      'Plan leuke eerste dates'
    ],
    v_module2_id, -- Unlock after Module 2
    240, -- 4 hours
    '💬',
    3,
    true
  ) RETURNING id INTO v_module3_id;

  RAISE NOTICE '✅ Created Module 3: Match & Messaging (ID: %)', v_module3_id;

  -- Lesson 3.1: Opening Lines die Werken (Video)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type, video_provider, video_url, video_thumbnail_url,
    duration_seconds, is_preview,
    estimated_duration_minutes, difficulty_level, tags,
    requires_previous_completion, display_order, is_published
  ) VALUES (
    v_module3_id, 1,
    'Opening Lines die Werken',
    '30+ geteste opening lines die antwoorden krijgen. Plus de formule om je eigen unieke openers te schrijven.',
    'video', 'vimeo', 'https://vimeo.com/example-openers', '/videos/thumbnails/openers.jpg',
    1200, -- 20 minutes
    true, -- FREE PREVIEW
    20, 'intermediate', ARRAY['messaging', 'openers', 'matches'],
    false,
    1, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 3.2: Gesprekken Gaande Houden (Video)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type, video_provider, video_url, video_thumbnail_url,
    duration_seconds,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module3_id, 2,
    'Gesprekken Gaande Houden',
    'Voorkom ghosting. Leer de kunst van timing, vraagstelling en het opbouwen van spanning.',
    'video', 'vimeo', 'https://vimeo.com/example-conversation', '/videos/thumbnails/conversation.jpg',
    1380, -- 23 minutes
    23, 'intermediate', ARRAY['messaging', 'conversatie', 'ghosting'],
    v_lesson_id, true,
    2, true
  ) RETURNING id INTO v_lesson_id;

  -- Lesson 3.3: Van Chat naar Date (Video)
  INSERT INTO lessons (
    module_id, lesson_number, title, description,
    content_type, video_provider, video_url, video_thumbnail_url,
    duration_seconds,
    estimated_duration_minutes, difficulty_level, tags,
    unlock_after_lesson_id, requires_previous_completion,
    display_order, is_published
  ) VALUES (
    v_module3_id, 3,
    'Van Chat naar Date',
    'Het perfecte moment vinden om naar een date te vragen. Inclusief scripts en voorbeelden.',
    'video', 'vimeo', 'https://vimeo.com/example-date', '/videos/thumbnails/date.jpg',
    960, -- 16 minutes
    16, 'advanced', ARRAY['date', 'afspraak', 'messaging'],
    v_lesson_id, true,
    3, true
  );

  -- ============================================
  -- ACHIEVEMENTS
  -- ============================================

  -- Achievement: First Lesson Completed
  INSERT INTO achievements (
    achievement_key, title, description,
    icon_emoji, badge_image_url,
    criteria_type, criteria_value,
    points, rarity
  ) VALUES (
    'first_lesson',
    'First Steps',
    'Je eerste les voltooid! De reis begint hier.',
    '🎯',
    '/badges/first-lesson.png',
    'lesson_count',
    1,
    10,
    'common'
  );

  -- Achievement: Module 1 Complete
  INSERT INTO achievements (
    achievement_key, title, description,
    icon_emoji,
    criteria_type, criteria_value,
    points, rarity
  ) VALUES (
    'module_1_complete',
    'Fundament Gelegd',
    'Module 1 voltooid! Je hebt een solide fundament voor dating success.',
    '🏆',
    'module_complete',
    1,
    50,
    'rare'
  );

  -- Achievement: Program Complete
  INSERT INTO achievements (
    achievement_key, title, description,
    icon_emoji,
    criteria_type, criteria_value,
    points, rarity
  ) VALUES (
    'kickstart_complete',
    'Kickstart Master',
    'Kickstart programma compleet voltooid! Je bent klaar voor dating success.',
    '👑',
    'module_complete',
    3,
    200,
    'epic'
  );

  -- Achievement: Speed Learner (complete 5 lessons in one day)
  INSERT INTO achievements (
    achievement_key, title, description,
    icon_emoji,
    criteria_type, criteria_value,
    points, rarity
  ) VALUES (
    'speed_learner',
    'Speed Learner',
    'Wow! Je hebt 5 lessen in één dag voltooid. Dedication!',
    '⚡',
    'time_based',
    1,
    30,
    'rare'
  );

  RAISE NOTICE '✅ Created achievements';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 KICKSTART CONTENT SUCCESSFULLY SEEDED!';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '- 3 Modules created';
  RAISE NOTICE '- 11 Lessons created (mix of video, quiz, exercise, download)';
  RAISE NOTICE '- 4 Achievements created';
  RAISE NOTICE '- 2 Preview lessons (free access)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run this in Neon database to populate Kickstart program!';
END $$;
