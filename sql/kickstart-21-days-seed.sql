-- ============================================
-- KICKSTART 21-DAGEN SEED DATA
-- Complete content voor alle 21 dagen
-- ============================================

-- Variabelen voor IDs
DO $$
DECLARE
  v_program_id INTEGER;
  v_week1_id INTEGER;
  v_week2_id INTEGER;
  v_week3_id INTEGER;
BEGIN

-- Get Kickstart program ID
SELECT id INTO v_program_id FROM programs WHERE slug = 'kickstart' LIMIT 1;

IF v_program_id IS NULL THEN
  RAISE EXCEPTION 'Kickstart program niet gevonden! Run eerst database-setup-programs.sql';
END IF;

RAISE NOTICE '📚 Seeding Kickstart 21-dagen content (Program ID: %)', v_program_id;

-- ============================================
-- WEEK 1: Fundament & Foto's
-- ============================================
INSERT INTO program_weeks (program_id, week_nummer, titel, thema, kpi, emoji)
VALUES (v_program_id, 1, 'Fundament & Foto''s', 'Van onzichtbaar naar opvallend', '4-6 goedgekeurde foto''s die werken', '📸')
RETURNING id INTO v_week1_id;

-- DAG 1: Kick-off + Jouw Startpunt
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, display_order
) VALUES (
  v_week1_id, v_program_id, 1, 'Kick-off + Jouw Startpunt', '🚀', 'LIVE', 30,
  NULL, NULL,
  '{
    "hook": "Welkom bij De Kickstart! De komende 21 dagen gaan we samen werken aan het fundament van jouw dating succes. En dat begint vandaag — met jouw startpunt bepalen.",
    "intro": "Hoi, ik ben Iris, jouw persoonlijke dating coach. De komende drie weken sta ik 24/7 voor je klaar. Niet met vage tips, maar met concrete stappen die écht werken. Waarom? Omdat dit programma is gebouwd op meer dan 10 jaar ervaring met duizenden singles zoals jij.",
    "secties": [
      {"titel": "Wat gaan we bereiken?", "content": "Aan het einde van deze 21 dagen heb je: foto''s die de juiste mensen aantrekken, een bio die gesprekken start, en je eerste kwaliteitsmatches. Geen loze beloftes — gemiddeld zien deelnemers 3x meer matches na week 3."},
      {"titel": "Hoe werkt het?", "content": "Elke dag krijg je een korte video van mij — maximaal 8 minuten. Daarna een opdracht die je direct kunt doen. Geen uren werk, maar consistente kleine stappen. Week 1 focussen we op je foto''s. Week 2 op je bio en platform. Week 3 op je eerste gesprekken."},
      {"titel": "De spelregels", "content": "Eén: doe elke dag je opdracht, ook al is het maar 10 minuten. Consistentie wint van perfectie. Twee: wees eerlijk naar jezelf. Ik ben hier niet om je te pleasen, maar om je te helpen. Drie: stel vragen. In de live Q&A''s, in de community, of direct aan mij via de chat."},
      {"titel": "Jouw startmeting", "content": "Voordat we beginnen, wil ik weten waar je nu staat. Hoeveel matches krijg je gemiddeld per week? Hoeveel daarvan leiden tot een gesprek? Hoeveel tot een date? Schrijf dit op. Over 21 dagen vergelijken we."}
    ],
    "opdracht": "Pak nu je telefoon. Open je dating app. Screenshot je huidige profiel — alle foto''s en je bio. Bewaar dit. Dit is je ''voor'' foto. En vul de startmeting in je werkboek in: matches per week, gesprekken per week, dates per maand. Wees eerlijk, niemand ziet dit behalve jij.",
    "outro": "Morgen duiken we direct in de diepte: de 3 grootste foto-fouten die bijna iedereen maakt. Fouten die je onzichtbaar maken. Tot morgen!"
  }'::jsonb,
  '{"vraag": "Wat is je grootste frustratie met online daten op dit moment?", "doel": "Bewustwording van je startpunt"}'::jsonb,
  '{"titel": "Startmeting", "stappen": ["Screenshot je huidige profiel (alle foto''s + bio)", "Noteer: gemiddeld aantal matches per week", "Noteer: hoeveel matches leiden tot gesprek", "Noteer: hoeveel gesprekken leiden tot date", "Schrijf op: wat wil je bereiken na 21 dagen?"]}'::jsonb,
  1
);

-- DAG 2: De 3 Grote Foto-Fouten
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week1_id, v_program_id, 2, 'De 3 Grote Foto-Fouten', '📸', 'VIDEO', 6,
  NULL, NULL,
  '{
    "hook": "78% van mensen besluit binnen 3 seconden of ze naar rechts swipen. Drie seconden. En weet je wat het ergste is? De meeste mannen en vrouwen maken dezelfde drie fouten. Fouten die ze onzichtbaar maken.",
    "intro": "Hoi, ik ben Iris. Vandaag leer je de drie foto-fouten die bijna iedereen maakt — en hoe jij ze vanaf nu vermijdt.",
    "secties": [
      {"titel": "Fout 1: De Zonnebril", "content": "Je ogen zijn het raam naar je ziel. Letterlijk. Onderzoek toont aan dat profielen met zichtbare ogen 30% meer vertrouwen wekken. Een zonnebril blokkeert dat. Het zegt: ''Ik heb iets te verbergen.'' Zelfs als je gewoon op het strand was. Hoofdfoto met zonnebril? Direct naar links geswiped."},
      {"titel": "Fout 2: De Groepsfoto als Hoofdfoto", "content": "Je staat met vijf vrienden. Iedereen lacht. Gezellig toch? Nee. Want niemand weet wie JIJ bent. En nee, mensen gaan niet zoeken. Ze swipen door. Groepsfoto''s mogen — maar nooit als eerste. En maximaal één. Anders lijkt het alsof je jezelf niet durft te laten zien."},
      {"titel": "Fout 3: De Vage Foto", "content": "Slecht licht. Wazig. Van ver weg. In een donkere kroeg. Deze foto''s schreeuwen: ''Ik heb geen goede foto''s van mezelf.'' En dat is een rode vlag. Het suggereert dat je iets verbergt, of dat je geen moeite doet. Beiden zijn turn-offs."},
      {"titel": "De oplossing", "content": "Je hoofdfoto moet zijn: duidelijk gezicht, goede belichting, jij alleen, en een authentieke uitdrukking. Geen pose. Geen filter. Gewoon jij, op je best. Morgen duiken we dieper in de psychologie achter foto''s die wél werken."}
    ],
    "opdracht": "Pak je telefoon. Verzamel minimaal 10 foto''s van jezelf uit de afgelopen 2 jaar. Kijk naar elke foto en check: zonnebril? Groep? Vaag? Markeer welke foto''s deze fouten maken. Wees kritisch. In je werkboek is een checklist.",
    "outro": "Morgen leer je waarom sommige foto''s onweerstaanbaar zijn — en het heeft niets met uiterlijk te maken. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Waarom is een zonnebril op je hoofdfoto een probleem?", "opties": [{"tekst": "Het ziet er niet cool uit", "correct": false}, {"tekst": "Het blokkeert oogcontact en wekt minder vertrouwen", "correct": true}, {"tekst": "Zonnebrillen zijn uit de mode", "correct": false}, {"tekst": "Het is geen probleem", "correct": false}], "feedback_correct": "Precies! Ogen zichtbaar = 30% meer vertrouwen. Zonnebrillen blokkeren die connectie.", "feedback_incorrect": "Niet helemaal. Het gaat om vertrouwen: zichtbare ogen wekken 30% meer vertrouwen."},
      {"vraag": "Hoeveel groepsfoto''s mag je maximaal hebben?", "opties": [{"tekst": "Geen enkele", "correct": false}, {"tekst": "Maximaal 1, en nooit als hoofdfoto", "correct": true}, {"tekst": "Zoveel als je wilt", "correct": false}, {"tekst": "Alleen groepsfoto''s", "correct": false}], "feedback_correct": "Correct! Eén groepsfoto kan sociale proof geven, maar nooit als eerste.", "feedback_incorrect": "Groepsfoto''s mogen, maar maximaal 1 en nooit als hoofdfoto."}
    ]
  }'::jsonb,
  '{"titel": "Foto Audit", "stappen": ["Verzamel 10+ foto''s van jezelf (laatste 2 jaar)", "Check elke foto op: zonnebril? ❌/✓", "Check elke foto op: groepsfoto? ❌/✓", "Check elke foto op: vaag/slecht licht? ❌/✓", "Markeer foto''s zonder fouten als ''potentieel''"]}'::jsonb,
  2
);

