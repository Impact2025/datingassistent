require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

/**
 * 🌹 MODULE 2 – HERKEN DE 5 GROOTSTE RODE VLAGGEN
 *
 * Dit script maakt de volledige modulestructuur aan voor de Red Flags cursus.
 * Course ID: 20 (bestaat al in database)
 */

const COURSE_ID = 20;

// MODULE 1: Les 1 – Veiligheid Eerst
const MODULE_1 = {
  title: 'Les 1 – Veiligheid Eerst',
  description: 'Waarom veiligheid prioriteit #1 is in online dating',
  position: 1,
  lessons: [
    {
      title: '🎬 Video: Waarom Dit Belangrijk Is',
      description: 'Warm, krachtig en inclusief gesprek over veiligheid (3:30 min)',
      lesson_type: 'video',
      position: 1,
      is_preview: true,
      content: `## 🎯 Leerdoel
Na deze video begrijp je waarom veiligheid prioriteit #1 is in online dating.

## 📽️ Video Outline (3:30 min)

**Kernboodschap:**
"Mijn veiligheid > iemand anders gevoelens"

**Key Points:**
- Kwetsbaarheid is menselijk, ongeacht gender of identiteit
- Online kunnen woorden anders voelen - soms klopt iets niet
- Je intuïtie waarschuwt je, maar je brein zegt: geef het nog een kans
- Wanneer je eenzaam bent of onzeker, verlaagt je brein z'n waakzaamheid
- Dat is geen zwakte, dat is biologie
- Veiligheid is geen luxe, het is je basisrecht

**Gouden regel:**
💛 "Mijn veiligheid > iemand anders gevoelens"

---

**📹 VIDEO UPLOAD:**
Upload hier de video van ~3:30 minuten via het admin panel.

**Visuele elementen:**
- Subtiele overlay van de gouden regel als grafisch element
- Sluitshot: "Jouw veiligheid. Jouw keuze."`
    },
    {
      title: '💭 Reflectie-oefening',
      description: 'Beantwoord 3 reflectievragen over jouw ervaring met veiligheid online (20 punten)',
      lesson_type: 'assignment',
      position: 2,
      content: `## 💭 Reflectie-oefening (20 punten)

Neem de tijd om eerlijk de volgende vragen te beantwoorden. Dit is voor jouw eigen bewustwording - er zijn geen foute antwoorden.

### Vraag 1: Wanneer voelde jij je online ooit ongemakkelijk of onveilig?

**Jouw antwoord:**

[Typ hier je antwoord - minimaal 50 woorden]

---

### Vraag 2: Wat deed je intuïtie toen?

**Jouw antwoord:**

[Typ hier je antwoord - minimaal 30 woorden]

---

### Vraag 3: Hoe reageerde je toen?

**Jouw antwoord:**

[Typ hier je antwoord - minimaal 50 woorden]

---

## 💡 Reflectie Tips

- **Wees eerlijk:** Niemand anders ziet je antwoorden
- **Neem de tijd:** Deze vragen helpen je patronen herkennen
- **Geen oordeel:** Wat je deed toen was het beste wat je kon op dat moment
- **Groei:** Door te reflecteren leer je voor de toekomst

**Bewaar je antwoorden** - aan het eind van de module kijk je terug op je groei.`
    },
    {
      title: '📝 Pre-Quiz: Hoe alert ben jij?',
      description: '5 stellingen om je huidige bewustzijn te meten (vóór Les 2)',
      lesson_type: 'quiz',
      position: 3,
      content: `## 📝 Pre-Quiz: Hoe alert ben jij?

**Doel:** Meet je huidige kennis over rode vlaggen. Aan het eind van de module doe je dezelfde quiz opnieuw om je groei te zien!

**Instructies:**
- 5 stellingen: Juist of Onjuist
- Directe feedback na elke vraag
- Je score wordt bewaard voor vergelijking later

---

### Vraag 1 van 5

**Stelling:** Overmatig snel "ik hou van je" zeggen kan een rode vlag zijn.

- [ ] Juist
- [ ] Onjuist

**✅ Correct antwoord:** Juist
**Feedback:** Dit is een vorm van Love Bombing - een manipulatieve tactiek waarbij je overladen wordt met overdreven liefde in korte tijd.

---

### Vraag 2 van 5

**Stelling:** Het is veilig als iemand nooit over zichzelf praat.

- [ ] Juist
- [ ] Onjuist

**✅ Correct antwoord:** Onjuist
**Feedback:** Dit kan juist wijzen op het verbergen van identiteit of vermijding van transparantie - een duidelijke rode vlag.

---

### Vraag 3 van 5

**Stelling:** Je hoeft je gevoel van ongemak niet te verklaren.

- [ ] Juist
- [ ] Onjuist

**✅ Correct antwoord:** Juist
**Feedback:** Je intuïtie is altijd valide, ook zonder rationele verklaring. Vertrouw op je gevoel.

---

### Vraag 4 van 5

**Stelling:** Een profielfoto zonder gezicht is geen probleem.

- [ ] Juist
- [ ] Onjuist

**✅ Correct antwoord:** Onjuist
**Feedback:** Vage foto's of onduidelijke identiteit (V1) zijn een klassieke rode vlag. Transparantie is belangrijk.

---

### Vraag 5 van 5

**Stelling:** Jij mag altijd stoppen met een gesprek.

- [ ] Juist
- [ ] Onjuist

**✅ Correct antwoord:** Juist
**Feedback:** Absoluut! Jouw grenzen zijn heilig. Mijn veiligheid > iemand anders gevoelens.

---

**📊 Je score wordt bewaard!**
Aan het eind van module 2 doe je de post-quiz en zie je hoeveel je geleerd hebt.`
    },
    {
      title: '💬 Forum Discussie: Wat betekent veiligheid voor jou?',
      description: 'Deel je gedachten met de community (optioneel)',
      lesson_type: 'text',
      position: 4,
      content: `## 💬 Forum Discussie

**Vraag:** Wat betekent veiligheid voor jou in dating?

**Richtlijn voor deelnemers:**
⚠️ Reageer enkel met steun of tips, geen oordelen.

---

## 🛡️ Veiligheidsrichtlijnen Forum

Voordat je deelt:

1. **Wees respectvol** - Iedereen heeft een uniek verhaal
2. **Geen namen/herkenbare details** - Bescherm jezelf en anderen
3. **Gebruik triggerwarnings** bij persoonlijke verhalen over trauma
4. **Geef steun, geen oordeel** - We leren samen

---

## 💭 Reflectievragen om te delen:

- Wat is voor jou het belangrijkste aspect van veiligheid?
- Welke grens stel je altijd, ongeacht wat?
- Wat heb je geleerd uit een eerdere ervaring?
- Hoe ga je om met druk van anderen?

---

**📌 Sticky Post:**
💛 "Herinner jezelf: Mijn veiligheid > iemand anders gevoelens."

---

**🔗 Link naar forum:**
[Klik hier om deel te nemen aan de discussie]

*Opmerking: Forumdiscussie is optioneel maar kan waardevol zijn voor je leerproces.*`
    },
    {
      title: '📓 Download: Werkboek Les 1 - Veiligheid Eerst',
      description: 'PDF werkboek met oefeningen en affirmaties',
      lesson_type: 'assignment',
      position: 5,
      content: `## 📓 Werkboek Les 1 – Veiligheid Eerst

**Wat zit erin:**
- Reflectie-oefeningen op papier
- Affirmatie: "Mijn veiligheid > iemand anders gevoelens"
- Rubriek "Mijn kwetsbaarheid en kracht"
- Tips voor het stellen van grenzen
- Ruimte voor persoonlijke notities

---

## 📥 Download Werkboek

**⚠️ ADMIN: Upload hier de PDF via het admin panel**

[Download knop verschijnt hier na upload]

---

## 💡 Hoe gebruik je het werkboek?

1. **Print het uit** of gebruik het digitaal
2. **Neem de tijd** - dit is geen race
3. **Wees eerlijk** met jezelf
4. **Bewaar het** - kijk er later op terug

---

## ❤️ Inclusieve taal

Dit werkboek gebruikt inclusieve taal:
- "De ander" i.p.v. "hij/zij"
- Voor iedereen toegankelijk, ongeacht gender of identiteit

---

**Tipblokje in werkboek:**
"Iedereen kan dit meemaken — ook jij bent het waard om veilig te zijn."`
    }
  ]
};

