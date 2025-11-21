import { OnboardingStep } from "@/components/shared/tool-onboarding-overlay";

/**
 * Onboarding content voor alle tools
 *
 * Definieer hier de stappen voor elk tool's onboarding overlay.
 */

export const TOOL_ONBOARDING_STEPS: Record<string, OnboardingStep[]> = {
  'profiel-coach': [
    {
      title: "Welkom bij Profiel Coach!",
      description: "Hier help ik je een authentiek en aantrekkelijk dating profiel te maken dat écht bij jou past. Geen standaard teksten, maar jouw verhaal.",
      icon: "✨",
      tip: "Wees eerlijk over wie je bent - authenticiteit trekt de juiste matches aan!"
    },
    {
      title: "Vul je huidige bio in",
      description: "Plak je huidige profiel tekst of begin vanaf nul. Ik analyseer wat goed werkt en waar je kan verbeteren.",
      icon: "📝"
    },
    {
      title: "Krijg AI-gedreven feedback",
      description: "Je ontvangt concrete suggesties om je profiel te verbeteren: van tone-of-voice tot specifieke zinnen die beter converteren.",
      icon: "🎯",
      tip: "Test verschillende versies! Je kan meerdere bio's genereren en vergelijken."
    }
  ],

  'foto-advies': [
    {
      title: "Welkom bij Foto Advies!",
      description: "Je profielfoto is de belangrijkste factor voor je eerste indruk. Laat me je helpen de perfect foto te kiezen.",
      icon: "📸",
      tip: "Wist je? Profielfoto's met natuurlijk licht krijgen 40% meer matches!"
    },
    {
      title: "Upload je foto of screenshot",
      description: "Je kunt zowel losse foto's uploaden als screenshots van je complete dating app profiel. Ik analyseer beide!",
      icon: "⬆️"
    },
    {
      title: "Krijg professionele feedback",
      description: "Je krijgt een score op 4 aspecten: belichting, compositie, authenticiteit en gezichtsuitdrukking. Plus concrete tips om te verbeteren!",
      icon: "⭐",
      tip: "Upload meerdere foto's en vergelijk de scores om je beste opties te vinden."
    }
  ],

  'chat-coach': [
    {
      title: "Welkom bij Chat Coach!",
      description: "Ik ben je persoonlijke dating coach. Stel me alles over profielen, gesprekken, date planning en meer!",
      icon: "💬",
      tip: "Hoe specifieker je vraag, hoe beter ik kan helpen!"
    },
    {
      title: "Stel specifieke vragen",
      description: "Vraag bijvoorbeeld: 'Hoe reageer ik op dit bericht?' of 'Wat zijn goede gespreksstarters voor iemand die van wandelen houdt?'",
      icon: "❓"
    },
    {
      title: "Oefen gesprekken",
      description: "Gebruik me als sparringpartner om moeilijke situaties te oefenen. Hoe zeg je dat je date zoekt? Hoe vraag je om een date?",
      icon: "🎭",
      tip: "Ik onthouw onze eerdere gesprekken, dus je kan doorvragen en dieper ingaan!"
    }
  ],

  'gesprek-starter': [
    {
      title: "Welkom bij Gesprek Starters!",
      description: "Van het vinden van het perfecte platform tot het starten van boeiende gesprekken - alles op één plek.",
      icon: "💌",
      tip: "Begin met de Platform Match om te ontdekken welke dating app het beste bij je past!"
    },
    {
      title: "Vind je perfecte platform",
      description: "Beantwoord een paar vragen en ontdek of Tinder, Bumble, Lexa of een ander platform het beste bij jouw stijl past.",
      icon: "🎯"
    },
    {
      title: "Genereer custom openers",
      description: "Upload iemand's profiel en krijg 3 persoonlijke, creatieve openingszinnen die echt bij die persoon passen.",
      icon: "✨",
      tip: "Gebruik de veiligheidscheck om te zien of een gesprek gezond verloopt!"
    }
  ],

  'date-planner': [
    {
      title: "Welkom bij Date Planner!",
      description: "Van inspiratie voor de perfecte date tot een zen voorbereiding en nuttige reflectie achteraf.",
      icon: "💝",
      tip: "Een goede date is 50% planning, 50% spontaniteit!"
    },
    {
      title: "Krijg date ideeën",
      description: "Voer je stad in en krijg creatieve, lokale date suggesties. Van actief tot ontspannen, van goedkoop tot speciaal.",
      icon: "💡"
    },
    {
      title: "Voorbereiding & reflectie",
      description: "Gebruik de checklist om niets te vergeten. Na je date: reflecteer om steeds beter te worden in daten!",
      icon: "📋",
      tip: "Reflectie helpt je patronen te zien en je dating skills te verbeteren."
    }
  ],

  'online-cursus': [
   {
     title: "Welkom bij de Online Cursussen!",
     description: "Leer dating skills op jouw tempo met onze interactieve cursussen, van profieloptimalisatie tot gesprekstechnieken.",
     icon: "🎓",
     tip: "Begin met de starter cursussen - die geven je direct toepasbare tips!"
   },
   {
     title: "Volg modules in jouw tempo",
     description: "Elke cursus bestaat uit korte, praktische modules met video's, quizzen en oefeningen. Doe ze wanneer jij wilt!",
     icon: "📚"
   },
   {
     title: "Track je voortgang",
     description: "Zie hoever je bent, earn badges voor voltooide modules, en krijg vervolgcursussen aanbevolen op basis van je niveau.",
     icon: "📊",
     tip: "Zet push notificaties aan om niet te vergeten verder te gaan!"
   }
 ],

 'platform-match': [
   {
     title: "Welkom bij AI Platform Match!",
     description: "Ontdek welke dating platforms perfect bij jou passen. Van Tinder tot niche apps - ik vind je ideale match!",
     icon: "🎯",
     tip: "Wist je? Het juiste platform kan je match kansen met 300% verhogen!"
   },
   {
     title: "Vertel me over jezelf",
     description: "Vul je leeftijd, geslacht, locatie en relatie doel in. Hoe specifieker je bent, hoe accurater mijn aanbevelingen.",
     icon: "👤"
   },
   {
     title: "Krijg gepersonaliseerde platform tips",
     description: "Ontvang 3-5 platform aanbevelingen met match scores, strategieën en waarom ze bij jou passen. Van casual swipen tot serieus daten!",
     icon: "📱",
     tip: "Test altijd minimaal 2 platforms tegelijk voor de beste resultaten."
   }
 ],

 'openingszinnen-generator': [
   {
     title: "Welkom bij AI Openingszinnen Generator!",
     description: "Genereer persoonlijke, effectieve openingsberichten die écht werken. Geen standaard teksten meer!",
     icon: "💬",
     tip: "Goede openers krijgen gemiddeld 3x meer responses dan slechte!"
   },
   {
     title: "Beschrijf het profiel",
     description: "Plak alle informatie van het profiel dat je wilt benaderen: bio, interesses, leeftijd, foto beschrijving. Hoe meer details, hoe beter!",
     icon: "👀"
   },
   {
     title: "Krijg 5 gepersonaliseerde openers",
     description: "Ontvang 5 verschillende openingszinnen met effectiviteitsanalyse. Van foto-based tot humor tot vragen - allemaal aangepast op dat profiel.",
     icon: "✨",
     tip: "Personaliseer altijd! Neem iets specifieks uit hun profiel op voor 30-50% meer responses."
   }
 ],

 'ijsbreker-generator': [
   {
     title: "Welkom bij AI IJsbreker Generator!",
     description: "Genereer perfecte gesprekstarters voor elke situatie. Van eerste dates tot diepe gesprekken - ik heb de juiste ijsbreker!",
     icon: "❄️",
     tip: "Een goede ijsbreker kan een saai gesprek in 30 seconden veranderen!"
   },
   {
     title: "Vertel me de context",
     description: "Beschrijf de persoon, jullie relatie stadium, huidige sfeer en wat je wilt bereiken. Hoe meer context, hoe relevanter de ijsbrekers.",
     icon: "🎭"
   },
   {
     title: "Krijg 6 contextuele ijsbrekers",
     description: "Ontvang 6 verschillende ijsbrekers met categorieën, moeilijkheidsgraad en follow-up tips. Van licht tot diepgaand!",
     icon: "🎯",
     tip: "Begin altijd met de makkelijkste ijsbrekers en bouw op naar diepere gesprekken."
   }
 ],

 'veiligheidscheck': [
   {
     title: "Welkom bij AI Veiligheidscheck!",
     description: "Analyseer gesprekken op veiligheid en rode vlaggen. Je online veiligheid eerst - altijd!",
     icon: "🛡️",
     tip: "Beter safe dan sorry! Controleer altijd gesprekken die vreemd voelen."
   },
   {
     title: "Plak het volledige gesprek",
     description: "Kopieer alle berichten van jullie gesprek - van begin tot eind. Hoe meer berichten, hoe accurater de analyse.",
     icon: "📝"
   },
   {
     title: "Krijg gedetailleerde safety analyse",
     description: "Ontvang een risico score, rode/groene vlaggen, gedragsanalyse en concrete aanbevelingen voor je veiligheid.",
     icon: "🔍",
     tip: "Vertrouw je intuïtie! Als iets niet klopt, stop dan altijd het gesprek."
   }
 ]
};

/**
 * Get onboarding steps voor een specifieke tool
 */
export function getOnboardingSteps(toolName: string): OnboardingStep[] {
  return TOOL_ONBOARDING_STEPS[toolName] || [];
}

/**
 * Check if tool has onboarding content
 */
export function hasOnboarding(toolName: string): boolean {
  return toolName in TOOL_ONBOARDING_STEPS && TOOL_ONBOARDING_STEPS[toolName].length > 0;
}

/**
 * Get display name voor tool
 */
export function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    'profiel-coach': 'Profiel Coach',
    'foto-advies': 'Foto Advies',
    'chat-coach': 'Chat Coach',
    'gesprek-starter': 'Gesprek Starters',
    'date-planner': 'Date Planner',
    'online-cursus': 'Online Cursussen',
    'platform-match': 'AI Platform Match',
    'openingszinnen-generator': 'AI Openingszinnen Generator',
    'ijsbreker-generator': 'AI IJsbreker Generator',
    'veiligheidscheck': 'AI Veiligheidscheck'
  };

  return displayNames[toolName] || toolName;
}