-- DAG 3: De Psychologie van Foto's die Werken
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week1_id, v_program_id, 3, 'De Psychologie van Foto''s die Werken', '🧠', 'VIDEO', 7,
  'AI Foto Check', 'ai-foto-check',
  '{
    "hook": "Waarom krijgt die ene persoon honderden likes, terwijl iemand die net zo aantrekkelijk is wordt genegeerd? Het antwoord zit niet in hun uiterlijk. Het zit in de psychologie van hun foto''s.",
    "intro": "Hoi, ik ben Iris. Vandaag onthul ik de wetenschap achter foto''s die wél werken — en je gaat je eerste foto''s door de AI Foto Check halen.",
    "secties": [
      {"titel": "Het Halo Effect", "content": "Als iemand één positieve eigenschap ziet, nemen ze aan dat je meer positieve eigenschappen hebt. Een warme glimlach? Dan ben je vast ook aardig, betrouwbaar en leuk. Dit heet het Halo Effect. Je foto is je eerste indruk — en die indruk kleurt álles wat daarna komt."},
      {"titel": "Spontaan vs. Geposeerd", "content": "Geposeerde foto''s voelen nep. Je brein herkent het verschil. Een spontane lach activeert andere hersengebieden dan een geforceerde glimlach. Tip: de beste foto''s zijn vaak gemaakt toen je niet wist dat er een camera was. Of wanneer je echt lachte om iets grappigs."},
      {"titel": "De 3 Seconden Regel", "content": "Je foto moet in 3 seconden drie vragen beantwoorden: Wie ben je? Ben je betrouwbaar? Ben je interessant? Als je foto ook maar één van deze vragen niet beantwoordt, swipe. Daarom werkt een duidelijke foto met authentieke expressie beter dan een ''coole'' foto waar je mysterieus probeert te zijn."},
      {"titel": "Wat de AI Foto Check meet", "content": "Onze AI analyseert: gezichtsuitdrukking, belichting, compositie, achtergrond, en de algehele ''vibe''. Je krijgt een score van 0-100 en concrete tips. Geen vaag advies, maar: ''Deze foto scoort 73, verbeter de belichting en je komt boven de 85.''"}
    ],
    "opdracht": "Open de AI Foto Check tool. Upload je 5 beste foto''s uit je verzameling van gisteren. Je krijgt voor elke foto een score en concrete feedback. Focus nu nog niet op perfectie — we verzamelen data. Noteer de scores in je werkboek.",
    "outro": "Morgen gaan we specifiek naar je hoofdfoto kijken. Die ene foto die 80% van je succes bepaalt. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Wat is het Halo Effect?", "opties": [{"tekst": "Een Instagram filter", "correct": false}, {"tekst": "Als iemand één positieve eigenschap ziet, nemen ze aan dat je meer positieve eigenschappen hebt", "correct": true}, {"tekst": "Belichting rondom je hoofd", "correct": false}, {"tekst": "Een dating app feature", "correct": false}], "feedback_correct": "Precies! Eén goede indruk kleurt de hele perceptie. Daarom is je eerste foto zo belangrijk.", "feedback_incorrect": "Het Halo Effect betekent dat één positieve eigenschap invloed heeft op hoe mensen je hele persoonlijkheid inschatten."}
    ]
  }'::jsonb,
  '{"titel": "AI Foto Check Ronde 1", "stappen": ["Open de AI Foto Check tool", "Upload je 5 beste foto''s", "Noteer de score van elke foto (0-100)", "Lees de feedback per foto", "Markeer de top 3 met hoogste scores"]}'::jsonb,
  3
);

-- DAG 4: De Perfecte Hoofdfoto
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week1_id, v_program_id, 4, 'De Perfecte Hoofdfoto', '⭐', 'VIDEO', 7,
  'AI Foto Check', 'ai-foto-check',
  '{
    "hook": "Je hoofdfoto bepaalt 80% van je dating succes. Tachtig procent. Eén foto. Vandaag gaan we die foto perfectioneren.",
    "intro": "Hoi, ik ben Iris. Je hebt gisteren je foto''s geanalyseerd. Nu gaan we focussen op de belangrijkste: je hoofdfoto.",
    "secties": [
      {"titel": "Waarom 80%?", "content": "De meeste mensen swipen alleen op de eerste foto. Ze openen je profiel niet eens. Je hoofdfoto IS je eerste indruk, je elevator pitch, je hele verhaal in één beeld. Geen druk verder."},
      {"titel": "De 4 elementen van een perfecte hoofdfoto", "content": "Eén: alleen jij in beeld. Geen afleiding. Twee: gezicht duidelijk zichtbaar, minimaal 60% van het frame. Drie: goede belichting — natuurlijk daglicht is je vriend. Vier: authentieke expressie — een echte glimlach of ontspannen blik."},
      {"titel": "De achtergrond doet ertoe", "content": "Een rommelige achtergrond = rommelig leven. Onbewust. Kies voor een rustige achtergrond die niet afleidt. Buiten in de natuur, een mooie muur, of gewoon neutraal. Geen badkamer spiegel selfie. Alsjeblieft."},
      {"titel": "Wat vermijden", "content": "Geen zonnebril. Geen hoed die je gezicht verbergt. Geen extreme filters. Geen foto van 5 jaar geleden. Geen gym selfie als hoofdfoto. Geen foto met een ex die je hebt uitgeknipt — ja, mensen zien dat."}
    ],
    "opdracht": "Kijk naar je top 3 foto''s van gisteren. Welke voldoet het beste aan de 4 elementen? Upload die ene foto opnieuw naar de AI Foto Check en vraag specifiek om feedback op je hoofdfoto. Scoor je boven de 80? Gefeliciteerd. Onder de 80? Dat is oké — we hebben nog tijd.",
    "outro": "Morgen kijken we naar je complete foto mix. Want één goede foto is niet genoeg. Je hebt een verhaal nodig. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Hoeveel procent van je dating succes wordt bepaald door je hoofdfoto?", "opties": [{"tekst": "20%", "correct": false}, {"tekst": "50%", "correct": false}, {"tekst": "80%", "correct": true}, {"tekst": "100%", "correct": false}], "feedback_correct": "Correct! De meeste mensen swipen alleen op je eerste foto.", "feedback_incorrect": "Je hoofdfoto bepaalt ongeveer 80% van je succes — de meeste mensen swipen alleen op foto 1."}
    ]
  }'::jsonb,
  '{"titel": "Hoofdfoto Selectie", "stappen": ["Review je top 3 foto''s van gisteren", "Check elke foto op de 4 elementen", "Selecteer je beste kandidaat-hoofdfoto", "Upload naar AI Foto Check voor specifieke feedback", "Noteer: score + belangrijkste verbeterpunt"]}'::jsonb,
  4
);

