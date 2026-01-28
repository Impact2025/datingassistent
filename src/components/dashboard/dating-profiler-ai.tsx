'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Heart,
  Copy,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Target,
  Palette,
  Zap
} from 'lucide-react';
import { useToolCompletion } from '@/hooks/use-tool-completion';

interface ProfileData {
  datingApp: string;
  goal: string;
  personalDetails: string[];
  partnerPreferences: string[];
  style: string;
}

interface GeneratedProfile {
  id: string;
  title: string;
  content: string;
  characterCount: number;
}

const DATING_APPS = [
  { id: 'tinder', name: 'Tinder', icon: 'Tinder' },
  { id: 'bumble', name: 'Bumble', icon: 'Bumble' },
  { id: 'hinge', name: 'Hinge', icon: 'Hinge' },
  { id: 'happn', name: 'Happn', icon: 'Happn' },
  { id: 'other', name: 'Anders', icon: 'Anders' }
];

const GOALS = [
  { id: 'serious', name: 'Serieuze relatie', icon: 'Serieuze relatie' },
  { id: 'casual', name: 'Casual daten', icon: 'Casual daten' },
  { id: 'friendship', name: 'Vriendschap', icon: 'Vriendschap' },
  { id: 'open', name: 'Open voor alles', icon: 'Open voor alles' }
];

const STYLES = [
  {
    id: 'humorous',
    name: 'Vlot & Humoristisch',
    description: 'Luchtige toon met geestige zinnen. Perfect voor Tinder.',
    icon: 'Vlot & Humoristisch'
  },
  {
    id: 'authentic',
    name: 'Diepgaand & Authentiek',
    description: 'Emotionele diepgang en echte verhalen. Perfect voor Hinge.',
    icon: 'Diepgaand & Authentiek'
  },
  {
    id: 'minimalist',
    name: 'Minimalistisch & Intrigerend',
    description: 'Korte, krachtige zinnen die nieuwsgierigheid opwekken.',
    icon: 'Minimalistisch & Intrigerend'
  }
];

