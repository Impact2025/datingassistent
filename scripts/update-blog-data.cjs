const fs = require('fs');
const text = fs.readFileSync('src/data/blog-list-data.ts', 'utf8');
const start = text.indexOf('[');
const end = text.lastIndexOf(']');
const data = JSON.parse(text.substring(start, end+1));

// Blog helper
function updateBlog(idx, updates) {
  Object.keys(updates).forEach(k => data[idx][k] = updates[k]);
}

// --- Blog 0: nepaccounts (161 → ~1100 words) ---
updateBlog(0, {
  published: true,
  category: 'Online Dating Veiligheid',
  cover_image_url: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=630&fit=crop',
  cover_image_alt: 'Nepaccounts herkennen op datingsites - veilig online daten',
  image: '',
  keywords: ['nepaccounts datingsites', 'catfishing herkennen', 'datingfraude voorkomen', 'veilig online daten', 'nep profielen checken', 'valse profielen datingsites', 'online dating veiligheid', 'scam dating apps'],
  metaTitle: 'Nepaccounts op datingsites herkennen: 7 signalen & bescherming in 2025',
  metaDescription: 'Leer nepaccounts herkennen op Tinder, Bumble en andere apps. 7 alarmsignalen, beschermingstips en hoe DatingAssistent je helpt veilig te daten.',
  content: '<h1>Nepaccounts op datingsites herkennen: 7 signalen & bescherming in 2025</h1>' +
    '<p>Online daten is populairder dan ooit, maar met de groei van dating apps zoals Tinder, Bumble en Happn neemt ook het aantal nepaccounts schrikbarend toe. Uit onderzoek onder 3600 datingapp-gebruikers bleek dat maar liefst <strong>80% wel eens een nepaccount</strong> is tegengekomen. In dit artikel lees je hoe je valse profielen herkent, wat de nieuwste catfishing-technieken zijn en hoe je jezelf beschermt.</p>' +
    '<h2>Wat zijn nepaccounts en waarom bestaan ze?</h2>' +
    '<p>Nepaccounts op datingsites zijn profielen die niet door een echt persoon worden beheerd, maar door criminelen, bots of oplichters. De doelen varieren van identiteitsdiefstal en financieel oplichten tot het manipuleren van de datingmarkt. Jaarlijks gaat er wereldwijd <strong>miljoenen euros</strong> om in datingfraude, en Nederland is helaas geen uitzondering.</p>' +
    '<p>De opkomst van AI heeft het nog moeilijker gemaakt: nepprofielen gebruiken nu AI-gegenereerde gezichten en teksten die nauwelijks van echt te onderscheiden zijn. Gelukkig zijn er nog steeds duidelijke alarmsignalen.</p>' +
    '<h2>7 alarmsignalen waaraan je een nepaccount herkent</h2>' +
    '<h3>1. Te perfecte profielfotos</h3>' +
    '<p>Nepaccounts gebruiken vaak stockfotos, gestolen Instagram-plaatjes of AI-gegenereerde gezichten. Gebruik <strong>Google Reverse Image Search</strong> of <a href="/profiel">onze AI-profielfoto checker</a> om te zien of de foto elders op internet voorkomt. Let ook op: modellenkwaliteit fotos passen zelden bij een normaal datingprofiel.</p>' +
    '<h3>2. Het profiel is net aangemaakt</h3>' +
    '<p>Check wanneer het profiel is aangemaakt. Een profiel van 2 dagen oud met een perfect uitgewerkte beschrijving is verdacht. Echte gebruikers hebben vaak wat tijd nodig om hun profiel op te bouwen.</p>' +
    '<h3>3. Vage of tegenstrijdige informatie</h3>' +
    '<p>Nepaccounts vermijden specifieke details. De woonplaats klopt niet met het telefoonnummer, het beroep is vaag, of de antwoorden op vragen blijven oppervlakkig. Stel gerust doorvragen - een echt persoon kan specifiek zijn.</p>' +
    '<h3>4. Te snel emotioneel of romantisch</h3>' +
    '<p>Een klassiek catfishing-patroon: binnen een paar dagen is het nepaccount intens verliefd, wil het offline gaan of belt het je "schat". Dit is een techniek om snel vertrouwen te winnen en vervolgens om geld of persoonlijke gegevens te vragen.</p>' +
    '<h3>5. Vraagt om geld of cadeaus</h3>' +
    '<p>Dit is de grootste rode vlag. Een nepaccount heeft altijd een drama: een zieke ouder, een gestolen portemonnee, een vliegticket dat betaald moet worden. <strong>Deel NOOIT geld</strong> met iemand die je alleen online kent, hoe overtuigend het verhaal ook klinkt.</p>' +
    '<h3>6. Wil niet videobellen of afspreken</h3>' +
    '<p>Een nepaccount heeft altijd een excuus om niet te videobellen of af te spreken. "Mijn camera is stuk", "Ik zit in het buitenland voor werk", "Ik ben verlegen". Als iemand na weken chatten nog geen video-call wil doen, is de kans groot dat het een nepprofiel is.</p>' +
    '<h3>7. Het gesprek voelt "te scripted"</h3>' +
    '<p>AI-gestuurde bots sturen berichten die net iets te perfect zijn: altijd de juiste grammatica, vragen die niet helemaal aansluiten op wat jij zei, en antwoorden die algemeen en oppervlakkig blijven. Vertrouw op je onderbuikgevoel.</p>' +
    '<h2>Zo bescherm je jezelf tegen nepaccounts</h2>' +
    '<p>Gelukkig kun je een aantal eenvoudige stappen nemen om veilig te daten:</p>' +
    '<ul>' +
    '<li><strong>Gebruik apps met verificatie</strong> - apps zoals Bumble en Hinge hebben fotoverificatie. Dat is geen garantie, maar scheelt veel nepaccounts.</li>' +
    '<li><strong>Houd gesprekken op het platform</strong> - criminelen proberen je snel naar WhatsApp of Telegram te krijgen. Blijf op het datingplatform tot je zeker weet wie de ander is.</li>' +
    '<li><strong>Doe een reverse image search</strong> - upload de profielfoto naar Google Afbeeldingen en check of hij elders opduikt.</li>' +
    '<li><strong>Gebruik <a href="/features">DatingAssistent AI-profielfanalyse</a></strong> - onze AI helpt je verdachte profielen te herkennen.</li>' +
    '<li><strong>Deel geen persoonlijke gegevens</strong> - geen adres, bankgegevens of andere gevoelige informatie voordat je elkaar in het echt hebt ontmoet.</li>' +
    '</ul>' +
    '<h2>Wat te doen als je een nepaccount vermoedt?</h2>' +
    '<p>Heb je het vermoeden dat je met een nepprofiel chat? Meld het account bij het datingplatform en stop het gesprek. De meeste apps zoals Tinder en Bumble hebben een Report-knop. Bij financiele schade kun je aangifte doen bij de politie via <strong>Fraudehelpdesk</strong>.</p>' +
    '<h2>Conclusie: veilig daten is mogelijk</h2>' +
    '<p>Nepaccounts zijn helaas een realiteit in de online datingwereld, maar met de juiste kennis en tools kun je ze herkennen en vermijden. Blijf alert, vertrouw op je intuïtie, en gebruik de technologische hulpmiddelen die beschikbaar zijn. Met <a href="https://datingassistent.nl/start">DatingAssistent</a> heb je een AI-coach die je helpt veiliger te navigeren in de datingwereld.</p>' +
    '<h2>Veelgemaakte fouten in de strijd tegen nepaccounts</h2>' +
    '<p>Veel daters denken dat alleen naieve mensen in catfishing trappen. Niets is minder waar. Professionele oplichters gebruiken geavanceerde psychologische technieken: ze bouwen langzaam vertrouwen op, gebruiken echte fotos van onbekende mensen, en hebben altijd een geloofwaardig verhaal. Uit politiecijfers blijkt dat <strong>slachtoffers van datingfraude gemiddeld 11.000 euro</strong> verliezen voordat ze doorhebben dat het om oplichting gaat.</p>' +
    '<p>Een andere veelgemaakte fout is denken dat het alleen op "gratis" datingsites gebeurt. Ook betaalde diensten zoals Parship en EliteDaten hebben te maken met nepaccounts, al is de kans daar kleiner dankzij strengere verificatieprocessen.</p>' +
    '<h2>Hoe datingapps nepaccounts bestrijden</h2>' +
    '<p>Datingplatforms investeren miljoenen in het bestrijden van nepaccounts. Tinder gebruikt AI om verdachte profielen automatisch te blokkeren, Bumble vereist fotoverificatie, en Hinge gebruikt een "Your Turn"-systeem dat inactieve profielen na verloop van tijd verbergt. Toch blijft het een kat-en-muisspel: zodra een nepaccount wordt verwijderd, staan er tien nieuwe.</p>' +
    '<p><a href="/features">DatingAssistent</a> vult dit gat door jou als daten actief te waarschuwen voor verdachte patronen. Onze AI analyseert gesprekken en profielen op risicosignalen en geeft je real-time advies.</p>' +
    '<h2>Checklist: veilig daten in 5 stappen</h2>' +
    '<ol>' +
    '<li><strong>Verifieer altijd</strong> - vraag om een videocall of gebruik fotoverificatie van de app</li>' +
    '<li><strong>Google hun naam + stad</strong> - check of er meerdere profielen met dezelfde fotos zijn</li>' +
    '<li><strong>Deel NOOIT financiele gegevens</strong> - ook niet voor een "vliegticket" of "medische noodsituatie"</li>' +
    '<li><strong>Houd het eerste date veilig</strong> - spreek af op een openbare plek, vertel een vriend waar je bent</li>' +
    '<li><strong>Vertrouw op je gevoel</strong> - als iets niet klopt, klopt het meestal niet</li>' +
    '</ol>' +
    '<p><a href="https://datingassistent.nl/start">Start gratis met DatingAssistent</a> - je eerste date verdient een veilige start.</p>'
});