-- DAG 5: Je Complete Foto Mix
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week1_id, v_program_id, 5, 'Je Complete Foto Mix', '🎨', 'VIDEO', 8,
  'AI Foto Check', 'ai-foto-check',
  '{
    "hook": "Je hebt één kans om je verhaal te vertellen. 4-6 foto''s. Dat is het. Vandaag leer je welke foto''s je nodig hebt om een compleet beeld te geven.",
    "intro": "Hoi, ik ben Iris. Je hoofdfoto is belangrijk, maar je andere foto''s bepalen of iemand daadwerkelijk naar rechts swiped. Laten we je mix perfectioneren.",
    "secties": [
      {"titel": "De 6 Foto Types", "content": "Eén: De Hoofdfoto — duidelijk gezicht, authentieke expressie. Twee: De Full Body — laat zien hoe je eruit ziet. Drie: De Hobby Foto — toon wat je leuk vindt. Vier: De Sociale Foto — jij met vrienden (max 1). Vijf: De Reisfoto — avontuur of cultuur. Zes: De Wild Card — iets unieks dat gesprek start."},
      {"titel": "Variatie is key", "content": "6 foto''s in dezelfde outfit? Saai. 6 selfies? Desperate. 6 foto''s op vakantie? Je woont niet op Bali. Mix je settings, outfits en activiteiten. Laat zien dat je een leven hebt."},
      {"titel": "De volgorde matters", "content": "Foto 1: Hoofdfoto — aantrekking. Foto 2: Full body of hobby — meer context. Foto 3-4: Interesses en persoonlijkheid. Foto 5-6: Sociale of wild card. Eindig sterk. De laatste foto is wat mensen onthouden voordat ze beslissen."},
      {"titel": "Wat je NIET moet doen", "content": "Niet: alleen selfies. Niet: alleen reisfoto''s. Niet: foto''s met andere gender (lijkt op ex). Niet: foto''s met kinderen die niet van jou zijn (verwarrend). Niet: memes of quotes als foto."}
    ],
    "opdracht": "Stel je ideale 4-6 foto mix samen. Gebruik de types als checklist. Heb je niet alle types? Geen probleem — noteer welke je mist. We kunnen creatief zijn met wat je hebt. Upload je volledige selectie naar de AI Foto Check.",
    "outro": "Morgen nemen we een stapje terug. We praten over authenticiteit versus optimalisatie. Wanneer is ''je beste zelf laten zien'' eerlijk, en wanneer wordt het misleidend? Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Hoeveel foto''s zou je ideaal gezien moeten hebben?", "opties": [{"tekst": "1-2", "correct": false}, {"tekst": "4-6", "correct": true}, {"tekst": "10+", "correct": false}, {"tekst": "Maakt niet uit", "correct": false}], "feedback_correct": "Correct! 4-6 foto''s geven genoeg context zonder overweldigend te zijn.", "feedback_incorrect": "4-6 foto''s is ideaal — genoeg om een verhaal te vertellen."}
    ]
  }'::jsonb,
  '{"titel": "Foto Mix Samenstellen", "stappen": ["Check welke van de 6 foto types je hebt", "Selecteer 4-6 foto''s voor je mix", "Zorg voor variatie in setting/outfit/activiteit", "Bepaal de volgorde (sterkste eerst en laatst)", "Upload complete mix naar AI Foto Check"]}'::jsonb,
  5
);

-- DAG 6: Authenticiteit vs. Optimalisatie
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, display_order
) VALUES (
  v_week1_id, v_program_id, 6, 'Authenticiteit vs. Optimalisatie', '🎭', 'VIDEO', 6,
  NULL, NULL,
  '{
    "hook": "Is het misleidend om je beste foto''s te gebruiken? Waar ligt de grens tussen jezelf goed presenteren en catfishen? Vandaag bespreken we de ethiek van profiel-optimalisatie.",
    "intro": "Hoi, ik ben Iris. Dit is misschien de belangrijkste les van de week. Want alle tips die ik je geef zijn waardeloos als je eerste date begint met teleurstelling.",
    "secties": [
      {"titel": "De Gouden Regel", "content": "Als iemand je in het echt ziet, moeten ze denken: ''Oh, die foto''s klopten.'' Niet: ''Die zag er online heel anders uit.'' Je foto''s mogen je beste zelf zijn — maar het moet wel jij zijn."},
      {"titel": "Wat WEL mag", "content": "Goede belichting gebruiken. Je beste outfits dragen. Foto''s kiezen waar je goed op staat. Zorgen voor een nette achtergrond. Lachen als je dat normaal ook doet. Dit is niet misleiden — dit is jezelf goed presenteren."},
      {"titel": "Wat NIET mag", "content": "Foto''s van 5+ jaar geleden als je er nu anders uitziet. Zware filters die je gezicht veranderen. Alleen foto''s vanuit je beste hoek terwijl je er in 3D heel anders uitziet. Foto''s met haar als je kaal bent geworden. Wees eerlijk."},
      {"titel": "Waarom eerlijkheid loont", "content": "Als iemand op je profiel swiped, vinden ze JOU aantrekkelijk. Als je foto''s misleidend zijn, vinden ze een fictieve versie aantrekkelijk. Die eerste date wordt dan ongemakkelijk. Maar als je foto''s kloppen? Dan weten jullie allebei: hier is wederzijdse aantrekking."}
    ],
    "opdracht": "Kijk kritisch naar je geselecteerde foto''s. Vraag jezelf: zou iemand die mij morgen op straat ziet, mij herkennen van deze foto''s? Zo niet, vervang de foto. Vraag eventueel een eerlijke vriend om feedback.",
    "outro": "Morgen is het tijd voor de week review. We kijken naar je complete foto-selectie en maken de laatste aanpassingen. Tot morgen!"
  }'::jsonb,
  '{"vraag": "Kijk naar je geselecteerde foto''s. Zou iemand die jou morgen in het echt ziet, je herkennen? Wees eerlijk.", "doel": "Zelfreflectie over authenticiteit"}'::jsonb,
  '{"titel": "Authenticiteit Check", "stappen": ["Bekijk elke foto kritisch", "Vraag: is dit hoe ik er nu uitzie?", "Check: geen zware filters gebruikt?", "Check: foto''s van afgelopen 1-2 jaar?", "Optioneel: vraag een vriend om eerlijke feedback"]}'::jsonb,
  6
);

