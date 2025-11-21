// Email Component Library - Main Exports
export { EmailCard, EmailHeroCard, EmailStatsCard, EmailAlertCard } from './email-card';
export { EmailButton, EmailPrimaryButton, EmailSecondaryButton, EmailOutlineButton, EmailLinkButton } from './email-button';
export { EmailBadge, EmailStepBadge, EmailScoreBadge, EmailStatusBadge } from './email-badge';
export { EmailStatsGrid, EmailFeatureStats, EmailAchievementStats } from './email-stats-grid';
export { EmailStepIndicator, EmailWelcomeSteps, EmailOnboardingSteps } from './email-step-indicator';
export { EmailLogo, EmailLogoCompact, EmailLogoFull } from './email-logo';

// Re-export design system for convenience
export { emailColors, emailThemes } from '../styles/colors';
export { emailTypography, createTextStyle, createHeadingStyle } from '../styles/typography';
export { emailLayout, createCardStyle, createGridStyle, createFlexStyle } from '../styles/layout';