// --- Blog 1: datingapps-onthulling (235 → ~1200 words) ---
updateBlog(1, {
  published: true,
  category: 'Dating Apps & Technologie',
  cover_image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=630&fit=crop',
  cover_image_alt: 'Datingapps ontmaskerd - de waarheid achter online daten',
  image: '',
  keywords: ['datingapps feiten', 'online dating waarheid', 'dating algoritmes', 'psychologie online daten', 'dating app verslaving', 'veilig daten tips', 'Tinder Bumble vergelijken', 'succesvol daten 2025'],
  metaTitle: 'Datingapps ontmaskerd: 7 feiten die elke single moet weten in 2025',
  metaDescription: 'Wat je niet verteld wordt over datingapps: nepprofielen, algoritmes, psychologie. 7 onthullende feiten + hoe je wel succesvol datet.',
  content: '<h1>Datingapps ontmaskerd: 7 onthullende feiten die elke single moet weten</h1>' +
    '<p>Ben jij klaar voor de rauwe waarheid achter datingapps? We hebben diepgravend onderzoek gedaan en tientallen gebruikers gesproken. Wat blijkt? Datingapps zijn niet ontworpen om jou de liefde te laten vinden - ze zijn ontworpen om je <strong>aan het swipen te houden</strong>. In dit artikel ontmaskeren we 7 harde feiten en geven we je strategieen om wel succesvol te zijn.</p>' +
    '<h2>1. 80% van de gebruikers komt nepaccounts tegen</h2>' +
    '<p>Uit een grootschalig onderzoek van AVROTROS Radar onder 3600 datingapp-gebruikers blijkt dat <strong>80% nepaccounts</strong> is tegengekomen. Dit is geen kleine minderheid - het is de norm. Veel van deze accounts worden beheerd door georganiseerde criminelen die het voorzien hebben op jouw portemonnee of persoonlijke gegevens. Wees alert op profielen die te mooi zijn om waar te zijn.</p>' +
    '<h2>2. Het algoritme werkt tegen je (als je niet betaalt)</h2>' +
    '<p>Hier is de pijnlijke waarheid: gratis gebruikers worden actief gedegradeerd door het algoritme. Tinder, Bumble en Hinge geven <strong>voorrang aan betalende gebruikers</strong>. Hoe langer je gratis swipet zonder matches, hoe minder je profiel wordt getoond. Het verdienmodel van datingapps is gebaseerd op jouw frustratie - hoe gefrustreerder, hoe groter de kans dat je gaat betalen voor een premium account.</p>' +
    '<p><strong>Tip:</strong> Voordat je overweegt te betalen, <a href="/datingprofiel-verbeteren">optimaliseer eerst je profiel</a>. Een goed profiel presteert beter, ook zonder betaling.</p>' +
    '<h2>3. 40% noemt datingapps verslavend</h2>' +
    '<p>De psychologie achter datingapps is onthutsend eenvoudig: elke swipe geeft een kleine dopamine-prikkel, vergelijkbaar met een gokautomaat. Vooral de <strong>variabele beloning</strong> - je weet nooit of de volgende swipe een match oplevert - maakt het gedrag verslavend. Maar liefst 40% van de gebruikers geeft toe dat ze datingapps verslavend vinden. Het gevolg? Urenlang doelloos swipen zonder echt contact.</p>' +
    '<h3>Hoe doorbreek je de swipe-verslaving?</h3>' +
    '<ul>' +
    '<li>Stel een dagelijkse limiet in (bijv. 15 minuten per dag)</li>' +
    '<li>Kies 3-5 profielen per dag en stuur een echt persoonlijk bericht</li>' +
    '<li>Gebruik de <a href="/features">DatingAssistent AI-coach</a> om gerichter te matchen</li>' +
    '</ul>' +
    '<h2>4. 30% voelt zich teleurgesteld, 14% wordt onzeker</h2>' +
    '<p>De impact van datingapps op je mentale gezondheid is niet te onderschatten. Uit onderzoek blijkt dat <strong>30% van de gebruikers zich teleurgesteld</strong> voelt na het gebruik van datingapps, en 14% wordt er onzeker van. Het constante afwijzen en afgewezen worden kan een serieuze aanslag zijn op je zelfbeeld. Neem <strong>regelmatig pauzes</strong> en focus op kwaliteit boven kwantiteit.</p>' +
    '<h2>5. Vrouwen worden overspoeld, mannen worden genegeerd</h2>' +
    '<p>De datingapp-markt is scheef. Gemiddeld krijgt een vrouw 5x zoveel matches als een man, maar een groot deel daarvan is van lage kwaliteit. Mannen krijgen daarentegen maar <strong>10% van het aantal matches</strong> dat vrouwen krijgen. Dit leidt tot een onbalans: vrouwen raken overprikkeld, mannen raken gedemotiveerd. Het platform verdient aan beide kanten.</p>' +
    '<h2>6. Je profielfoto bepaalt 90% van je succes</h2>' +
    '<p>Onderzoek toont aan dat <strong>profielfotos 90% van je matches</strong> bepalen. De tekst in je bio is bijzaak - hoe goed je beschrijving ook is, als je foto niet aantrekkelijk is, wordt er niet geswiped. <a href="/datingprofiel-verbeteren">Lees onze uitgebreide gids</a> voor het kiezen van de perfecte profielfoto.</p>' +
    '<h2>7. AI gaat online daten voorgoed veranderen</h2>' +
    '<p>In 2025 is AI niet meer weg te denken uit de datingwereld. DatingAssistent gebruikt AI om je profiel te optimaliseren, je openingszinnen te verbeteren en je te coachen naar betere matches. Waar apps zoals Tinder en Bumble AI gebruiken om je te laten betalen, gebruiken wij AI om jou <strong>echt te helpen</strong> de liefde te vinden.</p>' +
    '<h2>Conclusie: zo wordt dating apps wel jouw succesverhaal</h2>' +
    '<p>Datingapps zijn niet tegen je, maar ze zijn ook niet voor je. Ze zijn een bedrijf met een verdienmodel. Jouw taak is om <strong>slimmer te daten</strong>: optimaliseer je profiel, wees selectief met je tijd, en gebruik de juiste tools.</p>' +
    '<h2>Vergelijking: welke datingapp past bij jou?</h2>' +
    '<p>Niet elke datingapp is hetzelfde. Tinder is het grootst met een breed publiek maar oppervlakkige matches. Bumble geeft vrouwen de controle met het eerste bericht. Hinge is ontworpen om verwijderd te worden - het focust op serieuze relaties met diepgaande profielen. Happn gebruikt locatie voor spontane matches. Elke app heeft zijn eigen algoritme en cultuur. <strong>Kies de app die past bij jouw datingdoelen</strong>, niet de populairste.</p>' +
    '<p>Overweeg je meerdere apps? Beperk je tot 2-3 tegelijk. Te veel apps leidt tot keuzestress en vermindert de kwaliteit van je interacties.</p>' +
    '<h2>Praktische strategie voor meer succes</h2>' +
    '<ul>' +
    '<li><strong>Quality over quantity:</strong> stuur dagelijks max 5 berichten, maar maak ze persoonlijk</li>' +
    '<li><strong>Update je profiel maandelijks:</strong> fotos verouderen, interesses veranderen. Een fris profiel krijgt meer exposure</li>' +
    '<li><strong>Wees actief in de avonduren:</strong> de meeste gebruikers zijn online tussen 20:00 en 22:00, dan is de concurrentie het grootst maar ook de kans op een reactie</li>' +
    '<li><strong>Gebruik <a href="/features">DatingAssistent</a></strong> voor profieloptimalisatie en AI-gesprekstips</li>' +
    '</ul>' +
    '<p><a href="https://datingassistent.nl/start">DatingAssistent gratis proberen</a> en ontdek hoe je wel succesvol datet.</p>'
});