export function DatingProfilerAI() {
  const { userProfile, user } = useUser();
  const { markAsCompleted } = useToolCompletion('dating-profiler-ai');
  const [step, setStep] = useState<'input' | 'generating' | 'results'>('input');
  const [profileData, setProfileData] = useState<ProfileData>({
    datingApp: '',
    goal: userProfile?.seekingType || '',
    personalDetails: [],
    partnerPreferences: [],
    style: ''
  });
  const [personalDetailInput, setPersonalDetailInput] = useState('');
  const [partnerPreferenceInput, setPartnerPreferenceInput] = useState('');
  const [generatedProfiles, setGeneratedProfiles] = useState<GeneratedProfile[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pre-fill with user profile data
  useEffect(() => {
    if (userProfile) {
      setProfileData(prev => ({
        ...prev,
        goal: userProfile.seekingType || prev.goal
      }));
    }
  }, [userProfile]);

  const handleAddPersonalDetail = () => {
    if (personalDetailInput.trim() && profileData.personalDetails.length < 8) {
      setProfileData(prev => ({
        ...prev,
        personalDetails: [...prev.personalDetails, personalDetailInput.trim()]
      }));
      setPersonalDetailInput('');
    }
  };

  const handleRemovePersonalDetail = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      personalDetails: prev.personalDetails.filter((_, i) => i !== index)
    }));
  };

  const handleAddPartnerPreference = () => {
    if (partnerPreferenceInput.trim() && profileData.partnerPreferences.length < 6) {
      setProfileData(prev => ({
        ...prev,
        partnerPreferences: [...prev.partnerPreferences, partnerPreferenceInput.trim()]
      }));
      setPartnerPreferenceInput('');
    }
  };

  const handleRemovePartnerPreference = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      partnerPreferences: prev.partnerPreferences.filter((_, i) => i !== index)
    }));
  };

  const generateProfiles = async () => {
    setStep('generating');

    // Track completion
    await markAsCompleted('profile_generated', {
      app: profileData.datingApp,
      style: profileData.style,
      personal_details_count: profileData.personalDetails.length
    });

    try {
      // Generate 3 profiles using OpenAI API - all in the selected style
      const profilePromises = [
        generateProfileWithAI(profileData, profileData.style, 1),
        generateProfileWithAI(profileData, profileData.style, 2),
        generateProfileWithAI(profileData, profileData.style, 3),
      ];

      const profiles = await Promise.all(profilePromises);
      setGeneratedProfiles(profiles);
      setStep('results');
    } catch (error) {
      console.error('Error generating profiles:', error);
      // Fallback to local generation if API fails
      const profiles = generateProfileVariations(profileData);
      setGeneratedProfiles(profiles);
      setStep('results');
    }
  };

  const generateProfileWithAI = async (data: ProfileData, style: string, variation: number): Promise<GeneratedProfile> => {
    try {
      const response = await fetch('/api/dating-profiler/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileData: data,
          style: style,
          variation: variation
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();

      return {
        id: `${style}-${variation}`,
        title: getProfileTitle(style, variation),
        content: result.profile,
        characterCount: result.characterCount
      };
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      // Fallback to local generation
      return generateFallbackProfile(data, style, variation);
    }
  };

  const getProfileTitle = (style: string, variation: number): string => {
    const titles = {
      humorous: ['Speels & Aantrekkelijk', 'Lichtvoetig & Grappig', 'Vrijpostig & Leuk'],
      authentic: ['Diepgaand & Echt', 'Authentiek & Betekenisvol', 'Persoonlijk & Uniek'],
      minimalist: ['Mysterieus & Intrigerend', 'Cryptisch & Uitdagend', 'Subtiel & Aantrekkelijk']
    };

    return titles[style as keyof typeof titles]?.[variation - 1] || 'Profiel Optie';
  };

  const generateFallbackProfile = (data: ProfileData, style: string, variation: number): GeneratedProfile => {
    // Use the existing local generation as fallback
    const profiles = generateProfileVariations(data);
    const profileIndex = (variation - 1) % 3;
    return profiles[profileIndex];
  };

  const generateProfileVariations = (data: ProfileData): GeneratedProfile[] => {
    const profiles: GeneratedProfile[] = [];

    // Generate 3 different variations based on style
    if (data.style === 'humorous') {
      profiles.push(
        {
          id: 'humorous-1',
          title: '🎭 Speels & Aantrekkelijk',
          content: generateHumorousProfile(data),
          characterCount: 0
        },
        {
          id: 'humorous-2',
          title: '😄 Lichtvoetig & Grappig',
          content: generateHumorousProfile2(data),
          characterCount: 0
        },
        {
          id: 'humorous-3',
          title: '🎪 Vrijpostig & Leuk',
          content: generateHumorousProfile3(data),
          characterCount: 0
        }
      );
    } else if (data.style === 'authentic') {
      profiles.push(
        {
          id: 'authentic-1',
          title: '💭 Diepgaand & Echt',
          content: generateAuthenticProfile(data),
          characterCount: 0
        },
        {
          id: 'authentic-2',
          title: '🌟 Authentiek & Betekenisvol',
          content: generateAuthenticProfile2(data),
          characterCount: 0
        },
        {
          id: 'authentic-3',
          title: '💫 Persoonlijk & Uniek',
          content: generateAuthenticProfile3(data),
          characterCount: 0
        }
      );
    } else if (data.style === 'minimalist') {
      profiles.push(
        {
          id: 'minimalist-1',
          title: '✨ Mysterieus & Intrigerend',
          content: generateMinimalistProfile(data),
          characterCount: 0
        },
        {
          id: 'minimalist-2',
          title: '🔮 Cryptisch & Uitdagend',
          content: generateMinimalistProfile2(data),
          characterCount: 0
        },
        {
          id: 'minimalist-3',
          title: '🌙 Subtiel & Aantrekkelijk',
          content: generateMinimalistProfile3(data),
          characterCount: 0
        }
      );
    }

    // Calculate character counts
    profiles.forEach(profile => {
      profile.characterCount = profile.content.length;
    });

    return profiles;
  };

  const generateHumorousProfile = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 5);
    const preferences = data.partnerPreferences.slice(0, 3);

    let profile = '';

    // Opening with personality
    if (details[0]) {
      profile += `${details[0]} met een passie voor ${details[1] || 'avontuur'}. `;
    }

    // Add humor and specific details
    profile += `Ik geloof dat ${details[2] || 'pizza'} het antwoord is op de meeste levensvragen, en mijn ${details[3] || 'weekenden'} bestaan uit ${details[4] || 'creatieve chaos'}. `;

    // Dating approach
    profile += `In dating ben ik op zoek naar iemand die mijn ${preferences[0] || 'energie'} kan bijbenen en ${preferences[1] || 'van een goed gesprek houdt'}. `;

    // Goal-specific ending
    if (data.goal === 'serious') {
      profile += `Laten we samen ${preferences[2] || 'herinneringen maken'} die een leven lang meegaan. `;
    } else {
      profile += `Wie weet wat voor ${preferences[2] || 'avonturen'} we samen kunnen beleven! `;
    }

    // Call to action
    profile += `Wat is jouw meest memorabele ${details[1] || 'ervaring'} geweest?`;

    return profile;
  };

  const generateHumorousProfile2 = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 5);
    const preferences = data.partnerPreferences.slice(0, 3);

    let profile = '';

    // Opening with humor
    profile += `Officieel gecertificeerd ${details[0] || 'avonturier'} met een doctoraat in ${details[1] || 'onverwachte avonturen'}. `;

    // Add personality details
    profile += `Mijn ${details[2] || 'weekenden'} bestaan uit ${details[3] || 'creatieve chaos'} en ik geloof dat ${details[4] || 'een goede grap'} de beste manier is om iemands dag te verbeteren. `;

    // Dating preferences with humor
    profile += `In dating zoek ik iemand die mijn ${preferences[0] || 'absurde humor'} begrijpt en ${preferences[1] || 'van spontane plannen houdt'}. `;

    // Goal-specific content
    if (data.goal === 'serious') {
      profile += `Laten we samen een leven vol ${preferences[2] || 'lachen en liefde'} opbouwen. `;
    } else {
      profile += `Wie weet wat voor ${preferences[2] || 'gekke avonturen'} we samen kunnen beleven! `;
    }

    // Engaging question
    profile += `Wat is het meest bizarre talent dat je hebt?`;

    return profile;
  };

  const generateHumorousProfile3 = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 5);
    const preferences = data.partnerPreferences.slice(0, 3);

    let profile = '';

    // Creative opening
    profile += `${details[0] || 'Creatieve ziel'} die ${details[1] || 'kunst maakt van het alledaagse leven'}. `;

    // Add specific details
    profile += `Van ${details[2] || 'ochtend yoga'} tot ${details[3] || 'avondlijke dansfeestjes'}, ik vind altijd een manier om ${details[4] || 'plezier te hebben'}. `;

    // Dating approach
    profile += `Zoek een ${preferences[0] || 'avontuurlijke geest'} die ${preferences[1] || 'van spontane uitstapjes houdt'} en niet bang is voor ${preferences[2] || 'een beetje chaos'}. `;

    // Goal-specific ending
    if (data.goal === 'serious') {
      profile += `Samen kunnen we een leven vol ${preferences[2] || 'creativiteit en liefde'} creëren. `;
    } else {
      profile += `Laten we het leven vieren met ${preferences[2] || 'onvergetelijke momenten'}! `;
    }

    // Fun question
    profile += `Wat is je meest creatieve manier om een slechte dag om te buigen?`;

    return profile;
  };

  const generateAuthenticProfile = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 5);
    const preferences = data.partnerPreferences.slice(0, 3);

    let profile = '';

    // Deep opening
    profile += `Ik ben iemand die ${details[0] || 'gelooft in de kracht van echte connecties'} en ${details[1] || 'waarde hecht aan kwaliteit boven kwantiteit in relaties'}. `;

    // Personal growth and experiences
    profile += `Door mijn ${details[2] || 'levenservaringen'} heb ik geleerd dat ${details[3] || 'authenticiteit'} de basis is van alles wat betekenisvol is. `;

    // Current passions
    profile += `Tegenwoordig vind ik ${details[4] || 'voldoening'} in de kleine dingen des levens en het opbouwen van diepgaande relaties. `;

    // Dating approach
    profile += `In dating zoek ik iemand die ${preferences[0] || 'openhartig en eerlijk is'} en ${preferences[1] || 'betekenisvolle gesprekken waardeert boven oppervlakkige praatjes'}. `;

    // Shared future
    if (data.goal === 'serious') {
      profile += `Samen kunnen we ${preferences[2] || 'een leven opbouwen gebaseerd op vertrouwen, respect en gedeelde waarden'}. `;
    } else {
      profile += `Samen kunnen we ${preferences[2] || 'genieten van elkaars gezelschap en mooie momenten delen'}. `;
    }

    // Thoughtful question
    profile += `Wat is een waarde die voor jou heel belangrijk is in het leven?`;

    return profile;
  };

  const generateAuthenticProfile2 = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 5);
    const preferences = data.partnerPreferences.slice(0, 3);

    let profile = '';

    // Meaningful life focus
    profile += `Mijn leven draait om ${details[0] || 'betekenisvolle ervaringen opdoen'} en ${details[1] || 'echte, diepgaande relaties opbouwen met mensen die ertoe doen'}. `;

    // Personal growth
    profile += `Door ${details[2] || 'mijn ervaringen'} heb ik geleerd dat ${details[3] || 'kwetsbaarheid'} de sterkste vorm van moed is en dat ${details[4] || 'authenticiteit'} de basis vormt van alles wat waardevol is. `;

    // Dating philosophy
    profile += `In dating geloof ik in het langzaam opbouwen van iets moois. Ik zoek iemand die ${preferences[0] || 'helemaal zichzelf durft te zijn'} en ${preferences[1] || 'open staat voor persoonlijke groei en ontwikkeling'}. `;

    // Shared vision
    if (data.goal === 'serious') {
      profile += `Samen kunnen we ${preferences[2] || 'een toekomst creëren vol liefde, respect en gedeelde dromen'}. `;
    } else {
      profile += `Samen kunnen we ${preferences[2] || 'elke dag koesteren en mooie herinneringen maken'}. `;
    }

    // Reflective question
    profile += `Wat is een waarde die voor jou centraal staat in het leven?`;

    return profile;
  };

  const generateAuthenticProfile3 = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 5);
    const preferences = data.partnerPreferences.slice(0, 3);

    let profile = '';

    // Connection philosophy
    profile += `Ik geloof sterk in ${details[0] || 'de kracht van echte verbinding'} en ${details[1] || 'de schoonheid van eenvoud in relaties'}. `;

    // Life lessons
    profile += `${details[2] || 'Mijn ervaringen'} hebben me geleerd dat ${details[3] || 'liefde begint met vriendschap'} en dat ${details[4] || 'betrouwbaarheid'} de fundering is van iets langdurigs. `;

    // Relationship approach
    profile += `Ik bouw mijn relaties op met ${preferences[0] || 'oprechtheid'} en geef om mensen die ${preferences[1] || 'van diepgaande gesprekken houden'} en ${preferences[2] || 'betekenisvolle connecties willen opbouwen'}. `;

    // Future together
    if (data.goal === 'serious') {
      profile += `Samen kunnen we ${preferences[2] || 'een leven vol liefde, respect en wederzijdse ondersteuning opbouwen'}. `;
    } else {
      profile += `Samen kunnen we ${preferences[2] || 'genieten van authentieke momenten en elkaar ondersteunen in onze groei'}. `;
    }

    // Meaningful question
    profile += `Wat is iets wat je altijd al wilde leren of ervaren in het leven?`;

    return profile;
  };

  const generateMinimalistProfile = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 3);
    const preferences = data.partnerPreferences.slice(0, 2);

    let profile = '';

    // First line - core identity
    profile += `${details[0] || 'Zoeker van betekenis'}.\n`;

    // Second line - philosophy
    profile += `${details[1] || 'Gelooft in magie van kleine dingen'}.\n`;

    // Third line - what they value
    profile += `${details[2] || 'Waardeert oprechtheid boven perfectie'}.\n\n`;

    // Dating approach
    profile += `Zoekt ${preferences[0] || 'gelijkwaardige connectie'}.\n`;

    // Goal-specific addition
    if (data.goal === 'serious') {
      profile += `Klaar voor ${preferences[1] || 'diepe verbinding'}.\n`;
    } else {
      profile += `Open voor ${preferences[1] || 'mooie ervaringen'}.\n`;
    }

    // Intriguing question
    profile += `\nWat maakt jou gelukkig?`;

    return profile;
  };

  const generateMinimalistProfile2 = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 3);
    const preferences = data.partnerPreferences.slice(0, 2);

    let profile = '';

    // Living philosophy
    profile += `Levend voor ${details[0] || 'momenten die tellen'}.\n`;

    // Core value
    profile += `${details[1] || 'Waardeert authenticiteit boven perfectie'}.\n`;

    // Personal approach
    profile += `${details[2] || 'Ziet schoonheid in imperfectie'}.\n\n`;

    // What they're seeking
    profile += `Op zoek naar ${preferences[0] || 'iemand die durft te voelen'}.\n`;

    // Deeper connection
    if (data.goal === 'serious') {
      profile += `Klaar voor ${preferences[1] || 'echte verbondenheid'}.\n`;
    } else {
      profile += `Geniet van ${preferences[1] || 'spontane avonturen'}.\n`;
    }

    // Thought-provoking question
    profile += `\nWat is je definitie van vrijheid?`;

    return profile;
  };

  const generateMinimalistProfile3 = (data: ProfileData): string => {
    const details = data.personalDetails.slice(0, 3);
    const preferences = data.partnerPreferences.slice(0, 2);

    let profile = '';

    // Builder of experiences
    profile += `${details[0] || 'Bouwer van herinneringen'}.\n`;

    // Appreciation for imperfection
    profile += `${details[1] || 'Ziet schoonheid in imperfectie'}.\n`;

    // Personal philosophy
    profile += `${details[2] || 'Gelooft in kracht van kwetsbaarheid'}.\n\n`;

    // Soul connection
    profile += `Zoekt ${preferences[0] || 'ziel die resoneert'}.\n`;

    // Relationship goal
    if (data.goal === 'serious') {
      profile += `Klaar voor ${preferences[1] || 'leven vol betekenis'}.\n`;
    } else {
      profile += `Open voor ${preferences[1] || 'nieuwe ervaringen'}.\n`;
    }

    // Engaging question
    profile += `\nWat is je favoriete manier om de tijd door te brengen?`;

    return profile;
  };

  const handleCopy = async (profileId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(profileId);

      // Track copy action
      await markAsCompleted('profile_copied', {
        profile_id: profileId,
        style: profileData.style
      });

      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const canProceed = () => {
    return profileData.datingApp &&
           profileData.goal &&
           profileData.personalDetails.length >= 3 &&
           profileData.partnerPreferences.length >= 1 &&
           profileData.style;
  };

  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">AI Profiler aan het werk...</h3>
            <p className="text-gray-600">
              Je persoonlijke dating profielen worden gegenereerd
            </p>
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-coral-50 to-coral-100 border-coral-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-coral-900">
              <Sparkles className="w-6 h-6" />
              Jouw Dating Profielen - Klaar!
            </CardTitle>
            <p className="text-coral-700">
              Hier zijn 3 unieke profiel opties gebaseerd op je antwoorden
            </p>
          </CardHeader>
        </Card>

        {/* User Input Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Jouw Input Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Platform:</strong> {DATING_APPS.find(app => app.id === profileData.datingApp)?.name}
              </div>
              <div>
                <strong>Doel:</strong> {GOALS.find(goal => goal.id === profileData.goal)?.name}
              </div>
              <div>
                <strong>Stijl:</strong> {STYLES.find(style => style.id === profileData.style)?.name}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Profiles */}
        <div className="grid grid-cols-1 gap-6">
          {generatedProfiles.map((profile) => (
            <Card key={profile.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{profile.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {profile.characterCount} tekens
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(profile.id, profile.content)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className={`w-4 h-4 ${copiedId === profile.id ? 'text-green-600' : ''}`} />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg relative">
                  {copiedId === profile.id && (
                    <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      ✓ Gekopieerd!
                    </div>
                  )}
                  <p className="text-sm text-gray-800 whitespace-pre-line">
                    {profile.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Promotion */}
        <Card className="bg-gradient-to-r from-purple-50 to-coral-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Wil je echt een top profiel?
            </h3>
            <p className="text-purple-700 mb-4">
              Volg dan onze cursus "Een profieltekst die wél werkt" voor bewezen technieken en voorbeelden.
            </p>
            <Link href="/dashboard/starter/starter-5">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                Start de cursus →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              setStep('input');
              setGeneratedProfiles([]);
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nieuwe Profielen Maken
          </Button>
          <Button className="bg-coral-500 hover:bg-coral-600">
            <Heart className="w-4 h-4 mr-2" />
            Naar Chat Coach
          </Button>
        </div>
      </div>
    );
  }

  // Input step
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-coral-50 to-coral-100 border-coral-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-coral-900">
            <Sparkles className="w-6 h-6" />
            Dating Profiler AI
          </CardTitle>
          <p className="text-coral-700">
            Laat onze AI een pakkend dating profiel voor je schrijven!
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Dating App Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Voor welke app?
              </CardTitle>
              <p className="text-sm text-gray-600">
                Twijfel je welke app bij jou past? Gebruik onze AI tool Platform Match
              </p>
            </CardHeader>
            <CardContent>
              <Select
                value={profileData.datingApp}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, datingApp: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer dating app" />
                </SelectTrigger>
                <SelectContent>
                  {DATING_APPS.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Goal Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Wat is je doel?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={profileData.goal}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, goal: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer je doel" />
                </SelectTrigger>
                <SelectContent>
                  {GOALS.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Essentiële details over jou
              </CardTitle>
              <p className="text-sm text-gray-600">
                Minimaal 3 details - wees specifiek! ({profileData.personalDetails.length}/8)
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={personalDetailInput}
                  onChange={(e) => setPersonalDetailInput(e.target.value)}
                  placeholder="Bijv: 'Ik bak zuurdesembrood op zondag'"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPersonalDetail()}
                />
                <Button
                  onClick={handleAddPersonalDetail}
                  disabled={!personalDetailInput.trim() || profileData.personalDetails.length >= 8}
                  size="sm"
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.personalDetails.map((detail, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemovePersonalDetail(index)}
                  >
                    {detail} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Partner Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Wat zoek je in een match?
              </CardTitle>
              <p className="text-sm text-gray-600">
                Minimaal 1 kenmerk ({profileData.partnerPreferences.length}/6)
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={partnerPreferenceInput}
                  onChange={(e) => setPartnerPreferenceInput(e.target.value)}
                  placeholder="Bijv: 'Iemand met droge humor'"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPartnerPreference()}
                />
                <Button
                  onClick={handleAddPartnerPreference}
                  disabled={!partnerPreferenceInput.trim() || profileData.partnerPreferences.length >= 6}
                  size="sm"
                >
                  +
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.partnerPreferences.map((pref, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemovePartnerPreference(index)}
                  >
                    {pref} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Profiel stijl
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {STYLES.map((style) => (
                  <div
                    key={style.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      profileData.style === style.id
                        ? 'border-coral-500 bg-coral-50'
                        : 'border-gray-200 hover:border-coral-300'
                    }`}
                    onClick={() => setProfileData(prev => ({ ...prev, style: style.id }))}
                  >
                    <div className="flex items-start gap-3">
                      <div>
                        <h4 className="font-semibold">{style.name}</h4>
                        <p className="text-sm text-gray-600">{style.description}</p>
                      </div>
                      {profileData.style === style.id && (
                        <CheckCircle className="w-5 h-5 text-coral-500 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateProfiles}
            disabled={!canProceed()}
            className="w-full bg-coral-500 hover:bg-coral-600"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Genereer Mijn Profielen
          </Button>
        </div>

        {/* Right Column - Progress & Tips */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voortgang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dating App</span>
                  <span>{profileData.datingApp ? '✓' : '○'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Doel</span>
                  <span>{profileData.goal ? '✓' : '○'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Persoonlijke Details</span>
                  <span>{profileData.personalDetails.length >= 3 ? '✓' : `${profileData.personalDetails.length}/3`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Partner Voorkeuren</span>
                  <span>{profileData.partnerPreferences.length >= 1 ? '✓' : `${profileData.partnerPreferences.length}/1`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Profiel Stijl</span>
                  <span>{profileData.style ? '✓' : '○'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Tips voor geweldige profielen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-800">
              <p>• <strong>Wees specifiek:</strong> "Ik bak brood" i.p.v. "Ik kook"</p>
              <p>• <strong>Toon persoonlijkheid:</strong> Deel verhalen, niet alleen feiten</p>
              <p>• <strong>Stel vragen:</strong> Eindig met een vraag om gesprekken te starten</p>
              <p>• <strong>Wees authentiek:</strong> Blijf trouw aan jezelf</p>
              <p>• <strong>Houd het leuk:</strong> Humor en positiviteit trekken aan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}