-- DAG 7: Week 1 Review
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, display_order
) VALUES (
  v_week1_id, v_program_id, 7, 'Week 1 Review: Je Foto''s Staan', '📸', 'VIDEO', 5,
  NULL, NULL,
  '{
    "hook": "Week 1 zit erop! Je hebt de 3 grote foto-fouten geleerd, de psychologie achter goede foto''s ontdekt, en je eigen selectie samengesteld. Tijd om te vieren — en te delen.",
    "intro": "Hoi, ik ben Iris. Gefeliciteerd met het afronden van week 1! Laten we even terugkijken op wat je hebt bereikt.",
    "secties": [
      {"titel": "Wat je hebt geleerd", "content": "De 3 foto-fouten: zonnebril, groepsfoto als hoofdfoto, vage foto''s. Het Halo Effect en de 3-seconden regel. De 6 foto types voor een complete mix. En het verschil tussen optimalisatie en misleiding."},
      {"titel": "Wat je hebt gedaan", "content": "Je hebt 10+ foto''s verzameld. Je beste foto''s door de AI Check gehaald. Een hoofdfoto geselecteerd. Een complete mix van 4-6 foto''s samengesteld. En kritisch gekeken naar authenticiteit."},
      {"titel": "De community", "content": "In de community kun je je foto''s delen voor feedback van andere deelnemers. Dit is optioneel, maar waardevol. Andere mensen zien dingen die jij niet ziet."},
      {"titel": "Volgende week", "content": "Week 2 gaat over je bio en platform keuze. Je foto''s trekken de aandacht — je bio houdt die vast en start gesprekken. Maandag beginnen we met de basis van een goede bio."}
    ],
    "opdracht": "Finaliseer je foto selectie. Als je durft: deel je hoofdfoto in de community en vraag om feedback. Rust dit weekend even uit. Je hebt goed werk geleverd.",
    "outro": "Geniet van je weekend. Maandag gaan we verder met je bio — en geloof me, daar wordt het pas echt interessant. Tot maandag!"
  }'::jsonb,
  '{"vraag": "Wat was je grootste inzicht van deze week over je foto''s?", "doel": "Consolidatie van weeklearnings"}'::jsonb,
  '{"titel": "Week 1 Afsluiting", "stappen": ["Review je finale foto selectie (4-6 foto''s)", "Noteer de AI scores van elke foto", "Optioneel: deel in community voor feedback", "Vul in: hoe voel je je over je foto''s nu vs. dag 1?", "Rust uit — maandag gaan we verder!"]}'::jsonb,
  7
);

-- ============================================
-- WEEK 2: Bio & Platform
-- ============================================
INSERT INTO program_weeks (program_id, week_nummer, titel, thema, kpi, emoji)
VALUES (v_program_id, 2, 'Bio & Platform', 'Van saai naar gespreksstarter', 'Bio met 80%+ score en live profiel', '✍️')
RETURNING id INTO v_week2_id;

-- DAG 8: Bio Basics: Show, Don't Tell
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week2_id, v_program_id, 8, 'Bio Basics: Show, Don''t Tell', '✍️', 'VIDEO', 7,
  'Profiel Coach', 'profiel-coach',
  '{
    "hook": "''Ik ben spontaan, avontuurlijk en hou van gezelligheid.'' Gefeliciteerd, je hebt zojuist beschreven wat 80% van alle profielen zegt. En je hebt precies nul indruk gemaakt. Vandaag leer je hoe het wél moet.",
    "intro": "Hoi, ik ben Iris. Week 2 is begonnen en we duiken in het onderdeel waar de meeste mensen falen: je bio.",
    "secties": [
      {"titel": "Het probleem met ''ik ben...''", "content": "Iedereen zegt dat ze spontaan zijn. Iedereen houdt van reizen. Iedereen is ''gewoon mezelf''. Het probleem? Het zegt niets. Het is abstract. Het creëert geen beeld. En het geeft niemand een reden om te reageren."},
      {"titel": "Show, Don''t Tell", "content": "In plaats van ''ik ben avontuurlijk'', schrijf je: ''Vorige maand ben ik om 5 uur opgestaan om de zonsopgang te zien vanaf de Posbank.'' Nu weet iemand: je bent avontuurlijk, je houdt van natuur, en je bent blijkbaar een ochtendmens. En ze hebben iets om over te praten!"},
      {"titel": "De formule", "content": "Neem een eigenschap die je wilt communiceren. Bedenk een concreet voorbeeld. Schrijf dat voorbeeld in 1-2 zinnen. Klaar. ''Ik kook graag'' wordt ''Zondag is pasta-dag. Ik maak de saus van scratch, met tomaten van de markt.''"},
      {"titel": "Waarom dit werkt", "content": "Concrete details zijn memorabel. Ze maken je uniek. En ze geven de ander iets om op te reageren. ''Oh, ik hou ook van zonsopgangen!'' of ''Welke pastasaus is je specialty?'' Gesprek gestart."}
    ],
    "opdracht": "Open de Profiel Coach tool. Plak je huidige bio (of schrijf je eerste poging). De AI geeft je feedback op hoe concreet en ''show don''t tell'' je bio is. Noteer je score en de belangrijkste verbeterpunten.",
    "outro": "Morgen focussen we op het belangrijkste onderdeel van je bio: de eerste zin. Die bepaalt of iemand doorleest. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Wat is het probleem met ''Ik ben spontaan en avontuurlijk''?", "opties": [{"tekst": "Het is te lang", "correct": false}, {"tekst": "Het is abstract en zegt iedereen — het maakt je niet uniek", "correct": true}, {"tekst": "Het is grammaticaal incorrect", "correct": false}, {"tekst": "Er is niets mis mee", "correct": false}], "feedback_correct": "Precies! Abstract = saai. Concreet = memorabel en gespreksstarter.", "feedback_incorrect": "Het probleem is dat het abstract is — iedereen zegt dit."}
    ]
  }'::jsonb,
  '{"titel": "Bio Analyse", "stappen": ["Schrijf of plak je huidige bio", "Upload naar Profiel Coach", "Noteer je score (0-100)", "Markeer zinnen met ''ik ben...'' (abstract)", "Noteer de belangrijkste verbeterpunten"]}'::jsonb,
  8
);

