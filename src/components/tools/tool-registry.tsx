"use client";

import { lazy, ComponentType } from 'react';

/**
 * Tool Registry - Centralized mapping of tool routes to components
 *
 * Uses lazy loading for optimal performance - components are only loaded when needed
 */

// Lazy load tool components for optimal performance
const AttachmentAssessmentFlow = lazy(() =>
  import('@/components/attachment-assessment/attachment-assessment-flow').then(mod => ({
    default: mod.AttachmentAssessmentFlow
  }))
);

const PhotoAnalysisTab = lazy(() =>
  import('@/components/dashboard/photo-analysis-tab').then(mod => ({
    default: mod.PhotoAnalysisTab
  }))
);

const ProfileAnalysis = lazy(() =>
  import('@/components/profile-analysis').then(mod => ({
    default: mod.ProfileAnalysis
  }))
);

// Tool component interface
export interface ToolComponentProps {
  onComplete?: (data?: any) => void;
  onClose?: () => void;
}

// Tool metadata interface
export interface ToolMetadata {
  component: ComponentType<ToolComponentProps>;
  title: string;
  subtitle: string;
  supportsProgress?: boolean;
  requiresAuth?: boolean;
}

// Tool registry mapping
export const TOOL_REGISTRY: Record<string, ToolMetadata> = {
  // Profiel tools
  '/hechtingsstijl': {
    component: AttachmentAssessmentFlow,
    title: 'Hechtingsstijl QuickScan',
    subtitle: 'Ontdek je relatiepatronen in 3-5 minuten',
    supportsProgress: true,
    requiresAuth: true,
  },
  '/foto': {
    component: PhotoAnalysisTab,
    title: 'Foto Analyse',
    subtitle: 'AI beoordeling van je profielfoto\'s',
    supportsProgress: false,
    requiresAuth: true,
  },
  '/profiel': {
    component: ProfileAnalysis,
    title: 'Profiel Analyse',
    subtitle: 'AI assessment van je dating profiel',
    supportsProgress: false,
    requiresAuth: true,
  },

  // Add more tools here as they become available
  // '/chat': { ... },
  // '/opener': { ... },
  // '/tools/ai-bio-generator': { ... },
};

/**
 * Get tool metadata by route
 */
export function getToolMetadata(route: string): ToolMetadata | null {
  return TOOL_REGISTRY[route] || null;
}

/**
 * Check if a route has a modal component
 */
export function hasModalComponent(route: string): boolean {
  return route in TOOL_REGISTRY;
}

/**
 * Get all available tool routes
 */
export function getAvailableToolRoutes(): string[] {
  return Object.keys(TOOL_REGISTRY);
}
