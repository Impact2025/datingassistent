export interface IntakeData {
  tijdSindsScheiding: string;
  relatieduur: string;
  kinderen: string;
}

export interface Scores {
  overallScore: number;
  profiel: 'heler' | 'waker' | 'starter' | 'bloeier';
  emotioneleVerwerking: number;
  identiteitskracht: number;
  datingMindset: number;
  praktischeStabiliteit: number;
  externeBevestiging: number;
  reboundRisk: number;
  reboundNiveau: 'laag' | 'gemiddeld' | 'hoog';
}

export interface AiAnalysis {
  profielTitel: string;
  profielOmschrijving: string;
  watGaedGaat: string[];
  aandachtspunten: string[];
  actieplan: {
    week1: string[];
    maand1: string[];
    maand3: string[];
  };
  datinTip: string;
  reboundAlerts: string[];
}

export interface ScanResult {
  scores: Scores;
  aiAnalysis: AiAnalysis | null;
}