-- DAG 9: De Hook: Je Eerste Zin
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week2_id, v_program_id, 9, 'De Hook: Je Eerste Zin', '🎣', 'VIDEO', 6,
  'Profiel Coach', 'profiel-coach',
  '{
    "hook": "De eerste zin van je bio bepaalt of iemand doorleest of doorscrollt. Je hebt letterlijk één zin om iemands aandacht te grijpen.",
    "intro": "Hoi, ik ben Iris. We gaan vandaag werken aan het belangrijkste stukje tekst in je hele profiel: je eerste zin.",
    "secties": [
      {"titel": "Waarom de eerste zin cruciaal is", "content": "Mensen lezen niet. Ze scannen. Ze zien je foto, dan de eerste regel van je bio. Als die niet pakt, zijn ze weg. Je eerste zin is je hook — de reden om verder te lezen."},
      {"titel": "5 Hook Formules", "content": "Eén: De vraag. ''Kun jij een betere carbonara maken dan ik?'' Twee: De uitdaging. ''Zoek iemand die me eindelijk verslaat met Mario Kart.'' Drie: De confessie. ''Ik geef toe: ik huil bij Pixar films.'' Vier: Het onverwachte. ''Vorige week heb ik een cursus kaasboerderij gevolgd.'' Vijf: De humor. ''Op zoek naar iemand die mijn slechte woordgrappen waardeert.''"},
      {"titel": "Wat te vermijden", "content": "Geen: ''Hoi, ik ben [naam].'' Dat staat al in je profiel. Geen: ''Ik weet niet wat ik hier moet schrijven.'' Dat schreeuwt onzekerheid. Geen: clichés als ''Partner in crime gezocht.''"},
      {"titel": "De test", "content": "Lees je eerste zin hardop. Zou jij, als je dit las, denken: ''Oh, interessant''? Of zou je denken: ''Meh''? Als het ''meh'' is, herschrijf."}
    ],
    "opdracht": "Schrijf 5 verschillende eerste zinnen voor je bio, elk met een andere formule. Upload ze naar de Profiel Coach en vraag om feedback. Selecteer de sterkste als je nieuwe opener.",
    "outro": "Morgen is de live Q&A! Bereid je vragen voor over foto''s of bio. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Welke opening moet je vermijden?", "opties": [{"tekst": "Een vraag die gesprek uitlokt", "correct": false}, {"tekst": "''Hoi, ik ben [naam]'' of ''Ik weet niet wat ik moet schrijven''", "correct": true}, {"tekst": "Een grappige opmerking", "correct": false}, {"tekst": "Een onverwachte confessie", "correct": false}], "feedback_correct": "Correct! ''Hoi ik ben...'' voegt niets toe, en ''ik weet niet...'' toont onzekerheid.", "feedback_incorrect": "Vermijd saaie of onzekere openers zoals ''Hoi ik ben...'' en ''ik weet niet...''"}
    ]
  }'::jsonb,
  '{"titel": "5 Hook Openers", "stappen": ["Schrijf een opener met ''de vraag'' formule", "Schrijf een opener met ''de uitdaging'' formule", "Schrijf een opener met ''de confessie'' formule", "Schrijf een opener met ''het onverwachte'' formule", "Schrijf een opener met ''de humor'' formule", "Upload alle 5 naar Profiel Coach", "Selecteer de beste op basis van feedback"]}'::jsonb,
  9
);

-- DAG 10: Mid-Check Live Q&A
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, display_order
) VALUES (
  v_week2_id, v_program_id, 10, 'Mid-Check Live Q&A', '🎙️', 'LIVE', 30,
  NULL, NULL,
  '{
    "hook": "Halverwege! Je hebt je foto''s op orde en je bent begonnen aan je bio. Tijd om even te checken: hoe gaat het? Wat zijn je vragen?",
    "intro": "Hoi, ik ben Iris. Welkom bij de Mid-Check Q&A. Dit is jouw moment om vragen te stellen.",
    "secties": [
      {"titel": "Check-in", "content": "Hoe voelt de reis tot nu toe? Wat was je grootste inzicht? Waar worstel je mee?"},
      {"titel": "Veelgestelde vragen", "content": "Hier behandelen we de meest gestelde vragen van de groep."},
      {"titel": "Live Feedback", "content": "Als je durft, kun je je profiel delen voor live feedback."},
      {"titel": "Vooruitblik", "content": "De rest van week 2 focust op prompts, platform keuze, en je profiel live zetten."}
    ],
    "opdracht": "Bereid minimaal 1 vraag voor de Q&A voor.",
    "outro": "Morgen gaan we verder met prompts en vragen beantwoorden. Tot morgen!"
  }'::jsonb,
  '{"vraag": "Wat is je grootste vraag of uitdaging tot nu toe?", "doel": "Voorbereiding op Q&A"}'::jsonb,
  '{"titel": "Mid-Check Reflectie", "stappen": ["Noteer je grootste inzicht tot nu toe", "Schrijf je belangrijkste vraag op", "Optioneel: bereid profiel voor om te delen", "Check je voortgang: foto''s ✓ / bio in progress"]}'::jsonb,
  10
);

-- DAG 11: Prompts & Vragen Beantwoorden
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week2_id, v_program_id, 11, 'Prompts & Vragen Beantwoorden', '💬', 'VIDEO', 7,
  'Profiel Coach', 'profiel-coach',
  '{
    "hook": "De meeste dating apps geven je prompts: ''Een perfecte eerste date is...'', ''Ik kan niet zonder...''. Hoe je deze beantwoordt maakt het verschil tussen een match en een skip.",
    "intro": "Hoi, ik ben Iris. Vandaag leren we prompts beantwoorden op een manier die gesprekken start.",
    "secties": [
      {"titel": "Waarom prompts belangrijk zijn", "content": "Prompts zijn gespreksstarters. Ze geven de ander iets om op te reageren. Een goede prompt-antwoord kan de reden zijn dat iemand je een bericht stuurt."},
      {"titel": "De 3 P''s", "content": "Persoonlijk: het moet specifiek over JOU gaan. Playful: een beetje humor of lichtheid werkt. Praktisch: geef de ander iets om op te reageren."},
      {"titel": "Voorbeelden", "content": "''Ik kan niet zonder...'' → ''Mijn koffiezetapparaat. Vraag me niet hoe ik ben vóór de eerste kop.'' ''Mijn gekste avontuur...'' → ''Verdwaald raken in Tokyo zonder data of kaart. Ik heb 3 uur rondgelopen en de beste ramen van mijn leven gevonden.''"}
    ],
    "opdracht": "Kies 3 prompts die je dating app biedt. Schrijf voor elk prompt een antwoord volgens de 3 P''s. Upload ze naar de Profiel Coach voor feedback.",
    "outro": "Morgen gaan we kijken welk dating platform het beste bij jou past. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Wat zijn de 3 P''s voor goede prompt-antwoorden?", "opties": [{"tekst": "Perfect, Polished, Professional", "correct": false}, {"tekst": "Persoonlijk, Playful, Praktisch", "correct": true}, {"tekst": "Popular, Positive, Powerful", "correct": false}], "feedback_correct": "Correct! Persoonlijk (over jou), Playful (licht), Praktisch (gespreksstarter).", "feedback_incorrect": "De 3 P''s zijn: Persoonlijk, Playful, en Praktisch."}
    ]
  }'::jsonb,
  '{"titel": "Prompts Beantwoorden", "stappen": ["Kies 3 prompts van je dating app", "Schrijf voor elke prompt een antwoord", "Check: is het persoonlijk? playful? praktisch?", "Upload naar Profiel Coach voor feedback"]}'::jsonb,
  11
);

