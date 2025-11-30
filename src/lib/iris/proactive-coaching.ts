// ============================================================================
// IRIS PROACTIVE COACHING SYSTEM
//
// 🚀 WERELDKLASSE: Intelligente, proactieve coaching suggesties
// Analyseert user context en geeft automatisch relevante tips en aanbevelingen
// ============================================================================

import { AIContextManager } from '../ai-context-manager';
import type { UserAIContext } from '../ai-context-manager';

export interface CoachingSuggestion {
  id: string;
  type: 'tool' | 'course' | 'action' | 'insight' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionText: string;
  actionUrl?: string;
  reason: string;  // Waarom deze suggestie relevant is
  emoji: string;
}

export interface AssessmentGap {
  assessmentId: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  emoji: string;
  url: string;
}

/**
 * 🚀 Genereer proactieve coaching suggesties op basis van user context
 */
export async function generateProactiveSuggestions(userId: number): Promise<CoachingSuggestion[]> {
  const context = await AIContextManager.getUserContext(userId);
  if (!context) return [];

  const suggestions: CoachingSuggestion[] = [];

  // 1. Check voor assessment gaps
  const gaps = identifyAssessmentGaps(context);
  gaps.forEach(gap => {
    if (gap.priority === 'high') {
      suggestions.push({
        id: `gap-${gap.assessmentId}`,
        type: 'tool',
        priority: 'high',
        title: `Doe de ${gap.name}`,
        description: gap.description,
        actionText: 'Start Assessment',
        actionUrl: gap.url,
        reason: 'Deze assessment helpt je dating strategie te verbeteren',
        emoji: gap.emoji,
      });
    }
  });

  // 2. Check emotionele readiness warnings
  if (context.emotioneelReadiness) {
    if (context.emotioneelReadiness.reboundRisico > 70) {
      suggestions.push({
        id: 'rebound-warning',
        type: 'warning',
        priority: 'high',
        title: 'Hoog Rebound Risico',
        description: `Je rebound risico is ${context.emotioneelReadiness.reboundRisico}%. Neem de tijd om te helen voordat je actief gaat daten.`,
        actionText: 'Bekijk Healing Tips',
        reason: 'Dating te snel na een relatie kan leiden tot pijnlijke patronen',
        emoji: '⚠️',
      });
    } else if (context.emotioneelReadiness.readinessScore < 5) {
      suggestions.push({
        id: 'not-ready-insight',
        type: 'insight',
        priority: 'medium',
        title: 'Werk aan je Emotionele Readiness',
        description: 'Je readiness score is nog laag. Focus eerst op jezelf voordat je actief gaat daten.',
        actionText: 'Bekijk Tips',
        reason: 'Emotionele readiness is cruciaal voor gezonde dating',
        emoji: '💙',
      });
    }
  }

  // 3. Hechtingsstijl based suggestions
  if (context.attachmentStyle) {
    if (context.attachmentStyle.primaryStyle === 'anxious') {
      suggestions.push({
        id: 'anxious-attachment-tip',
        type: 'insight',
        priority: 'medium',
        title: 'Angstige Hechtingsstijl Tips',
        description: 'Met je angstige hechtingsstijl is het belangrijk om te werken aan zelfvertrouwen en boundaries.',
        actionText: 'Lees Meer',
        actionUrl: '/hechtingsstijl',
        reason: 'Begrip van je hechtingsstijl helpt betere relaties opbouwen',
        emoji: '🔥',
      });
    }

    if (context.attachmentStyle.primaryStyle === 'avoidant') {
      suggestions.push({
        id: 'avoidant-attachment-tip',
        type: 'insight',
        priority: 'medium',
        title: 'Vermijdende Hechtingsstijl Tips',
        description: 'Leer om intimiteit toe te laten zonder je onafhankelijkheid te verliezen.',
        actionText: 'Lees Meer',
        actionUrl: '/hechtingsstijl',
        reason: 'Bewustzijn van vermijdend gedrag voorkomt dating patronen',
        emoji: '🛡️',
      });
    }
  }

  // 4. Dating Style blind spots
  if (context.datingStyle?.blindSpots && context.datingStyle.blindSpots.length > 0) {
    suggestions.push({
      id: 'blind-spots-insight',
      type: 'insight',
      priority: 'high',
      title: 'Let op je Blinde Vlekken',
      description: `Je hebt ${context.datingStyle.blindSpots.length} blinde vlekken: ${context.datingStyle.blindSpots.slice(0, 2).join(', ')}`,
      actionText: 'Bekijk Alle Blinde Vlekken',
      actionUrl: '/dating-stijl-scan',
      reason: 'Blinde vlekken kunnen je dating succes belemmeren',
      emoji: '👁️',
    });
  }

  // 5. Waarden Kompas - red flags awareness
  if (context.waardenKompas?.redFlags && context.waardenKompas.redFlags.length > 0) {
    suggestions.push({
      id: 'red-flags-reminder',
      type: 'insight',
      priority: 'medium',
      title: 'Blijf Alert op je Red Flags',
      description: `Jouw belangrijkste red flags: ${context.waardenKompas.redFlags.slice(0, 2).join(', ')}`,
      actionText: 'Review Red Flags',
      reason: 'Red flags herkennen voorkomt tijdverspilling en pijn',
      emoji: '🚩',
    });
  }

  // 6. Profile optimization suggestions
  if (!context.zelfbeeld || context.zelfbeeld.warmteScore < 7) {
    suggestions.push({
      id: 'profile-optimization',
      type: 'tool',
      priority: 'high',
      title: 'Verbeter je Dating Profiel',
      description: 'Je warmte score kan beter. Laat AI je profiel optimaliseren.',
      actionText: 'Start Profiel Coach',
      actionUrl: '/dashboard?tab=profile-suite',
      reason: 'Een sterk profiel trekt betere matches aan',
      emoji: '✨',
    });
  }

  // 7. Course recommendations - check if user has completed any courses
  if (!context.achievements || context.achievements.length === 0) {
    suggestions.push({
      id: 'start-course',
      type: 'course',
      priority: 'medium',
      title: 'Start een Dating Cursus',
      description: 'Verdiep je kennis met onze expertcursussen over dating en relaties.',
      actionText: 'Bekijk Cursussen',
      reason: 'Structured learning accelereert je dating groei',
      emoji: '📚',
    });
  }

  // Sort by priority
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * 🔍 Identificeer welke assessments de gebruiker nog niet heeft gedaan
 */
export function identifyAssessmentGaps(context: UserAIContext | null): AssessmentGap[] {
  if (!context) return getAllAssessments();

  const gaps: AssessmentGap[] = [];

  if (!context.attachmentStyle) {
    gaps.push({
      assessmentId: 'hechtingsstijl',
      name: 'Hechtingsstijl QuickScan',
      description: 'Ontdek hoe je liefhebt en verbindt - de basis van gezonde relaties',
      priority: 'high',
      emoji: '💗',
      url: '/dashboard?tab=profile-suite&tool=hechtingsstijl',
    });
  }

  if (!context.waardenKompas) {
    gaps.push({
      assessmentId: 'waarden-kompas',
      name: 'Waarden Kompas',
      description: 'Ontdek je core waarden, red flags en green flags',
      priority: 'high',
      emoji: '🧭',
      url: '/dashboard?tab=groei-doelen',
    });
  }

  if (!context.emotioneelReadiness) {
    gaps.push({
      assessmentId: 'emotionele-readiness',
      name: 'Emotionele Ready Scan',
      description: 'Ben je klaar voor dating? Ontdek je emotionele beschikbaarheid',
      priority: 'high',
      emoji: '💙',
      url: '/dashboard?tab=profile-suite&tool=emotionele-ready',
    });
  }

  if (!context.datingStyle) {
    gaps.push({
      assessmentId: 'dating-style',
      name: 'Dating Stijl Scan',
      description: 'Ontdek je dating stijl en blinde vlekken',
      priority: 'medium',
      emoji: '🎭',
      url: '/dating-stijl-scan',
    });
  }

  if (!context.levensvisie) {
    gaps.push({
      assessmentId: 'levensvisie',
      name: 'Relatiedoelen Kompas',
      description: 'Definieer wat je echt wilt in een relatie',
      priority: 'medium',
      emoji: '🌟',
      url: '/dashboard?tab=groei-doelen',
    });
  }

  if (!context.relatiepatronen) {
    gaps.push({
      assessmentId: 'relatiepatronen',
      name: 'Relatiepatronen Scan',
      description: 'Begrijp je triggers en coping strategieën',
      priority: 'medium',
      emoji: '🔄',
      url: '/dashboard?tab=groei-doelen',
    });
  }

  if (!context.zelfbeeld) {
    gaps.push({
      assessmentId: 'zelfbeeld',
      name: 'Zelfbeeld & Eerste Indruk',
      description: 'Optimaliseer je dating profiel met AI',
      priority: 'medium',
      emoji: '🪞',
      url: '/dashboard?tab=profile-suite&tool=zelfbeeld',
    });
  }

  return gaps;
}

/**
 * Haal alle assessments op (voor nieuwe users)
 */
function getAllAssessments(): AssessmentGap[] {
  return [
    {
      assessmentId: 'hechtingsstijl',
      name: 'Hechtingsstijl QuickScan',
      description: 'Ontdek hoe je liefhebt en verbindt',
      priority: 'high',
      emoji: '💗',
      url: '/dashboard?tab=profile-suite&tool=hechtingsstijl',
    },
    {
      assessmentId: 'waarden-kompas',
      name: 'Waarden Kompas',
      description: 'Ontdek je core waarden en flags',
      priority: 'high',
      emoji: '🧭',
      url: '/dashboard?tab=groei-doelen',
    },
    {
      assessmentId: 'emotionele-readiness',
      name: 'Emotionele Ready Scan',
      description: 'Ben je klaar voor dating?',
      priority: 'high',
      emoji: '💙',
      url: '/dashboard?tab=profile-suite&tool=emotionele-ready',
    },
  ];
}

/**
 * 🎯 Check of user klaar is voor dating
 */
export function checkDatingReadiness(context: UserAIContext | null): {
  isReady: boolean;
  score: number;
  blockers: string[];
  recommendations: string[];
} {
  if (!context) {
    return {
      isReady: false,
      score: 0,
      blockers: ['Geen assessment data beschikbaar'],
      recommendations: ['Start met de Hechtingsstijl QuickScan'],
    };
  }

  const blockers: string[] = [];
  const recommendations: string[] = [];
  let score = 70;  // Start optimistisch

  // Check emotionele readiness
  if (context.emotioneelReadiness) {
    if (context.emotioneelReadiness.reboundRisico > 70) {
      blockers.push(`Hoog rebound risico (${context.emotioneelReadiness.reboundRisico}%)`);
      score -= 30;
    }

    if (context.emotioneelReadiness.readinessScore < 5) {
      blockers.push('Lage emotionele readiness');
      score -= 20;
    }
  } else {
    recommendations.push('Doe de Emotionele Ready Scan');
  }

  // Check hechtingsstijl awareness
  if (!context.attachmentStyle) {
    recommendations.push('Ontdek je hechtingsstijl');
    score -= 10;
  }

  // Check waarden clarity
  if (!context.waardenKompas) {
    recommendations.push('Definieer je core waarden');
    score -= 10;
  }

  const isReady = score >= 50 && blockers.length === 0;

  return {
    isReady,
    score: Math.max(0, Math.min(100, score)),
    blockers,
    recommendations,
  };
}

/**
 * 🔮 Voorspel welke tools het meest nuttig zijn voor deze gebruiker
 */
export function recommendTools(context: UserAIContext | null): {
  toolId: string;
  name: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}[] {
  if (!context) return [];

  const recommendations: any[] = [];

  // Attachment style specific tools
  if (context.attachmentStyle?.primaryStyle === 'anxious') {
    recommendations.push({
      toolId: 'chat-coach',
      name: 'Chat Coach',
      reason: 'Leer om niet overthinking te communiceren',
      priority: 'high',
    });
  }

  if (context.attachmentStyle?.primaryStyle === 'avoidant') {
    recommendations.push({
      toolId: 'emotionele-ready',
      name: 'Emotionele Readiness Scan',
      reason: 'Werk aan emotionele beschikbaarheid',
      priority: 'high',
    });
  }

  // Low profile score (using warmteScore as proxy for overall profile quality)
  if (context.zelfbeeld?.warmteScore && context.zelfbeeld.warmteScore < 7) {
    recommendations.push({
      toolId: 'profile-builder',
      name: 'Profiel Bouwer',
      reason: 'Verbeter je dating profiel score',
      priority: 'high',
    });
  }

  // Dating style blind spots
  if (context.datingStyle?.blindSpots && context.datingStyle.blindSpots.length > 2) {
    recommendations.push({
      toolId: 'iris-coach',
      name: 'Iris AI Coach',
      reason: 'Krijg persoonlijk advies over je blinde vlekken',
      priority: 'medium',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
