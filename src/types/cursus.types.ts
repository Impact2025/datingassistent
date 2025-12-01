// ============================================================================
// DATINGASSISTENT - CURSUS SYSTEEM TYPES
// 
// TypeScript interfaces voor het cursus systeem
// Gebruik in je Next.js app
// ============================================================================

// =============================================================================
// CURSUS TYPES
// =============================================================================

export interface Cursus {
  id: number;
  slug: string;
  titel: string;
  subtitel?: string;
  cursus_type: 'gratis' | 'starter' | 'groeier' | 'expert' | 'vip';
  prijs: number;
  beschrijving?: string;
  beschrijving_lang?: string;
  doelen?: string[];
  duur_minuten?: number;
  niveau: 'beginner' | 'intermediate' | 'advanced';
  thumbnail_url?: string;
  video_intro_url?: string;
  vereiste_cursussen?: string[];
  gekoppelde_tools?: string[];
  upsell_cursus_slug?: string;
  upsell_tekst?: string;
  status: 'draft' | 'published' | 'archived';
  gepubliceerd_op?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  lessen?: CursusLes[];
}

export interface CursusLes {
  id: number;
  cursus_id: number;
  slug: string;
  titel: string;
  volgorde: number;
  beschrijving?: string;
  duur_minuten?: number;
  video_url?: string;
  video_duur?: string;
  video_thumbnail_url?: string;
  ai_coach_actief: boolean;
  ai_coach_context?: string;
  ai_coach_suggesties?: string[];
  volgende_les_id?: number;
  volgende_stap_type?: 'les' | 'tool' | 'cursus';
  volgende_stap_tekst?: string;
  status: 'draft' | 'published';
  created_at: Date;
  updated_at: Date;
  
  // Relations
  secties?: CursusSectie[];
}

export interface CursusSectie {
  id: number;
  les_id: number;
  slug: string;
  sectie_type: SectieType;
  titel?: string;
  inhoud: SectieInhoud;
  volgorde: number;
  toon_na_sectie_id?: number;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  quiz_vragen?: QuizVraag[];
}

export type SectieType =
  | 'video'
  | 'tekst'
  | 'kernpunten'
  | 'quiz'
  | 'reflectie'
  | 'opdracht'
  | 'tool'
  | 'tip'
  | 'actieplan';

// Type-specific inhoud interfaces
export type SectieInhoud = 
  | VideoInhoud
  | TekstInhoud
  | KernpuntenInhoud
  | QuizInhoud
  | ReflectieInhoud
  | OpdrachtInhoud
  | ToolInhoud
  | TipInhoud;

export interface VideoInhoud {
  introTekst?: string;
}

export interface TekstInhoud {
  body: string;
  format?: 'plain' | 'markdown' | 'html';
}

export interface KernpuntenInhoud {
  punten: {
    icon: string;
    titel: string;
    beschrijving: string;
  }[];
}

export interface QuizInhoud {
  succesMessage: string;
  minimumScore: number;
}

export interface ReflectieInhoud {
  vragen: string[];
  aiAnalyse: boolean;
}

export interface OpdrachtInhoud {
  stappen: string[];
  tijdsduur?: string;
  benodigdheden?: string[];
  uploadMogelijk?: boolean;
}

export interface ToolInhoud {
  toolId: string;
  introTekst?: string;
  ctaTekst: string;
}

export interface TipInhoud {
  tekst: string;
}

// Quiz types
export interface QuizVraag {
  id: number;
  sectie_id: number;
  vraag: string;
  vraag_type: 'multiple-choice' | 'true-false' | 'image-choice';
  opties: QuizOptie[];
  uitleg_correct?: string;
  uitleg_incorrect?: string;
  volgorde: number;
  created_at: Date;
}

export interface QuizOptie {
  id: string;
  tekst: string;
  correct: boolean;
  afbeelding?: string;
}


// =============================================================================
// IRIS AI COACH TYPES
// =============================================================================

export interface IrisUserContext {
  id: number;
  user_id: number;
  
  // Basis profiel
  dating_doel?: string;
  hechtingsstijl?: string;
  hechtingsstijl_details?: HechtingsstijlDetails;
  
  // Persoonlijkheid
  kernkwaliteiten?: string[];
  werkpunten?: string[];
  triggers?: string[];
  
  // Dating context
  actieve_platforms?: string[];
  dating_ervaring?: 'nieuw' | 'enige ervaring' | 'ervaren';
  
  // Cursus voortgang
  voltooide_cursussen?: string[];
  huidige_cursus_slug?: string;
  huidige_les_slug?: string;
  
  // Performance
  quiz_scores?: Record<string, Record<string, number>>;
  
  // Inzichten
  reflectie_inzichten?: string[];
  laatste_interactie_samenvatting?: string;
  
  // Stemming
  recente_stemming?: 'positief' | 'neutraal' | 'gefrustreerd' | 'bezorgd' | 'gemotiveerd';
  
  laatste_activiteit?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface HechtingsstijlDetails {
  primair: string;
  secundair?: string;
  score_angstig?: number;
  score_vermijdend?: number;
}

export interface IrisConversationMemory {
  id: number;
  user_id: number;
  context_type: 'cursus' | 'tool' | 'general';
  context_cursus_slug?: string;
  context_les_slug?: string;
  context_tool_id?: string;
  user_message: string;
  iris_response: string;
  belangrijke_info_extracted?: Record<string, any>;
  sentiment?: 'positief' | 'neutraal' | 'negatief' | 'bezorgd';
  created_at: Date;
}


// =============================================================================
// USER PROGRESS TYPES
// =============================================================================

export interface CursusVoortgang {
  id: number;
  user_id: number;
  module_slug: string;      // cursus slug
  les_slug: string;
  completed_exercises: number;
  total_exercises: number;
  completion_percentage: number;
  status: 'niet_gestart' | 'bezig' | 'afgerond';
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface QuizAntwoord {
  id: number;
  user_id: number;
  vraag_id: number;
  gekozen_optie_id: string;
  is_correct: boolean;
  tijd_seconden?: number;
  poging_nummer: number;
  beantwoord_op: Date;
}

export interface ReflectieAntwoord {
  id: number;
  user_id: number;
  sectie_id: number;
  vraag_index: number;
  antwoord_tekst: string;
  ai_analyse?: string;
  ai_inzicht_voor_context?: string;
  beantwoord_op: Date;
  updated_at: Date;
}


// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface CursusWithProgress extends Cursus {
  user_progress?: {
    voltooide_lessen: number;
    totaal_lessen: number;
    percentage: number;
    laatste_les_slug?: string;
  };
}

export interface LesWithProgress extends CursusLes {
  user_progress?: {
    status: 'niet_gestart' | 'bezig' | 'afgerond';
    completed_exercises: number;
    total_exercises: number;
  };
  quiz_scores?: Record<number, QuizAntwoord>;
  reflectie_antwoorden?: Record<number, ReflectieAntwoord>;
}

// Iris context voor API calls
export interface IrisContextForPrompt {
  user: {
    dating_doel?: string;
    hechtingsstijl?: string;
    kernkwaliteiten?: string[];
    werkpunten?: string[];
    actieve_platforms?: string[];
    recente_stemming?: string;
  };
  cursus: {
    huidige_cursus: string;
    huidige_les: string;
    les_context: string;          // ai_coach_context uit cursus_lessen
    voltooide_cursussen: string[];
  };
  performance: {
    quiz_scores: Record<string, Record<string, number>>;
    reflectie_inzichten: string[];
  };
  recente_gesprekken: {
    message: string;
    response: string;
    sentiment: string;
    created_at: Date;
  }[];
}