-- DAG 12: Platform Keuze
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week2_id, v_program_id, 12, 'Platform Keuze: Waar Hoor Jij?', '📱', 'VIDEO', 8,
  NULL, NULL,
  '{
    "hook": "Tinder, Bumble, Hinge, Happn, Inner Circle, Lexa... Er zijn tientallen dating apps. En nee, ze zijn niet allemaal hetzelfde.",
    "intro": "Hoi, ik ben Iris. Vandaag help ik je kiezen welk platform het beste bij jou past.",
    "secties": [
      {"titel": "De grote spelers", "content": "Tinder: volume, alle leeftijden. Bumble: vrouwen beginnen, iets serieuzer. Hinge: ''designed to be deleted'', relatie-gericht. Inner Circle: selectief, hoger opgeleid. Lexa: Nederlands, alle leeftijden, serieuzer."},
      {"titel": "Kies op basis van je doel", "content": "Wil je veel matches? Tinder. Controle als vrouw? Bumble. Echte relatie? Hinge of Lexa. Hoger opgeleid? Inner Circle."},
      {"titel": "Kies op basis van je leeftijd", "content": "Onder de 30? Tinder, Bumble, Hinge. 30-40? Hinge, Bumble, Inner Circle. 40+? Lexa, Parship."},
      {"titel": "Mijn advies", "content": "Kies maximaal 2 apps. Focus is beter dan versnippering."}
    ],
    "opdracht": "Kies 1-2 platforms die passen bij jouw doel en leeftijd. Download ze als je ze nog niet hebt.",
    "outro": "Morgen is de grote dag: je profiel gaat online. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Hoeveel dating apps zou je idealiter tegelijk gebruiken?", "opties": [{"tekst": "Zo veel mogelijk", "correct": false}, {"tekst": "1-2 apps met focus", "correct": true}, {"tekst": "Precies 5", "correct": false}], "feedback_correct": "Correct! Focus is beter dan versnippering.", "feedback_incorrect": "1-2 apps is ideaal — je kunt je dan focussen."}
    ]
  }'::jsonb,
  '{"titel": "Platform Selectie", "stappen": ["Bepaal je primaire doel", "Noteer je leeftijdscategorie", "Kies 1-2 platforms die passen", "Download de apps", "Maak een account aan"]}'::jsonb,
  12
);

-- DAG 13: Profiel Live Zetten
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, display_order
) VALUES (
  v_week2_id, v_program_id, 13, 'Profiel Live Zetten', '🚀', 'VIDEO', 6,
  NULL, NULL,
  '{
    "hook": "Dit is het moment. Je foto''s zijn klaar. Je bio is geschreven. Tijd om je profiel de wereld in te sturen.",
    "intro": "Hoi, ik ben Iris. Vandaag gaat je profiel live.",
    "secties": [
      {"titel": "De laatste check", "content": "Heb je 4-6 foto''s? Is je hoofdfoto sterk? Is je bio ''show don''t tell''? Heb je prompts beantwoord?"},
      {"titel": "De upload", "content": "Upload je foto''s in de juiste volgorde. Kopieer je bio. Vul je prompts in. Publiceer."},
      {"titel": "De eerste 24 uur", "content": "Nieuwe profielen krijgen vaak een boost. Wees de komende dag actief."},
      {"titel": "Verwachtingen", "content": "Je gaat niet meteen honderden matches krijgen. Kwaliteit boven kwantiteit."}
    ],
    "opdracht": "Zet je profiel live. Wees de komende 24 uur actief. Noteer hoeveel matches je krijgt.",
    "outro": "Morgen is de week 2 review. Tot morgen!"
  }'::jsonb,
  '{"vraag": "Hoe voelt het om je profiel live te zetten?", "doel": "Emotionele check-in"}'::jsonb,
  '{"titel": "Profiel Live", "stappen": ["Laatste check: foto''s, bio, prompts", "Upload alles naar je app(s)", "Profiel publiceren", "24 uur actief zijn", "Noteer: aantal matches eerste 24 uur"]}'::jsonb,
  13
);

-- DAG 14: Week 2 Review
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, display_order
) VALUES (
  v_week2_id, v_program_id, 14, 'Week 2 Review: Je Profiel Staat', '📝', 'VIDEO', 5,
  'Profiel Coach', 'profiel-coach',
  '{
    "hook": "Week 2 zit erop! Je profiel staat live. Hoe voelt dat?",
    "intro": "Hoi, ik ben Iris. Gefeliciteerd met het afronden van week 2!",
    "secties": [
      {"titel": "Wat je hebt bereikt", "content": "Show don''t tell geleerd. Sterke eerste zin. Prompts beantwoord. Platform gekozen. Profiel live."},
      {"titel": "De cijfers", "content": "Hoeveel matches heb je? Vergelijk met je startmeting."},
      {"titel": "Fine-tuning", "content": "Weinig matches? Check hoofdfoto en bio met AI tools."},
      {"titel": "Volgende week", "content": "Week 3: gesprekken. Van openingszin tot date vragen."}
    ],
    "opdracht": "Finale check met Profiel Coach. Scoor je 80%+?",
    "outro": "Geniet van je weekend. Maandag leren we gesprekken starten. Tot dan!"
  }'::jsonb,
  '{"vraag": "Wat was het verschil tussen je oude en nieuwe profiel?", "doel": "Bewustwording van groei"}'::jsonb,
  '{"titel": "Week 2 Afsluiting", "stappen": ["Finale check bio met Profiel Coach", "Noteer je score (doel: 80%+)", "Tel je matches sinds dag 13", "Vergelijk met startmeting"]}'::jsonb,
  14
);

-- ============================================
-- WEEK 3: Gesprekken & Connectie
-- ============================================
INSERT INTO program_weeks (program_id, week_nummer, titel, thema, kpi, emoji)
VALUES (v_program_id, 3, 'Gesprekken & Connectie', 'Van match naar gesprek naar date', '3+ gesprekken voorbij de opener', '💬')
RETURNING id INTO v_week3_id;

-- DAG 15: Openingszinnen die Werken
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week3_id, v_program_id, 15, 'Openingszinnen die Werken', '💬', 'VIDEO', 7,
  'IJsbreker Generator', 'ijsbreker-generator',
  '{
    "hook": "''Hoi.'' ''Hey.'' ''Hoe gaat het?'' Dit zijn de drie meest gebruikte openingszinnen. En ze zijn alle drie verschrikkelijk.",
    "intro": "Hoi, ik ben Iris. Week 3 begint — de week van de gesprekken. Het begint met je openingszin.",
    "secties": [
      {"titel": "Waarom ''hoi'' niet werkt", "content": "''Hoi'' is lui. Het laat zien dat je geen moeite hebt gedaan. Het geeft niets om op te reageren."},
      {"titel": "De 4 typen openers", "content": "1) Profiel-referentie: ''Ik zie dat je in Japan bent geweest — favoriete plek?'' 2) Speelse vraag: ''Ananas op pizza, ja of nee?'' 3) Compliment-plus: ''Je foto bij de Eiffeltoren is geweldig — eerste keer Parijs?'' 4) Gedeelde interesse: ''Ook Office fan? Team Jim of Team Dwight?''"},
      {"titel": "De formule", "content": "Kijk naar hun profiel. Vind iets specifieks. Stel een vraag daarover."},
      {"titel": "Wat te vermijden", "content": "Geen: ''Hoi schoonheid.'' Geen: lange paragrafen. Geen: seksuele opmerkingen."}
    ],
    "opdracht": "Open de IJsbreker Generator. Selecteer 3-5 matches. Genereer openers. Stuur de beste. Noteer response rate.",
    "outro": "Morgen: de eerste 3 berichten die bepalen of het gesprek doorgaat. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Wat is de beste aanpak voor een opener?", "opties": [{"tekst": "Een lang verhaal over jezelf", "correct": false}, {"tekst": "Refereer aan iets specifieks uit hun profiel", "correct": true}, {"tekst": "Een compliment over hun uiterlijk", "correct": false}], "feedback_correct": "Correct! Specifieke profiel-referentie toont interesse.", "feedback_incorrect": "De beste openers refereren aan iets specifieks uit hun profiel."}
    ]
  }'::jsonb,
  '{"titel": "Eerste Openers Sturen", "stappen": ["Open IJsbreker Generator", "Selecteer 3-5 matches", "Genereer openers", "Stuur de beste", "Track response rate"]}'::jsonb,
  15
);