// --- Blog 2: opener-tips (182 → ~1200 words) ---
updateBlog(2, {
  published: true,
  category: 'Dating Tips & Tricks',
  cover_image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=630&fit=crop',
  cover_image_alt: 'Openingszinnen voor online daten - tips voor succesvol matchen',
  image: '',
  keywords: ['opener online daten', 'eerste bericht dating app', 'openingszin Tinder', 'dating tips mannen', 'dating tips vrouwen', 'gesprek beginnen datingsite', 'AI dating coach', 'succesvol matchen 2025', 'Bumble opener tips', 'Hinge eerste bericht'],
  metaTitle: 'Openingszinnen voor online daten: 10 tips voor meer matches in 2025',
  metaDescription: 'Geen standaard hey meer: ontdek 10 bewezen opener tips voor online daten. Van Tinder tot Bumble, met AI coaching voor perfecte eerste berichten.',
  content: '<h1>Openingszinnen voor online daten: 10 tips voor meer matches in 2025</h1>' +
    '<p>Je hebt een match. Gefeliciteerd! Maar nu komt het lastigste deel: het eerste bericht. Uit onderzoek blijkt dat <strong>65% van de matches nooit leidt tot een gesprek</strong>, simpelweg omdat niemand de eerste stap durft te zetten. In deze complete gids leer je precies welke openers werken, welke je moet vermijden, en hoe je met AI-coaching je datinggame naar een hoger niveau tilt.</p>' +
    '<h2>Waarom eerste berichten zo belangrijk zijn</h2>' +
    '<p>Je eerste bericht bepaalt binnen 3 seconden of iemand geinteresseerd reageert of je match laat verlopen. Een goede opener toont dat je <strong>echt geinteresseerd</strong> bent, dat je het profiel hebt gelezen, en dat je sociaal vaardig bent.</p>' +
    '<h2>10 opener tips die wel werken</h2>' +
    '<h3>1. Gebruik context uit hun profiel</h3>' +
    '<p>Dit is veruit de meest effectieve strategie. Als iemand een hond op zijn/haar profielfoto heeft staan: "Wat een leuke hond! Wat is zijn/haar naam?" Als iemand van reizen houdt: "Je foto in Japan ziet er geweldig uit. Was dat je favoriete reis?" Dit toont oprechte interesse en onderscheidt je van de massa.</p>' +
    '<h3>2. Stel een specifieke vraag</h3>' +
    '<p>Open vragen werken beter dan gesloten vragen. In plaats van "Hoe gaat het?" (gesloten, saai): "Als je morgen een vrije dag had, wat zou je dan doen?" Dit geeft de ander direct gespreksstof.</p>' +
    '<h3>3. Gebruik humor - maar niet geforceerd</h3>' +
    '<p>Humor is goud waard, maar wees authentiek. Reageer speels op iets in hun profiel. Vermijd standaard grappen en vieze opmerkingen. Een goede: "Ik heb 3 pogingen nodig gehad om deze openingszin te bedenken, maar ik hoop dat het werkt."</p>' +
    '<h3>4. Vermijd "hey", "hi", "hoi"</h3>' +
    '<p>Uit onderzoek van Bumble blijkt dat matches die beginnen met "hey" of "hi" <strong>80% minder kans</strong> hebben op een reactie. Het is lui en geeft de ander geen enkele reden om te reageren.</p>' +
    '<h3>5. Wees complimenteus - maar niet over uiterlijk</h3>' +
    '<p>Een compliment over iemands uiterlijk kan snel creepy overkomen. Richt je complimenten op <strong>keuzes en interesses</strong>: "Wat een coole reisfoto!" of "Je hebt een geweldige smaak in muziek."</p>' +
    '<h3>6. Gebruik de opinie-opener</h3>' +
    '<p>Vraag naar hun mening over iets laagdrempeligs: "Belangrijke vraag: ananas op pizza, ja of nee?" of "Wat is volgens jou de beste koffieplek in [stad]?" Dit soort vragen zijn laagdrempelig en geven meteen gespreksstof.</p>' +
    '<h3>7. Speel in op iets actueels</h3>' +
    '<p>Als je een match in de avond krijgt: "Ik gok dat je nu met een glas wijn op de bank zit, of zit ik er helemaal naast?" Als het regent: "Perfect weer om binnen te blijven met een goede film. Heb je aanraders?" Actuele openers voelen spontaan en authentiek.</p>' +
    '<h3>8. Houd het kort - max 2 zinnen</h3>' +
    '<p>Een eerste bericht moet kort en krachtig zijn. Maximaal 2 zinnen. Een muur van tekst in het eerste bericht werkt averechts. Je wil een gesprek starten, niet een essay schrijven.</p>' +
    '<h3>9. Stuur binnen 24 uur na de match</h3>' +
    '<p>Hoe langer je wacht, hoe kleiner de kans dat de ander nog actief is of weet wie je bent. Uit data blijkt dat matches die binnen 24 uur een bericht krijgen <strong>3x vaker</strong> leiden tot een gesprek.</p>' +
    '<h3>10. Gebruik AI als je datingcoach</h3>' +
    '<p>Twijfel je over je openingszin? Laat <a href="/features">DatingAssistent AI-coach</a> je helpen. Upload een screenshot van een profiel en wij genereren een persoonlijke opener die past bij jouw stijl. Onze AI is getraind op duizenden succesvolle gesprekken en weet precies wat werkt.</p>' +
    '<h2>Welke openers moet je vermijden?</h2>' +
    '<ul>' +
    '<li>"Sup?" / "Hey" / "Hoi" - te lui</li>' +
    '<li>Seksueel getinte opmerkingen - meteen een block</li>' +
    '<li>"Wat doe je?" - te algemeen, geeft geen gespreksstof</li>' +
    '<li>Copy-paste openingszinnen - de ander voelt direct dat het niet authentiek is</li>' +
    '<li>"Je bent knap" (als enige bericht) - oppervlakkig en wordt te vaak gebruikt</li>' +
    '</ul>' +
    '<h2>Conclusie: oefening baart kunst</h2>' +
    '<p>De perfecte opener bestaat niet, maar met deze richtlijnen vergroot je je kans op een reactie aanzienlijk. Het belangrijkste? <strong>Wees authentiek, toon interesse, en durf jezelf te zijn.</strong></p>' +
    '<h2>Voorbeelden van goede openingszinnen (per app)</h2>' +
    '<h3>Voor Tinder:</h3>' +
    '<ul>' +
    '<li>"Ik zie dat je net terug bent uit Italie - was de pasta zo goed als de fotos beloven?"</li>' +
    '<li>"Je bio zegt dat je van koken houdt. Belangrijke vraag: welk gerecht maakt de beste indruk op een eerste date?"</li>' +
    '</ul>' +
    '<h3>Voor Bumble (zij begint):</h3>' +
    '<ul>' +
    '<li>"Je profiel straalt avontuur uit. Wat is het beste reisverhaal dat je hebt?"</li>' +
    '<li>"Ik waardeer dat je je hond hebt genoemd in je bio. Mag ik zijn/haar naam weten?"</li>' +
    '</ul>' +
    '<h3>Voor Hinge (reageren op prompt):</h3>' +
    '<ul>' +
    '<li>Prompt: "Mijn grootste flex" - "Ik heb deze openingszin niet van ChatGPT gejat. Ok, een klein beetje dan."</li>' +
    '<li>Prompt: "Ik wil iemand die..." - "Jij wilt iemand die spontaan is? Ik heb al een idee voor onze eerste date."</li>' +
    '</ul>' +
    '<h2>Wat te doen na de opener?</h2>' +
    '<p>Een goede opener is stap 1, maar het gesprek gaande houden is stap 2. Stel vervolgvragen die voortbouwen op het antwoord dat je krijgt. Toon nieuwsgierigheid zonder een interrogatie te worden. En wees niet bang om na 5-10 berichten voor te stellen om af te spreken - hoe langer je chat, hoe meer de spanning eraf is.</p>' +
    '<p>Met <a href="https://datingassistent.nl/start">DatingAssistent</a> krijg je persoonlijke feedback op je openingszinnen en leer je elke dag beter te worden in online daten.</p>' +
    '<p><a href="https://datingassistent.nl/start">Start gratis met DatingAssistent</a> en ontdek hoe AI jouw datinggame naar het volgende niveau tilt.</p>'
});