// MODULE 2: Les 2 – De 5 Rode Vlaggen
const MODULE_2 = {
  title: 'Les 2 – De 5 Rode Vlaggen (De 5 V\'s)',
  description: 'Leer de 5 belangrijkste waarschuwingssignalen herkennen',
  position: 2,
  lessons: [
    {
      title: '🎬 Video: De 5 V\'s',
      description: 'Korte, krachtige uitleg van de 5 rode vlaggen met voorbeelden (4:30 min)',
      lesson_type: 'video',
      position: 1,
      is_preview: false,
      content: `## 🌈 DE 5 V'S - MNEMONIC

Een visuele en mentale geheugensteun om rode vlaggen te herkennen:

| Letter | Rode Vlag | Icoon | Betekenis |
|--------|-----------|-------|-----------|
| **V1** | Vage foto's of info | 🔍 | Onduidelijke identiteit of vermijding van transparantie |
| **V2** | Vlotte maar oppervlakkige praat | 💬 | Charmant, maar zonder diepgang |
| **V3** | Verhalen vol drama of negativiteit | ⛈️ | Slachtofferrol, klaagtoon of manipulatie |
| **V4** | Verdoezelde antwoorden | ❓ | Ontwijkend of niet concreet over leven, werk of verleden |
| **V5** | Verliefdheidsbombardement | ❤️‍🔥 | Te snel, te intens, te perfect (Love Bombing) |

**Bonus: V6 – Verleggen van grenzen** 🚨
Subtiel pushen, schuldgevoel aanpraten, of jouw 'nee' negeren.

---

## 🎬 Video Outline (4:30 min)

**Tone of voice:** Warm, krachtig, inclusief

**Visueel concept:**
- Elke "V" verschijnt als icoon
- Kort, ritmisch tempo
- Chat-screen voorbeelden

---

### Opening

"Of de ander nu man, vrouw of non-binair is — rode vlaggen zien er altijd hetzelfde uit: vaag, te mooi, of te snel."

---

### De 5 V's in detail

**V1 - Vage foto's of info** 🔍
- Geen duidelijke profielfoto
- Ontwijkende antwoorden over basisinformatie
- Vermijden van video calls
- *Voorbeeld:* "Mijn camera is stuk" (elke keer opnieuw)

**V2 - Vlotte maar oppervlakkige praat** 💬
- Charmant en complimenteus
- Maar geen echte vragen over jou
- Gesprek blijft aan de oppervlakte
- *Voorbeeld:* Veel complimenten, geen interesse in je dromen

**V3 - Verhalen vol drama** ⛈️
- Constant slachtoffer van omstandigheden
- Negativiteit over ex-partners (allemaal "gek")
- Zoekt medelijden in plaats van verbinding
- *Voorbeeld:* "Niemand begrijpt me zoals jij"

**V4 - Verdoezelde antwoorden** ❓
- Ontwijkend over werk, woonplaats, leven
- Verhalen kloppen niet
- Details veranderen per gesprek
- *Voorbeeld:* Inconsistente antwoorden over kinderen/relatiestatus

**V5 - Verliefdheidsbombardement** ❤️‍🔥
- "Ik hou van je" na 1 dag
- Overdreven cadeaus of aandacht
- Te snel te intens
- *Voorbeeld:* "Jij bent de ware, ik heb nog nooit zoiets gevoeld"

**BONUS - V6: Verleggen van grenzen** 🚨
- Jouw 'nee' wordt genegeerd
- Schuldgevoel aanpraten
- Subtiele druk uitoefenen
- *Voorbeeld:* "Als je echt om me gaf, zou je..."

---

### Sluiting

**Kernboodschap:**
"Onthoud de 5 V's: Vage info, Vlotte praat, Verhalen vol drama, Verdoezelde antwoorden, Verliefdheidsbombardement."

"En als iemand jouw grenzen verlegt — dat is V6. Dan stap je uit het gesprek. Punt."

**Gouden regel:**
💛 "Jouw veiligheid > iemand anders gevoelens."

---

**📹 VIDEO UPLOAD:**
Upload hier de video van ~4:30 minuten via het admin panel.`
    },
    {
      title: '🔍 Observatie-oefening',
      description: 'Bekijk 3 datingsituaties en identificeer de rode vlaggen (20 punten)',
      lesson_type: 'assignment',
      position: 2,
      content: `## 🔍 Observatie-oefening (20 punten)

**Doel:** Train jezelf in het herkennen van rode vlaggen in realistische situaties.

**Instructies:**
- Lees elk scenario zorgvuldig
- Kruis aan welke V('s) je herkent
- Leg uit waarom je deze vlag herkent
- Er kunnen meerdere vlaggen per scenario zijn

---

### 📱 Scenario 1: De Charmeur

**Chat transcript:**

👤 Alex: "Hey! Wat een prachtige glimlach op je foto's 😍"

👤 Jij: "Dankjewel! Hoe was je weekend?"

👤 Alex: "Geweldig nu ik jou heb ontmoet! Je bent echt anders dan anderen. Ik voel dat we een speciale connectie hebben. Wanneer kunnen we elkaar zien? Vanavond al? ❤️"

👤 Jij: "Ha, rustig aan! We chatten pas 5 minuten 😅"

👤 Alex: "Ik weet het, maar bij jou voelt het gewoon goed. Ik heb nog nooit zoiets gevoeld. Je bent perfect voor mij. Verwijder je andere matches? Dan weet ik dat je het serieus meent."

---

**Welke rode vlag(gen) herken je hier?**

- [ ] V1: Vage foto's of info
- [ ] V2: Vlotte maar oppervlakkige praat
- [ ] V3: Verhalen vol drama
- [ ] V4: Verdoezelde antwoorden
- [ ] V5: Verliefdheidsbombardement (Love Bombing)
- [ ] V6: Verleggen van grenzen

**Jouw uitleg (minimaal 30 woorden):**

[Typ hier waarom je deze vlag(gen) herkent]

---

### 📱 Scenario 2: De Mysterieuze Match

**Chat transcript:**

👤 Jij: "Leuk profiel! Wat doe je voor werk?"

👤 Sam: "Oh, dit en dat. Flexibel werk, weet je wel 😊"

👤 Jij: "Ah oké! En woon je in Amsterdam of omgeving?"

👤 Sam: "In de buurt, vertel eens over jezelf!"

👤 Jij: "Zullen we videobellen? Dan kunnen we beter kennismaken!"

👤 Sam: "Liever niet, mijn camera werkt niet goed. Maar je stem klinkt vast prachtig 💬"

👤 Jij: "We kunnen ook WhatsApp gebruiken?"

👤 Sam: "Ik vind de app fijner. Vertel, wat zijn je passies?"

---

**Welke rode vlag(gen) herken je hier?**

- [ ] V1: Vage foto's of info
- [ ] V2: Vlotte maar oppervlakkige praat
- [ ] V3: Verhalen vol drama
- [ ] V4: Verdoezelde antwoorden
- [ ] V5: Verliefdheidsbombardement
- [ ] V6: Verleggen van grenzen

**Jouw uitleg (minimaal 30 woorden):**

[Typ hier waarom je deze vlag(gen) herkent]

---

### 📱 Scenario 3: De Dramatische Date

**Chat transcript:**

👤 Jordan: "Fijn dat je wilt chatten. Ik heb een zware week achter de rug..."

👤 Jij: "Oh, wat vervelend! Wat is er gebeurd?"

👤 Jordan: "Mijn ex blijft me stalken. Alle vrouwen die ik date worden gek. Niemand begrijpt me zoals jij. Je lijkt zo stabiel en begripvol 🥺"

👤 Jij: "Dat klinkt heftig! Heb je daar hulp bij?"

👤 Jordan: "Therapie helpt niet. Maar met jou voel ik me eindelijk begrepen. Kun je me je nummer geven? Dan kunnen we buiten deze app praten. Ik vertrouw deze app niet meer na alles wat er gebeurd is..."

👤 Jij: "Laten we het rustig aan doen, ik geef niet meteen mijn nummer."

👤 Jordan: "Oh... Dus je vertrouwt me niet? Na alles wat ik gedeeld heb? Ik dacht dat jij anders was... 😔"

---

**Welke rode vlag(gen) herken je hier?**

- [ ] V1: Vage foto's of info
- [ ] V2: Vlotte maar oppervlakkige praat
- [ ] V3: Verhalen vol drama
- [ ] V4: Verdoezelde antwoorden
- [ ] V5: Verliefdheidsbombardement
- [ ] V6: Verleggen van grenzen

**Jouw uitleg (minimaal 30 woorden):**

[Typ hier waarom je deze vlag(gen) herkent]

---

## ✅ Antwoordmodel (voor zelfcontrole)

**Scenario 1:** V5 (Love Bombing) + V6 (Grenzen verleggen)
*Uitleg:* Te snel "speciale connectie", druk om matches te verwijderen na 5 minuten.

**Scenario 2:** V1 (Vage info) + V4 (Verdoezelde antwoorden)
*Uitleg:* Ontwijkt vragen over werk/locatie, weigert video, vage antwoorden.

**Scenario 3:** V3 (Drama) + V6 (Grenzen verleggen)
*Uitleg:* Slachtofferrol, negativiteit, schuldgevoel aanpraten bij weigering.

---

**💡 Goed gedaan!** Deze oefening helpt je patronen sneller herkennen in echte situaties.`
    },
    {
      title: '🎯 Kennisquiz: De 5 V\'s',
      description: 'Test je kennis met 5 multiple choice vragen (directe feedback)',
      lesson_type: 'quiz',
      position: 3,
      content: `## 🎯 Kennisquiz: De 5 V's

**📌 SPECIALE QUIZ COMPONENT**

Deze les gebruikt de bestaande **RedFlagsQuiz** component met 5 professionele vragen over:

1. Love Bombing (Verliefdheidsbombardement)
2. Catfishing (Vage identiteit)
3. Controlerend gedrag (Grenzen verleggen)
4. Inconsistente communicatie
5. Financiële scams

**Features:**
✅ Multiple choice vragen
✅ Directe feedback per vraag
✅ Uitleg bij elk antwoord
✅ Score tracking
✅ Progress bar

---

## 📊 Quiz wordt automatisch geladen

De quiz component wordt geladen vanuit:
\`src/components/quiz/red-flags-quiz.tsx\`

**Geen actie nodig** - de component is al volledig gebouwd en getest!

---

## 💡 Na de quiz

Neem even de tijd om te reflecteren:
- Welke vragen vond je moeilijk?
- Herken je situaties uit je eigen ervaring?
- Wat ga je anders doen na deze kennis?

**Onthoud:** De 5 V's zijn je nieuwe superpower bij online dating! 💪`
    },
    {
      title: '💭 Reflectie: Welke V zie jij het vaakst?',
      description: 'Persoonlijke reflectie over rode vlaggen in jouw ervaring (20 punten)',
      lesson_type: 'assignment',
      position: 4,
      content: `## 💭 Reflectie-oefening (20 punten)

Nu je de 5 V's kent, is het tijd om naar jezelf te kijken.

---

### Vraag 1: Welke vlag zie jij het vaakst bij anderen?

**Denk aan je ervaringen:**
- Bij matches op dating apps
- Bij mensen die je online ontmoet hebt
- Bij verhalen van vrienden

**Jouw antwoord:**

[Typ hier je antwoord - minimaal 50 woorden]

---

### Vraag 2: Welke rode vlag herken je bij jezelf?

**Eerlijke zelfreflectie:**
- Te snel vertrouwen geven?
- Te lang blijven in ongemakkelijke situaties?
- Rode vlaggen negeren omdat je eenzaam bent?
- Anderen excuses geven ("misschien bedoelt hij het niet zo...")?

**Jouw antwoord:**

[Typ hier je antwoord - minimaal 50 woorden]

---

### Vraag 3: Wat ga je vanaf nu anders doen?

**Concrete actieplannen:**
- Welke grenzen ga je stellen?
- Bij welke rode vlag stop je direct het gesprek?
- Hoe ga je je gevoel meer vertrouwen?

**Jouw antwoord:**

[Typ hier je antwoord - minimaal 50 woorden]

---

## 💪 Affirmaties voor jezelf

Kies er één die resoneert met jou:

- ✨ "Ik vertrouw mijn intuïtie"
- 🛡️ "Mijn veiligheid > iemand anders gevoelens"
- 💛 "Ik ben het waard om veilig te zijn"
- 🚨 "Bij V6 (grenzen verleggen) stop ik meteen"
- 🎯 "De 5 V's zijn mijn nieuwe superpower"

**Welke kies jij?**

[Typ hier je gekozen affirmatie]

---

**📌 Bewaar je antwoorden**
Deze reflectie helpt je bewust blijven van patronen en groei.`
    },
    {
      title: '💬 Forum Discussie: Herkenning en groei',
      description: 'Deel je ervaringen met de community (optioneel)',
      lesson_type: 'text',
      position: 5,
      content: `## 💬 Forum Discussie

**Vragen voor de community:**

1. **Welke 'V' zie jij het vaakst, en hoe reageer je nu anders?**
2. **Wat is jouw grootste les uit de 5 V's?**
3. **Welke 'V' heb je ooit genegeerd, en wat zou je nu anders doen?**

---

## 🛡️ Veiligheidsrichtlijnen

⚠️ **Belangrijk voordat je deelt:**

- **Gebruik triggerwarnings** bij persoonlijke verhalen over manipulatie of misbruik
- **Geen namen of herkenbare details** - bescherm jezelf en anderen
- **Wees respectvol** - iedereen heeft een eigen verhaal en tempo
- **Geef steun, geen oordeel** - we leren samen

---

## 💭 Seed Prompts om discussie te starten

**Voorbeelden van waardevolle bijdragen:**

> *"V5 (Love Bombing) herkende ik pas na deze module. Iemand zei na 2 dagen dat ik 'de ware' was. Ik vond het eerst romantisch, maar nu zie ik het als een rode vlag. Wat een eye-opener!"*

> *"V6 is mijn grootste les. Toen iemand bleef pushen nadat ik 'nee' zei, voelde ik me schuldig. Nu weet ik: bij V6 stop ik METEEN."*

> *"Bij mij was het V4 (verdoezelde antwoorden). Hij was vaag over z'n werk en woonplaats. Bleek verhalen te verzinnen. Nu stel ik directe vragen en accepteer geen vaagheid meer."*

---

## 📌 Sticky Post (Moderator)

💛 **"Herinner jezelf: Mijn veiligheid > iemand anders gevoelens."**

---

## 🔗 Link naar forum

[Klik hier om deel te nemen aan de discussie]

*Forumdiscussie is optioneel maar kan waardevol zijn voor je leerproces en om anderen te helpen.*

---

**👥 Community Guidelines:**
- **Reageer met empathie** - iedereen is op een eigen reis
- **Deel tips, geen oordelen** - wat werkt voor jou, werkt misschien niet voor een ander
- **Vier successen** - heeft iemand een grens gesteld? Vier het!
- **Meld ongepast gedrag** - we houden deze ruimte veilig voor iedereen`
    },
    {
      title: '📝 Post-Quiz: Meet je groei',
      description: 'Zelfde vragen als pre-quiz - zie hoeveel je geleerd hebt!',
      lesson_type: 'quiz',
      position: 6,
      content: `## 📝 Post-Quiz: Meet je groei!

**🎉 Gefeliciteerd!** Je hebt Module 2 bijna afgerond.

Nu is het tijd om te zien hoeveel je geleerd hebt!

---

## 📊 Vergelijking Pre-Quiz vs Post-Quiz

Je doet nu **exact dezelfde quiz** als aan het begin van Module 1.

**Waarom?**
- 📈 Zie je vooruitgang in kennis
- 💡 Meet je bewustzijn over rode vlaggen
- 🎯 Bevestig dat de training effectief was

---

## 📝 Post-Quiz Vragen (identiek aan Pre-Quiz)

### Vraag 1 van 5

**Stelling:** Overmatig snel "ik hou van je" zeggen kan een rode vlag zijn.

- [ ] Juist
- [ ] Onjuist

---

### Vraag 2 van 5

**Stelling:** Het is veilig als iemand nooit over zichzelf praat.

- [ ] Juist
- [ ] Onjuist

---

### Vraag 3 van 5

**Stelling:** Je hoeft je gevoel van ongemak niet te verklaren.

- [ ] Juist
- [ ] Onjuist

---

### Vraag 4 van 5

**Stelling:** Een profielfoto zonder gezicht is geen probleem.

- [ ] Juist
- [ ] Onjuist

---

### Vraag 5 van 5

**Stelling:** Jij mag altijd stoppen met een gesprek.

- [ ] Juist
- [ ] Onjuist

---

## 📊 Je Resultaten

**Pre-Quiz Score:** [wordt automatisch geladen]
**Post-Quiz Score:** [je huidige score]

**Vooruitgang:** [verschil wordt berekend]

---

## 🎉 Interpretatie van je groei

**5/5 correct in beide:** Je had al goede basiskennis - geweldig!
**Verbetering van 2+ punten:** Fantastische groei! De training werkt.
**Alle vragen correct nu:** Je bent klaar om de 5 V's toe te passen!

---

## 💪 Wat nu?

Je hebt nu:
✅ De 5 V's geleerd
✅ Rode vlaggen kunnen herkennen
✅ Concrete oefeningen gedaan
✅ Je groei gemeten

**Volgende stappen:**
1. Download je certificaat (indien beschikbaar)
2. Download het werkboek en houd het bij de hand
3. Deel je ervaring in het forum
4. Pas de 5 V's toe in echte situaties

---

💛 **"Onthoud de 5 V's. Jouw veiligheid is niet onderhandelbaar. Mijn veiligheid > iemand anders gevoelens."**`
    },
    {
      title: '📓 Download: Werkboek Les 2 - De 5 V\'s',
      description: 'PDF werkboek met checklists en affirmatiekaart',
      lesson_type: 'assignment',
      position: 7,
      content: `## 📓 Werkboek Les 2 – De 5 V's

**Wat zit erin:**
- ❤️ Titelpagina met visuele samenvatting van de 5 V's + icoontjes
- 📋 Checklists: "Herken jij dit bij de ander?"
- 💭 Reflectie-oefeningen op papier
- 🎯 Affirmatiekaart (uitknippen en bij de hand houden)
- 📱 Screenshot-analyzer voor je eigen chats
- 🛡️ Actieplan bij rode vlaggen

---

## 📥 Download Werkboek

**⚠️ ADMIN: Upload hier de PDF via het admin panel**

[Download knop verschijnt hier na upload]

---

## 💡 Extra bonus in dit werkboek

### 🎯 Mini Affirmatiekaart (print en knip uit)

**MIJN VEILIGHEIDS-MANTRA**

- ✨ Ik kies mezelf
- 🛡️ Ik vertrouw mijn gevoel
- 💛 Ik ben veilig

Bij de 5 V's: STOP & WAARSCHUW

**Tip:** Knip deze kaart uit en bewaar hem in je portemonnee of maak er een foto van als achtergrond op je telefoon!

---

## 📋 Checklist: Herken jij dit bij de ander?

Print deze pagina en gebruik hem als **quick reference** bij je dating-apps:

**V1 - Vage foto's/info:**
- [ ] Geen duidelijke profielfoto
- [ ] Ontwijkt vragen over basisinfo
- [ ] Weigert video calls
- [ ] Profiel heeft weinig details

**V2 - Vlotte maar oppervlakkige praat:**
- [ ] Veel complimenten, weinig echte vragen
- [ ] Gesprek blijft oppervlakkig
- [ ] Geen interesse in je dromen/passies
- [ ] Flirt zonder diepgang

**V3 - Verhalen vol drama:**
- [ ] Altijd slachtoffer van omstandigheden
- [ ] Alle ex-en zijn "gek" of "slecht"
- [ ] Veel negativiteit
- [ ] Zoekt medelijden

**V4 - Verdoezelde antwoorden:**
- [ ] Vaag over werk/woonplaats
- [ ] Verhalen kloppen niet
- [ ] Details veranderen per gesprek
- [ ] Ontwijkend over relatiestatus

**V5 - Verliefdheidsbombardement:**
- [ ] "Ik hou van je" binnen paar dagen
- [ ] Overdreven cadeaus/aandacht
- [ ] Te snel te intens
- [ ] "Jij bent de ware"

**V6 - Verleggen van grenzen (DEALBREAKER!):**
- [ ] Jouw 'nee' wordt genegeerd
- [ ] Schuldgevoel aanpraten
- [ ] Subtiele druk
- [ ] "Als je echt om me gaf..."

---

## 🚨 Actieplan bij Rode Vlaggen

**Bij V1-V5:** Wees alert, stel vragen, neem tijd

**Bij V6:** **STOP METEEN**
1. Screenshot het gesprek (bewijs)
2. Blokkeer de persoon
3. Rapporteer aan de dating-app
4. Vertrouw je gevoel - je hoeft niets uit te leggen

---

## 📱 Screenshot Analyzer

**Gebruik deze vragen bij twijfel:**

Als je een gesprek hebt waar je onzeker over bent:
1. Maak een screenshot
2. Ga de checklist hierboven langs
3. Vraag jezelf:
   - "Zou ik dit gesprek aan een vriend laten zien?"
   - "Voel ik me veilig en gerespecteerd?"
   - "Worden mijn grenzen gerespecteerd?"

**Rood licht?** Dan is het een rode vlag.

---

💛 **"Mijn veiligheid > iemand anders gevoelens"**

Bewaar dit werkboek bij de hand tijdens je dating-avonturen!`
    }
  ]
};