-- DAG 16: De Eerste 3 Berichten
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, werkboek, display_order
) VALUES (
  v_week3_id, v_program_id, 16, 'De Eerste 3 Berichten', '1️⃣2️⃣3️⃣', 'VIDEO', 7,
  'IJsbreker Generator', 'ijsbreker-generator',
  '{
    "hook": "Je opener is verstuurd. Ze hebben gereageerd! En nu?",
    "intro": "Hoi, ik ben Iris. Vandaag: de kunst van de follow-up.",
    "secties": [
      {"titel": "Bericht 1", "content": "De opener. Gedaan."},
      {"titel": "Bericht 2: Verdiepen", "content": "Ga dieper in op hun antwoord. Stel een vervolgvraag. Deel iets over jezelf."},
      {"titel": "Bericht 3: Nieuwe richting", "content": "Introduceer een nieuw onderwerp. Houd het fris."},
      {"titel": "De balans", "content": "Stel vragen én deel. Een gesprek is geen interview."}
    ],
    "opdracht": "Stuur 5+ eerste berichten. Stuur vervolgberichten in lopende gesprekken.",
    "outro": "Morgen: hoe je voorkomt dat gesprekken doodbloeden. Tot morgen!"
  }'::jsonb,
  '{"titel": "Gesprekken Starten", "stappen": ["Stuur 5+ eerste berichten", "Check lopende gesprekken", "Stuur ''verdiepen'' berichten", "Noteer hoeveel gesprekken actief zijn"]}'::jsonb,
  16
);

-- DAG 17: Gesprek Gaande Houden
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, display_order
) VALUES (
  v_week3_id, v_program_id, 17, 'Gesprek Gaande Houden', '🔄', 'VIDEO', 6,
  NULL, NULL,
  '{
    "hook": "Je hebt een gesprek. Het gaat goed. En dan... stilte.",
    "intro": "Hoi, ik ben Iris. Vandaag: hoe je voorkomt dat gesprekken doodbloeden.",
    "secties": [
      {"titel": "Waarom gesprekken stoppen", "content": "Te veel interview-vragen. Te weinig over jezelf delen. Te saai. Of: de ander is niet geïnteresseerd."},
      {"titel": "De energie checklist", "content": "Stel je vragen en deel je ook? Zijn onderwerpen interessant? Reageer je op tijd?"},
      {"titel": "Conversatie Redders", "content": "Verander onderwerp. Stel diepere vraag. Deel een mini-verhaal. Stuur iets grappigs."},
      {"titel": "Wanneer stoppen", "content": "Als iemand steeds kort antwoordt. Als je altijd moet beginnen. Dan is het oké om te stoppen."}
    ],
    "opdracht": "Review je gesprekken. Pas een ''redder'' toe waar nodig. Stop eenzijdige gesprekken.",
    "outro": "Morgen: vragen die échte connectie creëren. Tot morgen!"
  }'::jsonb,
  '{"vraag": "Heb je gesprekken die doodbloeden? Wat denk je dat de oorzaak is?", "doel": "Zelfanalyse gesprekskwaliteit"}'::jsonb,
  '{"titel": "Gesprekken Analyseren", "stappen": ["Bekijk actieve gesprekken", "Markeer: goed / stagnerend / dood", "Pas een ''redder'' toe waar nodig", "Stop eenzijdige gesprekken"]}'::jsonb,
  17
);

-- DAG 18: Vragen die Connectie Creëren
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, werkboek, display_order
) VALUES (
  v_week3_id, v_program_id, 18, 'Vragen die Connectie Creëren', '💫', 'VIDEO', 7,
  NULL, NULL,
  '{
    "hook": "''Wat voor werk doe je?'' Saai. Voorspelbaar. Vergeetbaar.",
    "intro": "Hoi, ik ben Iris. Er is een verschil tussen informatie uitwisselen en echt verbinden.",
    "secties": [
      {"titel": "Het probleem", "content": "Standaardvragen geven standaardantwoorden. Je leert niets échts."},
      {"titel": "Vragen die werken", "content": "In plaats van ''wat doe je?'': ''Wat zou je doen als geld geen rol speelde?'' In plaats van ''waar kom je vandaan?'': ''Waar voel je je het meest thuis?''"},
      {"titel": "De 36 vragen methode", "content": "Psycholoog Arthur Aron ontdekte dat specifieke vragen intimiteit creëren door kwetsbaarheid uit te lokken."},
      {"titel": "Timing", "content": "Begin licht. Bouw op. Diepere vragen komen na een paar dagen."}
    ],
    "opdracht": "Kies je beste gesprek. Stel één vraag die dieper gaat: ''Wat is het beste advies dat je ooit hebt gekregen?''",
    "outro": "Morgen: van chat naar date vragen. Tot morgen!"
  }'::jsonb,
  '{"titel": "Diepere Vragen Stellen", "stappen": ["Kies je beste 1-2 gesprekken", "Stel een diepere vraag", "Observeer de reactie", "Deel ook je eigen antwoord"]}'::jsonb,
  18
);

-- DAG 19: Van Chat naar Date
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, werkboek, display_order
) VALUES (
  v_week3_id, v_program_id, 19, 'Van Chat naar Date', '☕', 'VIDEO', 8,
  NULL, NULL,
  '{
    "hook": "Je hebt een goed gesprek. Het klikt. Maar jullie zijn nog steeds aan het typen.",
    "intro": "Hoi, ik ben Iris. Dit is misschien de belangrijkste les van deze week.",
    "secties": [
      {"titel": "Wanneer vragen", "content": "Niet na 2 berichten (te snel). Niet na 2 weken (penpal). Sweet spot: als het gesprek goed loopt, na 5-15 berichten over een paar dagen."},
      {"titel": "Hoe vragen", "content": "Direct maar casual: ''Hey, ik vind het leuk om met je te chatten. Zin om een keer koffie te drinken?''"},
      {"titel": "Het voorstel", "content": "Wees specifiek: ''Heb je zin om zaterdag koffie te drinken bij [plek]?'' Concreet voorstel = makkelijker ja zeggen."},
      {"titel": "Als ze nee zeggen", "content": "Met alternatief = goed teken. Zonder alternatief = niet geïnteresseerd. Ga verder."}
    ],
    "opdracht": "Heb je een gesprek dat goed loopt? Stel voor om af te spreken. Specifiek voorstel, concrete dag en plek.",
    "outro": "Morgen: red flags en green flags. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Wat is de beste manier om een date voor te stellen?", "opties": [{"tekst": "''Zou je misschien eventueel een keer...''", "correct": false}, {"tekst": "Een specifiek voorstel met dag en plek", "correct": true}, {"tekst": "Wachten tot zij vragen", "correct": false}], "feedback_correct": "Correct! Specifiek voorstel = makkelijker om ja te zeggen.", "feedback_incorrect": "Een specifiek voorstel (dag + plek) maakt ja zeggen makkelijk."}
    ]
  }'::jsonb,
  '{"titel": "Date Vragen", "stappen": ["Identificeer beste gesprekken", "Check: loopt het? Is er interesse?", "Formuleer specifiek date-voorstel", "Stuur het", "Noteer de reactie"]}'::jsonb,
  19
);

