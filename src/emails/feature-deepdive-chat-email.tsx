import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface FeatureDeepDiveChatEmailProps {
  firstName: string;
  messagesUsed?: number;
  messagesRemaining?: number;
  dashboardUrl: string;
}

export const FeatureDeepDiveChatEmail = ({
  firstName = 'Dating Expert',
  messagesUsed = 15,
  messagesRemaining = 35,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FeatureDeepDiveChatEmailProps) => {
  const useCases = [
    {
      icon: '💬',
      scenario: 'Match reageert niet meer',
      question: '"Hoe kan ik dit gesprek weer leven inblazen?"',
      solution: 'AI geeft je 3 creatieve comeback opties',
    },
    {
      icon: '🎯',
      scenario: 'Geen idee waar te beginnen',
      question: '"Wat is een goede opener voor dit profiel?"',
      solution: 'Gepersonaliseerde opening op basis van bio',
    },
    {
      icon: '📅',
      scenario: 'Van chat naar date',
      question: '"Hoe vraag ik haar uit zonder awkward te zijn?"',
      solution: 'Natuurlijke date voorstellen die werken',
    },
    {
      icon: '🔥',
      scenario: 'Flirten zonder creepy te zijn',
      question: '"Hoe kan ik flirty zijn op een leuke manier?"',
      solution: 'Speelse complimenten en humor tips',
    },
  ];

  const proTips = [
    {
      tip: 'Wees specifiek',
      description: 'Hoe meer context je geeft, hoe beter het advies. Deel screenshots of citaten!',
    },
    {
      tip: 'Probeer varianten',
      description: 'Vraag "Geef me 3 andere versies" voor meer opties waar je uit kunt kiezen.',
    },
    {
      tip: 'Personaliseer het advies',
      description: 'Pas suggesties aan naar jouw stijl. De AI is een startpunt, maak het eigen!',
    },
  ];

  return (
    <Html>
      <Head />
      <Preview>Feature Deep Dive: Chat Coach - Jouw 24/7 dating assistent 💬</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <div style={headerIcon}>💬</div>
            <Heading style={h1}>Feature Deep Dive: Chat Coach</Heading>
            <Text style={headerSubtext}>
              Ontdek de kracht van je 24/7 dating assistent
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={text}>Hoi {firstName},</Text>

            <Text style={text}>
              Je hebt al <strong>{messagesUsed} AI gesprekken</strong> gevoerd - tijd om je te laten zien hoe je nog meer uit de <strong>Chat Coach</strong> kunt halen! 🚀
            </Text>

            {/* Quick Stats */}
            <Section style={statsBox}>
              <div style={statsRow}>
                <div style={statItem}>
                  <div style={statValue}>{messagesUsed}</div>
                  <Text style={statLabel}>Berichten Gebruikt</Text>
                </div>
                <div style={statDivider}></div>
                <div style={statItem}>
                  <div style={statValue}>{messagesRemaining}</div>
                  <Text style={statLabel}>Nog Beschikbaar</Text>
                </div>
              </div>
            </Section>

            {/* What is Chat Coach */}
            <Section style={introSection}>
              <Heading as="h2" style={h2}>
                🤔 Wat is de Chat Coach?
              </Heading>
              <Text style={text}>
                Je persoonlijke AI dating coach die <strong>24/7 beschikbaar</strong> is om te helpen met:
              </Text>
              <div style={featuresList}>
                <div style={featureItem}>✓ Gesprekken starters schrijven</div>
                <div style={featureItem}>✓ Antwoorden formuleren</div>
                <div style={featureItem}>✓ Flirt tips & advies</div>
                <div style={featureItem}>✓ Date voorstellen</div>
                <div style={featureItem}>✓ Profiel feedback</div>
              </div>
            </Section>

            {/* Real Use Cases */}
            <Section style={useCasesSection}>
              <Heading as="h2" style={h2}>
                💡 4 Situaties waar Chat Coach Goud Waard is:
              </Heading>

              {useCases.map((useCase, index) => (
                <div key={index} style={useCaseCard}>
                  <div style={useCaseHeader}>
                    <span style={useCaseIcon}>{useCase.icon}</span>
                    <Text style={useCaseScenario}>{useCase.scenario}</Text>
                  </div>
                  <div style={useCaseQuestion}>
                    <Text style={questionLabel}>Jouw vraag:</Text>
                    <Text style={questionText}>{useCase.question}</Text>
                  </div>
                  <div style={useCaseSolution}>
                    <span style={solutionIcon}>✨</span>
                    <Text style={solutionText}>{useCase.solution}</Text>
                  </div>
                </div>
              ))}
            </Section>

            {/* Pro Tips */}
            <Section style={proTipsSection}>
              <Heading as="h2" style={h2}>
                🎯 Pro Tips voor Betere Resultaten:
              </Heading>

              {proTips.map((item, index) => (
                <div key={index} style={proTipCard}>
                  <div style={proTipNumber}>{index + 1}</div>
                  <div style={proTipContent}>
                    <Text style={proTipTitle}>{item.tip}</Text>
                    <Text style={proTipDescription}>{item.description}</Text>
                  </div>
                </div>
              ))}
            </Section>

            {/* Example Conversation */}
            <Section style={exampleSection}>
              <Heading as="h3" style={h3}>
                📱 Voorbeeld Gesprek:
              </Heading>
              <div style={chatExample}>
                <div style={userMessage}>
                  <Text style={messageText}>
                    "Ik heb een match die houdt van reizen en koken. Wat is een goede opener?"
                  </Text>
                  <Text style={messageLabel}>Jij</Text>
                </div>
                <div style={aiMessage}>
                  <Text style={aiMessageText}>
                    "Hier zijn 3 opties:<br /><br />
                    1. <strong>"Zag je profiel - reis foodie! Wat is de beste maaltijd die je ooit op reis hebt gehad?"</strong><br /><br />
                    2. "Koken én reizen? Vertel: maak je thuis de gerechten van je reizen na?"<br /><br />
                    3. "Als je je volgende bestemming moet kiezen op basis van eten - waar ga je heen?"<br /><br />
                    Optie 1 is het meest engaged en persoonlijk! 🎯"
                  </Text>
                  <Text style={aiMessageLabel}>AI Coach</Text>
                </div>
              </div>
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Text style={ctaText}>
                Klaar om de Chat Coach te gebruiken?
              </Text>
              <Button style={button} href={`${dashboardUrl}?tab=chat-coach`}>
                Open Chat Coach Nu
              </Button>
              <Text style={ctaSubtext}>
                Je hebt nog {messagesRemaining} berichten over deze week! 💬
              </Text>
            </Section>

            {/* Success Story */}
            <Section style={testimonialSection}>
              <div style={testimonial}>
                <Text style={testimonialQuote}>
                  "De Chat Coach heeft me geholpen van 'hey' naar échte gesprekken. Mijn response rate is verdubbeld!"
                </Text>
                <Text style={testimonialAuthor}>- Lisa, 26 jaar, Core gebruiker</Text>
              </div>
            </Section>

            {/* Upgrade Hint */}
            {messagesRemaining < 10 && (
              <Section style={upgradeSection}>
                <div style={upgradeBox}>
                  <Text style={upgradeTitle}>⚡ Bijna door je berichten heen?</Text>
                  <Text style={upgradeText}>
                    Upgrade naar <strong>Pro</strong> of <strong>Premium</strong> voor onbeperkte AI gesprekken!
                  </Text>
                  <Button style={upgradeButton} href={`${dashboardUrl}/upgrade`}>
                    Bekijk Upgrades
                  </Button>
                </div>
              </Section>
            )}

            <Hr style={hr} />

            <Text style={text}>
              Vragen over de Chat Coach? Antwoord gewoon op deze email!
            </Text>

            <Text style={signature}>
              Happy chatting!<br />
              <strong>Vincent & het DatingAssistent team</strong>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              DatingAssistent - Jouw AI dating coach
            </Text>
            <div style={footerLinks}>
              <Link href={dashboardUrl} style={footerLink}>
                Dashboard
              </Link>
              <span style={footerSeparator}>|</span>
              <Link href={`${dashboardUrl}/settings/email-preferences`} style={footerLink}>
                Email Voorkeuren
              </Link>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default FeatureDeepDiveChatEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

const header = {
  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  padding: '40px 24px',
  textAlign: 'center' as const,
};

const headerIcon = {
  fontSize: '64px',
  marginBottom: '16px',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.95,
};

const content = {
  padding: '40px 24px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const h2 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '32px 0 20px 0',
};

const h3 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
};

const statsBox = {
  backgroundColor: '#fdf2f8',
  border: '2px solid #f9a8d4',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const statsRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
};

const statItem = {
  textAlign: 'center' as const,
  flex: 1,
};

const statValue = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#ec4899',
  marginBottom: '8px',
};

const statLabel = {
  fontSize: '14px',
  color: '#9f1239',
  margin: '0',
  fontWeight: '500',
};

const statDivider = {
  width: '2px',
  height: '60px',
  backgroundColor: '#f9a8d4',
  margin: '0 20px',
};

const introSection = {
  margin: '32px 0',
};

const featuresList = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '16px',
};

