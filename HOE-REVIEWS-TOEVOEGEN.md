# 8 Reviews Toevoegen

## Optie 1: Via Admin Panel (Aanbevolen - Simpel)

1. Ga naar: `http://localhost:9003/admin/reviews`
2. Log in als admin
3. Klik op "Nieuwe Review" voor elke review hieronder
4. Kopieer en plak de gegevens

### Review 1
- **Naam**: Sophie van der Berg
- **Rol**: Gebruiker sinds 3 maanden
- **Avatar URL**: https://i.pravatar.cc/150?img=1
- **Rating**: 5
- **Content**: Eindelijk een dating coach die altijd bereikbaar is! De AI geeft echt praktische tips voor gesprekken op Tinder. Mijn matches zijn met 40% gestegen en ik heb nu veel betere gesprekken. Aanrader!

### Review 2
- **Naam**: Mark Jansen
- **Rol**: Premium gebruiker
- **Avatar URL**: https://i.pravatar.cc/150?img=12
- **Rating**: 5
- **Content**: Was eerst sceptisch over een AI dating assistent, maar dit werkt echt. De profielanalyse gaf me concrete verbeterpunten en de gespreksvoorstellen zijn natuurlijk en effectief. Binnen 2 weken m'n eerste date!

### Review 3
- **Naam**: Lisa Chen
- **Rol**: Gebruiker sinds 6 maanden
- **Avatar URL**: https://i.pravatar.cc/150?img=5
- **Rating**: 5
- **Content**: De beste investering voor mijn dating leven. De AI helpt me om zelfverzekerder te zijn in gesprekken en geeft tips die écht bij mij passen. Niet generiek, maar persoonlijk advies. Love it!

### Review 4
- **Naam**: Thomas de Vries
- **Rol**: Core abonnement
- **Avatar URL**: https://i.pravatar.cc/150?img=15
- **Rating**: 4
- **Content**: Super handig dat je direct advies krijgt over hoe je moet reageren. Scheelt zoveel tijd en stress. Sommige suggesties zijn wat algemeen, maar overall echt de moeite waard. 4 sterren!

### Review 5
- **Naam**: Emma Bakker
- **Rol**: Gebruiker sinds 1 maand
- **Avatar URL**: https://i.pravatar.cc/150?img=9
- **Rating**: 5
- **Content**: Had moeite met het starten van gesprekken op dating apps. DatingAssistent geeft me leuke, originele openingszinnen en helpt me het gesprek gaande te houden. Veel meer matches dan voorheen!

### Review 6
- **Naam**: Kevin Pieters
- **Rol**: Premium gebruiker
- **Avatar URL**: https://i.pravatar.cc/150?img=13
- **Rating**: 4
- **Content**: Als iemand die niet zo goed is in flirten via tekst, is dit een game-changer. De AI begrijpt context en geeft relevante suggesties. Mijn conversaties lopen nu veel soepeler. Zou wel meer customization willen.

### Review 7
- **Naam**: Jasmine Vermeer
- **Rol**: Gebruiker sinds 4 maanden
- **Avatar URL**: https://i.pravatar.cc/150?img=26
- **Rating**: 5
- **Content**: Ik was altijd onzeker over wat ik moest zeggen na een match. DatingAssistent geeft me het vertrouwen om authentiek te zijn en toch interessant over te komen. De foto-analyse feature is ook top!

### Review 8
- **Naam**: Ruben Smit
- **Rol**: Core abonnement
- **Avatar URL**: https://i.pravatar.cc/150?img=14
- **Rating**: 4
- **Content**: Solide tool voor iedereen die serieus is over online dating. De tips zijn praktisch en werken echt. Enige minpunt is dat de AI soms wat formeel klinkt, maar je kunt de suggesties natuurlijk aanpassen. Zeker het proberen waard!

---

## Optie 2: Via Browser Console (Snel - Alle 8 tegelijk)

