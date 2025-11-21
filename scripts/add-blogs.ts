import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'studio-1884662658-29957',
  appId: '1:695820370437:web:e366561d1e887f83e7926c',
  apiKey: 'AIzaSyDFXpu74SsXvkiYaD5iPCoro3rCLKJ9vCo',
  authDomain: 'studio-1884662658-29957.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '695820370437',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const blogs = [
  {
    title: 'Online daten: voorbij het taboe',
    slug: 'online-daten-taboe-2015',
    metaTitle: 'Online daten voorbij het taboe (2015)',
    metaDescription: 'In 2015 verdween het taboe op online daten langzaam. Ontdek waarom daten via internet juist kansen biedt.',
    excerpt: 'Tien jaar geleden keek men nog vreemd op als je vertelde dat je via internet iemand ontmoette. Maar in 2015 begint dit beeld snel te veranderen.',
    keywords: ['online daten', 'taboe', '2015', 'dating apps'],
    publishDate: Timestamp.fromDate(new Date('2015-02-08')),
    image: '',
    content: `
      <p>Tien jaar geleden keek men nog vreemd op als je vertelde dat je via internet iemand ontmoette. "Is dat wel veilig?" of "Ben je zo wanhopig?" waren veelgehoorde opmerkingen. Maar in 2015 begint dit beeld snel te veranderen. Steeds meer mensen zien online daten niet langer als laatste redmiddel, maar als een volwaardige manier om liefde te vinden.</p>

      <h2>Waarom het taboe langzaam verdwijnt</h2>
      <ul>
        <li><strong>Normalisatie:</strong> Bekende apps als Lexa en Relatieplanet investeren in reclame en maken daten bespreekbaar.</li>
        <li><strong>Succesverhalen:</strong> Vrienden en familie kennen steeds vaker stellen die elkaar online ontmoetten.</li>
        <li><strong>Drukte in het dagelijks leven:</strong> Mensen hebben minder tijd om "spontaan" iemand tegen te komen, dus een online zetje is welkom.</li>
      </ul>

      <h2>Vooroordelen in 2015</h2>
      <p>Toch bestaan er in 2015 nog hardnekkige ideeën:</p>
      <ul>
        <li>Online daten zou onveilig zijn.</li>
        <li>Het zou alleen voor "wanhopigen" zijn.</li>
        <li>Je zou er geen serieuze relaties vinden.</li>
      </ul>
      <p>In de praktijk bleek het tegendeel: duizenden relaties en huwelijken ontstonden via het internet.</p>

      <h2>Conclusie</h2>
      <p>Online daten is in 2015 nog niet helemaal mainstream, maar het taboe brokkelt snel af. Wat ooit vreemd of ongemakkelijk voelde, wordt langzaam een normaal gespreksonderwerp tijdens verjaardagen en etentjes.</p>
    `,
  },
  {
    title: 'Eerste date stress? Zo pak je het ontspannen aan',
    slug: 'eerste-date-stress-tips-2015',
    metaTitle: 'Eerste date tips tegen stress (2015)',
    metaDescription: 'In 2015 gaven we tips om je eerste date ontspannen aan te pakken. Ontdek 7 simpele manieren om de spanning te verminderen.',
    excerpt: 'De eerste ontmoeting met iemand die je online hebt leren kennen is altijd spannend. Ontdek 7 tips om een eerste date zonder stress in te gaan.',
    keywords: ['eerste date', 'stress', 'dating tips', '2015'],
    publishDate: Timestamp.fromDate(new Date('2015-09-17')),
    image: '',
    content: `
      <p>De eerste ontmoeting met iemand die je online hebt leren kennen is altijd spannend. "Wat als het stilvalt? Wat als ik iets stoms zeg?" In 2015 worstelen veel singles met dit soort vragen. Daarom deelden we toen 7 tips om een eerste date zonder stress in te gaan.</p>

      <h2>Kies een neutrale plek</h2>
      <p>Een café of lunchroom voelt laagdrempeliger dan een chic restaurant. Het maakt het gesprek losser en minder beladen.</p>

      <h2>Houd het luchtig</h2>
      <p>De eerste date is geen sollicitatiegesprek. Vermijd zware thema's en focus op interesses, hobby's en grappige verhalen.</p>

      <h2>Leg de lat niet te hoog</h2>
      <p>Zie een eerste date als kennismaking, niet als "de grote liefde meteen vinden". Die ontspanning geeft ruimte voor echte verbinding.</p>

      <h2>Tips in 2015</h2>
      <ul>
        <li>Draag kleding waarin je je prettig voelt.</li>
        <li>Kom op tijd, maar niet overdreven vroeg.</li>
        <li>Stel open vragen, luister écht.</li>
      </ul>

      <h2>Conclusie</h2>
      <p>Met de juiste voorbereiding hoeft een eerste date geen stressbron te zijn. In 2015 schreven we al: het draait niet om perfectie, maar om echtheid.</p>
    `,
  },
  {
    title: 'Flirten via chat: hoe houd je het leuk en luchtig?',
    slug: 'flirten-chat-tips-2016',
    metaTitle: 'Flirten via chat tips (2016)',
    metaDescription: 'In 2016 gaven we advies voor luchtig flirten via chat. Leer hoe je humor en speelse vragen gebruikt om interesse te wekken.',
    excerpt: 'Online flirten begint vaak met een chatbericht. Ontdek hoe je het leuk en luchtig houdt met humor en nieuwsgierige vragen.',
    keywords: ['flirten', 'chat', 'online daten', '2016', 'openingszinnen'],
    publishDate: Timestamp.fromDate(new Date('2016-04-23')),
    image: '',
    content: `
      <p>Online flirten begint vaak met een chatbericht. Maar hoe zorg je dat het niet saai wordt? In 2016 onderzochten we hoe singles via chat hun interesse toonden, zonder te overdonderen.</p>

      <h2>Houd het speels</h2>
      <p>Een vleugje humor werkt beter dan een standaard "Hoi, hoe gaat het?". Een grapje of luchtige vraag maakt meteen een verschil.</p>

      <h2>Stel nieuwsgierige vragen</h2>
      <p>Voorbeelden die in 2016 populair waren:</p>
      <ul>
        <li>"Wat is jouw perfecte zondag?"</li>
        <li>"Als je morgen op vakantie mocht, waar zou je heen gaan?"</li>
        <li>"Welke film heb je het vaakst gezien?"</li>
      </ul>

      <h2>Complimenten, maar met mate</h2>
      <p>Een compliment werkt, maar te veel voelt al snel overdreven. Kies iets specifieks: een glimlach, een hobby, of de manier waarop iemand iets vertelt in zijn profiel.</p>

      <h2>Conclusie</h2>
      <p>Flirten via chat is geen hogere wiskunde, maar wel een kunst. Door luchtig, nieuwsgierig en eerlijk te blijven, ontstaat de beste kans op een echt gesprek.</p>
    `,
  },
  {
    title: 'Ghosting en andere moderne datingproblemen',
    slug: 'ghosting-online-daten-2016',
    metaTitle: 'Ghosting en datingproblemen (2016)',
    metaDescription: 'In 2016 doken nieuwe datingproblemen op, zoals ghosting. Ontdek wat het is en hoe je ermee omgaat.',
    excerpt: 'Ghosting is wanneer iemand zonder uitleg volledig uit je leven verdwijnt. Ontdek wat ghosting is en hoe je ermee omgaat.',
    keywords: ['ghosting', 'online daten', 'datingproblemen', '2016', 'benching'],
    publishDate: Timestamp.fromDate(new Date('2016-11-09')),
    image: '',
    content: `
      <p>In 2016 kreeg online daten er een nieuw woord bij: ghosting. Het fenomeen waarbij iemand zonder uitleg volledig uit je leven verdwijnt. Je dacht dat alles goed ging, maar ineens geen appjes meer, geen uitleg – niets. Hoe ga je daarmee om?</p>

      <h2>Wat is ghosting precies?</h2>
      <p>Ghosting betekent dat een contact of relatie ineens wordt afgebroken zonder verklaring. Voor de ontvanger voelt dat pijnlijk en verwarrend.</p>

      <h2>Andere datingproblemen in 2016</h2>
      <ul>
        <li><strong>Benching:</strong> iemand warm houden zonder echt verder te gaan.</li>
        <li><strong>Breadcrumbing:</strong> kleine beetjes aandacht geven zonder serieuze intenties.</li>
        <li><strong>Orbiting:</strong> iemand op social media blijven volgen, maar niet meer in het echt reageren.</li>
      </ul>

      <h2>Hoe ga je ermee om?</h2>
      <ul>
        <li>Zie ghosting als een teken dat iemand niet bij je past.</li>
        <li>Zoek geen schuld bij jezelf.</li>
        <li>Blijf authentiek en ga verder – jouw tijd is kostbaar.</li>
      </ul>

      <h2>Conclusie</h2>
      <p>Ghosting en andere moderne datingproblemen kwamen in 2016 op, maar de kern van daten blijft: eerlijk communiceren. Wie dat doet, vindt uiteindelijk de juiste match.</p>
    `,
  },
  {
    title: 'Liefde vinden als je weinig ervaring hebt met daten',
    slug: 'liefde-vinden-weinig-ervaring-2017',
    metaTitle: 'Liefde vinden zonder ervaring (2017)',
    metaDescription: 'In 2017 gaven we tips voor singles met weinig ervaring in daten. Ontdek hoe je klein begint en vertrouwen opbouwt.',
    excerpt: 'Voor sommige singles voelt online daten overweldigend. Ontdek hoe je begint als je nog weinig ervaring hebt.',
    keywords: ['online daten', 'beginners', 'dating tips', '2017', 'ervaring'],
    publishDate: Timestamp.fromDate(new Date('2017-07-05')),
    image: '',
    content: `
      <p>Niet iedereen heeft al tientallen dates achter de rug. Voor sommige singles voelt online daten in 2017 juist overweldigend. Hoe begin je als je nog weinig ervaring hebt?</p>

      <h2>Begin klein</h2>
      <p>Je hoeft niet meteen elke dag te swipen. Bouw rustig je profiel op, leer hoe gesprekken verlopen, en voel je niet verplicht om direct af te spreken.</p>

      <h2>Stel je grenzen</h2>
      <p>Als beginner is het belangrijk om je eigen tempo te bewaken. Spreek pas af als jij je daar prettig bij voelt.</p>

      <h2>Oefen met korte gesprekken</h2>
      <p>Een luchtig gesprekje via chat is een goede manier om vertrouwen op te doen. Zo leer je de dynamiek van online daten kennen zonder druk.</p>

      <h2>Conclusie</h2>
      <p>In 2017 schreven we al: liefde vinden draait niet om ervaring, maar om openheid. Iedereen kan een eerste stap zetten, ongeacht achtergrond of tempo.</p>
    `,
  },
];

async function addBlogs() {
  try {
    console.log('Starting to add blogs...');

    for (const blog of blogs) {
      const docRef = await addDoc(collection(db, 'blogs'), {
        ...blog,
        viewCount: 0, // Initialize view count to 0
        createdAt: Timestamp.now(),
      });
      console.log(`✓ Added blog: "${blog.title}" with ID: ${docRef.id}`);
    }

    console.log('\n✓ All blogs added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding blogs:', error);
    process.exit(1);
  }
}

addBlogs();