const featureItem = {
  fontSize: '15px',
  color: '#374151',
  padding: '8px 0',
  fontWeight: '500',
};

const useCasesSection = {
  margin: '32px 0',
};

const useCaseCard = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
};

const useCaseHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
};

const useCaseIcon = {
  fontSize: '32px',
  flexShrink: 0,
};

const useCaseScenario = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#065f46',
  margin: '0',
};

const useCaseQuestion = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '12px',
};

const questionLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px 0',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
};

const questionText = {
  fontSize: '15px',
  color: '#111827',
  margin: '0',
  fontStyle: 'italic',
};

const useCaseSolution = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const solutionIcon = {
  fontSize: '20px',
};

const solutionText = {
  fontSize: '14px',
  color: '#047857',
  margin: '0',
  fontWeight: '600',
};

const proTipsSection = {
  margin: '32px 0',
};

const proTipCard = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  backgroundColor: '#dbeafe',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
};

const proTipNumber = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 'bold',
  flexShrink: 0,
};

const proTipContent = {
  flex: 1,
};

const proTipTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 4px 0',
};

const proTipDescription = {
  fontSize: '14px',
  color: '#1e3a8a',
  margin: '0',
  lineHeight: '20px',
};

const exampleSection = {
  margin: '32px 0',
};