1. Ga naar `http://localhost:9003/admin/reviews`
2. Log in als admin
3. Open de browser console (F12)
4. Plak en run dit script:

```javascript
// Kopieer dit hele script en plak het in de browser console
const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js');
const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js');

// Gebruik de bestaande Firebase instance van de pagina
const db = getFirestore();

const reviews = [
  {
    name: "Sophie van der Berg",
    role: "Gebruiker sinds 3 maanden",
    content: "Eindelijk een dating coach die altijd bereikbaar is! De AI geeft echt praktische tips voor gesprekken op Tinder. Mijn matches zijn met 40% gestegen en ik heb nu veel betere gesprekken. Aanrader!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=1",
    createdAt: serverTimestamp()
  },
  {
    name: "Mark Jansen",
    role: "Premium gebruiker",
    content: "Was eerst sceptisch over een AI dating assistent, maar dit werkt echt. De profielanalyse gaf me concrete verbeterpunten en de gespreksvoorstellen zijn natuurlijk en effectief. Binnen 2 weken m'n eerste date!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=12",
    createdAt: serverTimestamp()
  },
  {
    name: "Lisa Chen",
    role: "Gebruiker sinds 6 maanden",
    content: "De beste investering voor mijn dating leven. De AI helpt me om zelfverzekerder te zijn in gesprekken en geeft tips die écht bij mij passen. Niet generiek, maar persoonlijk advies. Love it!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=5",
    createdAt: serverTimestamp()
  },
  {
    name: "Thomas de Vries",
    role: "Core abonnement",
    content: "Super handig dat je direct advies krijgt over hoe je moet reageren. Scheelt zoveel tijd en stress. Sommige suggesties zijn wat algemeen, maar overall echt de moeite waard. 4 sterren!",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?img=15",
    createdAt: serverTimestamp()
  },
  {
    name: "Emma Bakker",
    role: "Gebruiker sinds 1 maand",
    content: "Had moeite met het starten van gesprekken op dating apps. DatingAssistent geeft me leuke, originele openingszinnen en helpt me het gesprek gaande te houden. Veel meer matches dan voorheen!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=9",
    createdAt: serverTimestamp()
  },
  {
    name: "Kevin Pieters",
    role: "Premium gebruiker",
    content: "Als iemand die niet zo goed is in flirten via tekst, is dit een game-changer. De AI begrijpt context en geeft relevante suggesties. Mijn conversaties lopen nu veel soepeler. Zou wel meer customization willen.",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?img=13",
    createdAt: serverTimestamp()
  },
  {
    name: "Jasmine Vermeer",
    role: "Gebruiker sinds 4 maanden",
    content: "Ik was altijd onzeker over wat ik moest zeggen na een match. DatingAssistent geeft me het vertrouwen om authentiek te zijn en toch interessant over te komen. De foto-analyse feature is ook top!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=26",
    createdAt: serverTimestamp()
  },
  {
    name: "Ruben Smit",
    role: "Core abonnement",
    content: "Solide tool voor iedereen die serieus is over online dating. De tips zijn praktisch en werken echt. Enige minpunt is dat de AI soms wat formeel klinkt, maar je kunt de suggesties natuurlijk aanpassen. Zeker het proberen waard!",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?img=14",
    createdAt: serverTimestamp()
  }
];

// Voeg alle reviews toe
for (const review of reviews) {
  await addDoc(collection(db, 'reviews'), review);
  console.log(`✅ Added review from ${review.name}`);
}

console.log('🎉 Alle 8 reviews zijn toegevoegd!');
```

5. Refresh de pagina om de nieuwe reviews te zien

---

## De reviews zijn professioneel en divers:
- ✅ Mix van 5 en 4 sterren (realistisch)
- ✅ Diverse namen (mannelijk/vrouwelijk)
- ✅ Verschillende abonnement types
- ✅ Authentieke ervaringen
- ✅ Balans tussen positief en constructief
- ✅ Avatar afbeeldingen toegevoegd
