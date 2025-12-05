/**
 * Feature Deep Dive - Chat Coach
 */
import * as React from 'react';
import { Section, Text, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  FeatureCard,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface FeatureDeepDiveChatEmailProps {
  firstName: string;
  messagesUsed?: number;
  messagesRemaining?: number;
  dashboardUrl?: string;
}

export default function FeatureDeepDiveChatEmail({
  firstName,
  messagesUsed = 15,
  messagesRemaining = 35,
  dashboardUrl = 'https://datingassistent.nl/dashboard',
}: FeatureDeepDiveChatEmailProps) {
  return (
    <BaseEmail preview="Chat Coach Deep Dive - Je 24/7 dating assistent">
      <HeroHeader
        title="Chat Coach Deep Dive"
        subtitle="Ontdek alles wat je kunt vragen"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          De Chat Coach is je persoonlijke dating expert die 24/7 klaarstaat.
          Maar wist je dat je veel meer kunt vragen dan je misschien denkt?
        </Text>

        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '20px 24px',
          margin: '24px 0',
        }}>
          <Row>
            <Column style={{ textAlign: 'center' }}>
              <Text style={{ ...styles.statValue, fontSize: '24px' }}>{messagesUsed}</Text>
              <Text style={{ ...styles.paragraph, fontSize: '12px', margin: '0' }}>Gebruikt</Text>
            </Column>
            <Column style={{ textAlign: 'center' }}>
              <Text style={{ ...styles.statValue, fontSize: '24px' }}>{messagesRemaining}</Text>
              <Text style={{ ...styles.paragraph, fontSize: '12px', margin: '0' }}>Beschikbaar</Text>
            </Column>
          </Row>
        </Section>

        <Text style={{ ...styles.heading2, marginTop: '24px' }}>
          Dit kun je allemaal vragen:
        </Text>

        <FeatureCard
          icon="📝"
          title="Profiel review"
          description="'Kun je mijn Tinder bio reviewen en verbeteren?'"
        />
        <FeatureCard
          icon="💬"
          title="Gesprekshulp"
          description="'Hoe reageer ik op dit bericht?' (plak de tekst erbij)"
        />
        <FeatureCard
          icon="📸"
          title="Foto advies"
          description="'Welke foto moet ik als eerste gebruiken?'"
        />
        <FeatureCard
          icon="🎯"
          title="Date planning"
          description="'Geef me 5 originele date ideeen in Amsterdam'"
        />
        <FeatureCard
          icon="🤔"
          title="Situatie advies"
          description="'Ze reageert niet meer, wat moet ik doen?'"
        />
        <FeatureCard
          icon="❤️"
          title="Relatie tips"
          description="'Hoe maak ik van een date een tweede date?'"
        />

        <CTAButton href={`${dashboardUrl}?tab=chat`}>
          Start een gesprek
        </CTAButton>

        <InfoBox type="tip" title="Pro tip">
          Hoe specifieker je vraag, hoe beter het advies. Geef context over
          je situatie voor de beste resultaten!
        </InfoBox>
      </Section>

      <EmailFooter preferencesUrl={`${dashboardUrl}/settings/email-preferences`} />
    </BaseEmail>
  );
}