-- DAG 20: Red Flags & Green Flags
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, quiz, reflectie, werkboek, display_order
) VALUES (
  v_week3_id, v_program_id, 20, 'Red Flags & Green Flags', '🚩', 'VIDEO', 7,
  NULL, NULL,
  '{
    "hook": "Niet iedereen die je matcht is de moeite waard.",
    "intro": "Hoi, ik ben Iris. De laatste inhoudelijke les: hoe bescherm je jezelf?",
    "secties": [
      {"titel": "Red Flags in profielen", "content": "Alleen vage foto''s. Negativiteit in bio. Geen moeite gedaan. Direct om nummer vragen."},
      {"titel": "Red Flags in gesprekken", "content": "Alleen over zichzelf. Seksueel te vroeg. Pushy. Inconsistent. Love bombing. Geld vragen."},
      {"titel": "Green Flags", "content": "Ze stellen vragen. Ze onthouden wat je vertelde. Ze respecteren je tempo. Ze zijn consistent. Ze zijn open over intenties."},
      {"titel": "Vertrouw je onderbuik", "content": "Als iets niet goed voelt, is er meestal een reden."}
    ],
    "opdracht": "Analyseer je matches en gesprekken. Zijn er red flags? Green flags? Wees eerlijk.",
    "outro": "Morgen: de grote finale. Tot morgen!"
  }'::jsonb,
  '{
    "vragen": [
      {"vraag": "Welke van deze is een green flag?", "opties": [{"tekst": "Alleen over zichzelf praten", "correct": false}, {"tekst": "Love bombing", "correct": false}, {"tekst": "Consistent zijn en je tempo respecteren", "correct": true}], "feedback_correct": "Precies! Consistentie en respect zijn gezonde tekenen.", "feedback_incorrect": "Green flags: consistentie, respect voor je tempo, oprechte interesse."}
    ]
  }'::jsonb,
  '{"vraag": "Zijn er red flags die je in het verleden hebt genegeerd?", "doel": "Leren van het verleden"}'::jsonb,
  '{"titel": "Flags Analyse", "stappen": ["Bekijk actieve gesprekken", "Noteer red flags (indien aanwezig)", "Noteer green flags", "Focus op gesprekken met green flags"]}'::jsonb,
  20
);

-- DAG 21: Finish & Jouw Volgende Stap
INSERT INTO program_days (
  week_id, program_id, dag_nummer, titel, emoji, dag_type, duur_minuten,
  ai_tool, ai_tool_slug, video_script, reflectie, werkboek, upsell, display_order
) VALUES (
  v_week3_id, v_program_id, 21, 'Finish & Jouw Volgende Stap', '🎉', 'LIVE', 45,
  NULL, NULL,
  '{
    "hook": "Je hebt het gedaan. 21 dagen. Van onzichtbaar naar een profiel dat werkt.",
    "intro": "Hoi, ik ben Iris. Welkom bij de finale! Je bent niet meer dezelfde dater als 21 dagen geleden.",
    "secties": [
      {"titel": "Wat je hebt bereikt", "content": "Week 1: foto''s. Week 2: bio. Week 3: gesprekken. Je basis staat."},
      {"titel": "De cijfers", "content": "Kijk naar je startmeting. Hoeveel matches? Gesprekken? Dates?"},
      {"titel": "Dit is het begin", "content": "Je hebt de basis. Maar de echte uitdaging komt nu: van chat naar date, van date naar connectie, van connectie naar relatie."},
      {"titel": "De Transformatie", "content": "De complete reis: 90 dagen. Alle AI tools. Wekelijkse Q&A''s. Als Kickstart deelnemer: €297 - €47 = €250."}
    ],
    "opdracht": "Deel je resultaten. Matches voor vs. na. Gesprekken. Dates. En als je klaar bent: De Transformatie wacht.",
    "outro": "Bedankt voor deze 21 dagen. Ik ben trots op je. Daten is een vaardigheid, geen loterij. Succes!"
  }'::jsonb,
  '{"vraag": "Wat is je grootste overwinning van de afgelopen 21 dagen? En wat is je volgende doel?", "doel": "Afsluiting en toekomstvisie"}'::jsonb,
  '{"titel": "Eindmeting & Reflectie", "stappen": ["Vergelijk met startmeting:", "- Matches: voor ___ → na ___", "- Gesprekken: voor ___ → na ___", "- Dates gepland: ___", "Schrijf je grootste inzicht op", "Bepaal je volgende doel"]}'::jsonb,
  '{"programma": "transformatie", "korting_cents": 4700, "boodschap": "Als Kickstart deelnemer krijg je €47 korting op De Transformatie. Prijs: €250 (normaal €297)."}'::jsonb,
  21
);

RAISE NOTICE '✅ Alle 21 dagen succesvol geseeded!';
RAISE NOTICE '📊 Week 1: 7 dagen (Fundament & Foto''s)';
RAISE NOTICE '📊 Week 2: 7 dagen (Bio & Platform)';
RAISE NOTICE '📊 Week 3: 7 dagen (Gesprekken & Connectie)';

END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check weeks
SELECT
  pw.week_nummer,
  pw.titel,
  pw.thema,
  COUNT(pd.id) as dagen_count
FROM program_weeks pw
LEFT JOIN program_days pd ON pw.id = pd.week_id
WHERE pw.program_id = (SELECT id FROM programs WHERE slug = 'kickstart')
GROUP BY pw.id, pw.week_nummer, pw.titel, pw.thema
ORDER BY pw.week_nummer;

-- Check all days
SELECT
  pd.dag_nummer,
  pd.titel,
  pd.dag_type,
  pd.duur_minuten,
  pd.ai_tool,
  CASE WHEN pd.quiz IS NOT NULL THEN '✓' ELSE '-' END as has_quiz,
  CASE WHEN pd.reflectie IS NOT NULL THEN '✓' ELSE '-' END as has_reflectie,
  CASE WHEN pd.werkboek IS NOT NULL THEN '✓' ELSE '-' END as has_werkboek
FROM program_days pd
WHERE pd.program_id = (SELECT id FROM programs WHERE slug = 'kickstart')
ORDER BY pd.dag_nummer;

-- Success message
SELECT '✅ Kickstart 21-dagen content volledig geseeded!' as status;