const chatExample = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  marginTop: '16px',
};

const userMessage = {
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  borderRadius: '12px 12px 12px 4px',
  padding: '16px',
  marginBottom: '16px',
};

const messageText = {
  fontSize: '15px',
  color: '#111827',
  margin: '0 0 8px 0',
  lineHeight: '22px',
};

const messageLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0',
  fontWeight: '600',
};

const aiMessage = {
  backgroundColor: '#fdf2f8',
  border: '2px solid #f9a8d4',
  borderRadius: '12px 12px 4px 12px',
  padding: '16px',
};

const aiMessageText = {
  fontSize: '15px',
  color: '#831843',
  margin: '0 0 8px 0',
  lineHeight: '22px',
};

const aiMessageLabel = {
  fontSize: '12px',
  color: '#9f1239',
  margin: '0',
  fontWeight: '600',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#111827',
  margin: '0 0 16px 0',
};

const button = {
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '12px 0 0 0',
};

const testimonialSection = {
  margin: '32px 0',
};

const testimonial = {
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #10b981',
  borderRadius: '8px',
  padding: '20px',
};

const testimonialQuote = {
  fontSize: '16px',
  fontStyle: 'italic',
  color: '#065f46',
  margin: '0 0 8px 0',
};

const testimonialAuthor = {
  fontSize: '14px',
  color: '#047857',
  margin: '0',
  fontWeight: '600',
};

const upgradeSection = {
  margin: '32px 0',
};

const upgradeBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #fbbf24',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const upgradeTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px 0',
};

const upgradeText = {
  fontSize: '15px',
  color: '#78350f',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const upgradeButton = {
  backgroundColor: '#f59e0b',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
};

const footer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0 0 12px 0',
};

const footerLinks = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
};

const footerLink = {
  color: '#ec4899',
  fontSize: '12px',
  textDecoration: 'none',
};

const footerSeparator = {
  color: '#d1d5db',
  fontSize: '12px',
};