async function setupRedFlagsModule() {
  try {
    console.log('🌹 Starting Red Flags Module Setup...\n');
    console.log(`📚 Course ID: ${COURSE_ID}`);

    // Verify course exists
    const course = await sql`SELECT id, title FROM courses WHERE id = ${COURSE_ID}`;
    if (course.rows.length === 0) {
      throw new Error(`Course ID ${COURSE_ID} not found!`);
    }
    console.log(`✅ Course found: ${course.rows[0].title}\n`);

    // Check if modules already exist
    const existingModules = await sql`SELECT id FROM course_modules WHERE course_id = ${COURSE_ID}`;
    if (existingModules.rows.length > 0) {
      console.log('⚠️  Modules already exist for this course!');
      console.log('   Delete them first or this script will create duplicates.');
      console.log('   Exiting without changes.\n');
      process.exit(0);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create Module 1
    console.log(`📖 Creating Module 1: ${MODULE_1.title}`);
    const module1Result = await sql`
      INSERT INTO course_modules (course_id, title, description, position)
      VALUES (${COURSE_ID}, ${MODULE_1.title}, ${MODULE_1.description}, ${MODULE_1.position})
      RETURNING id
    `;
    const module1Id = module1Result.rows[0].id;
    console.log(`   ✅ Module 1 created (ID: ${module1Id})`);

    // Create lessons for Module 1
    console.log(`   📝 Creating ${MODULE_1.lessons.length} lessons for Module 1...\n`);
    for (const lesson of MODULE_1.lessons) {
      await sql`
        INSERT INTO course_lessons (
          module_id, title, description, content, lesson_type,
          video_url, video_duration, is_preview, position
        ) VALUES (
          ${module1Id}, ${lesson.title}, ${lesson.description}, ${lesson.content},
          ${lesson.lesson_type}, ${null}, ${null}, ${lesson.is_preview || false}, ${lesson.position}
        )
      `;
      console.log(`      ✓ ${lesson.position}. ${lesson.title} (${lesson.lesson_type})`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create Module 2
    console.log(`📖 Creating Module 2: ${MODULE_2.title}`);
    const module2Result = await sql`
      INSERT INTO course_modules (course_id, title, description, position)
      VALUES (${COURSE_ID}, ${MODULE_2.title}, ${MODULE_2.description}, ${MODULE_2.position})
      RETURNING id
    `;
    const module2Id = module2Result.rows[0].id;
    console.log(`   ✅ Module 2 created (ID: ${module2Id})`);

    // Create lessons for Module 2
    console.log(`   📝 Creating ${MODULE_2.lessons.length} lessons for Module 2...\n`);
    for (const lesson of MODULE_2.lessons) {
      await sql`
        INSERT INTO course_lessons (
          module_id, title, description, content, lesson_type,
          video_url, video_duration, is_preview, position
        ) VALUES (
          ${module2Id}, ${lesson.title}, ${lesson.description}, ${lesson.content},
          ${lesson.lesson_type}, ${null}, ${null}, ${lesson.is_preview || false}, ${lesson.position}
        )
      `;
      console.log(`      ✓ ${lesson.position}. ${lesson.title} (${lesson.lesson_type})`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Summary
    console.log('🎉 RED FLAGS MODULE SETUP COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   - Course ID: ${COURSE_ID}`);
    console.log(`   - Module 1 ID: ${module1Id} (${MODULE_1.lessons.length} lessons)`);
    console.log(`   - Module 2 ID: ${module2Id} (${MODULE_2.lessons.length} lessons)`);
    console.log(`   - Total lessons: ${MODULE_1.lessons.length + MODULE_2.lessons.length}`);
    console.log('\n📹 Next Steps (MANUAL):');
    console.log('   1. Go to /admin/courses');
    console.log(`   2. Open course ID ${COURSE_ID}`);
    console.log('   3. Upload video for Module 1 → Les 1 (~3:30 min)');
    console.log('   4. Upload video for Module 2 → Les 1 (~4:30 min)');
    console.log('   5. Upload PDF werkboek for Module 1 → Les 5');
    console.log('   6. Upload PDF werkboek for Module 2 → Les 7');
    console.log('\n✨ Module is now ready for testing at:');
    console.log('   http://localhost:9001/dashboard/starter/starter-4\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupRedFlagsModule();
