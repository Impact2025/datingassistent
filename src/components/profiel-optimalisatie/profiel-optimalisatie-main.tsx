"use client";

/**
 * PROFIEL OPTIMALISATIE - Main Orchestrator
 * Minimalist, Professional, AI-Guided Profile Building Experience
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { WelcomeScreen } from './welcome-screen';
import { AssessmentFlow } from './assessment-flow';
import { RouteOverview } from './route-overview';
import { PhotoOptimizationStep } from './photo-optimization-step';
import { BioGeneratorStep } from './bio-generator-step';
import { DetailsStep } from './details-step';
import { CompletionScreen } from './completion-screen';
import { DashboardView } from './dashboard-view';

export type OptimizationStep =
  | 'welcome'
  | 'assessment'
  | 'route'
  | 'photos'
  | 'bio'
  | 'details'
  | 'completion'
  | 'dashboard';

interface ProfileData {
  completeness: number;
  hasProfile: boolean;
  platform?: string;
  currentMatches?: string;
  goals?: string[];

  // Assessment data
  coreValues?: string[];
  uniqueTrait?: string;
  lookingFor?: string;
  dealBreakers?: string[];

  // Photo data (optimized for localStorage)
  photoCount?: number;
  photoMetadata?: Array<{
    score: number;
    analysis: any;
  }>;
  photoScore?: number;

  // Bio data
  bioAnswers?: string[];
  selectedBio?: string;
  bioVariants?: Array<{
    variant: string;
    score: number;
    style: string;
  }>;
  bioScore?: number;

  // Details
  height?: string;
  education?: string;
  work?: string;
  location?: string;
  interests?: string[];

  // Scores
  overallScore?: number;
  lastUpdated?: Date;
}

export function ProfielOptimalisatieMain() {
  const { userProfile } = useUser();
  const [currentStep, setCurrentStep] = useState<OptimizationStep>('welcome');
  const [profileData, setProfileData] = useState<ProfileData>({
    completeness: 0,
    hasProfile: false
  });

  // Check if user has existing optimized profile
  useEffect(() => {
    const savedData = localStorage.getItem('profiel-optimalisatie-data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setProfileData(parsed);

      // If profile is 100% complete, show dashboard
      if (parsed.completeness === 100) {
        setCurrentStep('dashboard');
      } else if (parsed.completeness > 0) {
        // Resume where they left off
        setCurrentStep('route');
      }
    }
  }, []);

  // Save progress
  const saveProgress = (data: Partial<ProfileData>) => {
    const updated = { ...profileData, ...data };
    setProfileData(updated);

    try {
      // Only save essential data to localStorage (no large base64 images)
      const dataToSave = {
        completeness: updated.completeness,
        hasProfile: updated.hasProfile,
        platform: updated.platform,
        currentMatches: updated.currentMatches,
        goals: updated.goals,
        coreValues: updated.coreValues,
        uniqueTrait: updated.uniqueTrait,
        lookingFor: updated.lookingFor,
        dealBreakers: updated.dealBreakers,
        photoCount: updated.photoCount,
        photoMetadata: updated.photoMetadata,
        photoScore: updated.photoScore,
        bioAnswers: updated.bioAnswers,
        selectedBio: updated.selectedBio,
        bioScore: updated.bioScore,
        height: updated.height,
        education: updated.education,
        work: updated.work,
        location: updated.location,
        interests: updated.interests,
        overallScore: updated.overallScore,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('profiel-optimalisatie-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('LocalStorage quota exceeded, continuing without persistence:', error);
      // Continue without localStorage - data is still in state
    }
  };

  // Calculate completeness
  const calculateCompleteness = () => {
    let score = 0;
    if (profileData.photoCount && profileData.photoCount >= 3) score += 40;
    if (profileData.selectedBio) score += 40;
    if (profileData.height && profileData.work) score += 20;
    return score;
  };

  const handleStepComplete = (stepData: any) => {
    const completeness = calculateCompleteness();
    saveProgress({ ...stepData, completeness });

    // Move to next step
    const stepFlow: OptimizationStep[] = ['welcome', 'assessment', 'route', 'photos', 'bio', 'details', 'completion'];
    const currentIndex = stepFlow.indexOf(currentStep);
    if (currentIndex < stepFlow.length - 1) {
      setCurrentStep(stepFlow[currentIndex + 1]);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeScreen
            onStart={() => setCurrentStep('assessment')}
            onSkipToRoute={() => setCurrentStep('route')}
          />
        );

      case 'assessment':
        return (
          <AssessmentFlow
            onComplete={(data) => {
              saveProgress(data);
              setCurrentStep('route');
            }}
            onBack={() => setCurrentStep('welcome')}
          />
        );

      case 'route':
        return (
          <RouteOverview
            profileData={profileData}
            onStartStep={(step) => setCurrentStep(step as OptimizationStep)}
          />
        );

      case 'photos':
        return (
          <PhotoOptimizationStep
            onComplete={handleStepComplete}
            onBack={() => setCurrentStep('route')}
            existingPhotoCount={profileData.photoCount}
          />
        );

      case 'bio':
        return (
          <BioGeneratorStep
            onComplete={handleStepComplete}
            onBack={() => setCurrentStep('route')}
            profileData={profileData}
          />
        );

      case 'details':
        return (
          <DetailsStep
            onComplete={handleStepComplete}
            onBack={() => setCurrentStep('route')}
            profileData={profileData}
          />
        );

      case 'completion':
        return (
          <CompletionScreen
            profileData={profileData}
            onViewDashboard={() => setCurrentStep('dashboard')}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            profileData={profileData}
            onEdit={(step) => setCurrentStep(step as OptimizationStep)}
          />
        );

      default:
        return <WelcomeScreen onStart={() => setCurrentStep('assessment')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {renderStep()}
    </div>
  );
}