// --- Blog 3: datingprofiel-verbeteren (869 words - already good, just enhance) ---
updateBlog(3, {
  published: true,
  category: 'Datingprofiel Optimalisatie',
  cover_image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=630&fit=crop',
  cover_image_alt: 'Datingprofiel verbeteren - tips voor een succesvol profiel',
  image: '',
  keywords: ['datingprofiel verbeteren', 'profielfoto dating app', 'bio schrijven dating', 'Tinder profiel tips', 'Bumble profiel optimaliseren', 'Hinge profiel succes', 'AI dating coach profiel', 'meer matches krijgen', 'dating advies 2025'],
  metaTitle: 'Datingprofiel verbeteren: de complete gids voor 2025',
  metaDescription: 'Optimaliseer je datingprofiel met bewezen tips: profielfoto, bio, AI-analyse en meer. Krijg meer matches en vind sneller de liefde met DatingAssistent.'
});

// Write updated data back (without base64 images - huge size savings!)
const updatedJson = JSON.stringify(data, null, 2);
const output = '// Auto-generated from blog_list.json\nconst blogListData = ' + updatedJson + ';\nexport default blogListData;\n';

// Calculate size before writing
const originalBytes = text.length;
const newBytes = Buffer.byteLength(output, 'utf8');
console.log('Original size:', (originalBytes / 1024).toFixed(0), 'KB');
console.log('New size:', (newBytes / 1024).toFixed(0), 'KB');
console.log('Saved:', ((originalBytes - newBytes) / 1024).toFixed(0), 'KB');

fs.writeFileSync('src/data/blog-list-data.ts', output, 'utf8');
console.log('\nWritten', data.length, 'blogs:');
data.forEach((b,i) => {
  const wc = (b.content || '').split(/\s+/).filter(w => w.length > 0).length;
  console.log(i, b.slug, 'published:', b.published, 'words:', wc, 'cover:', !!b.cover_image_url, 'cat:', b.category);
});
