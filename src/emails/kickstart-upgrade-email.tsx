/**
 * Kickstart to Transformatie Upgrade Email Templates
 * Post-purchase upsell sequence: Day 7, 14, 21
 */
import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import {
  BaseEmail,
  HeroHeader,
  Greeting,
  CTAButton,
  InfoBox,
  StepsList,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface KickstartUpgradeEmailProps {
  firstName: string;
  daysCompleted: number;
  upgradeUrl: string;
  currentScore?: number;
  improvementPercentage?: number;
  variant: 'day7' | 'day14' | 'day21';
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl';

// Day 7 - Week 1 Complete - Soft upsell
function Day7Email({ firstName, daysCompleted, upgradeUrl, currentScore }: Omit<KickstartUpgradeEmailProps, 'variant'>) {
  return (
    <BaseEmail preview={`${firstName}, week 1 voltooid! Wat nu?`}>
      <HeroHeader
        title="Week 1 voltooid!"
        subtitle="Je bent goed op weg - tijd voor de volgende stap?"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          Wauw! Je hebt al <strong>{daysCompleted} dagen</strong> van je Kickstart afgerond.
          Dat is een geweldige start en je commitment is inspirerend.
        </Text>

        {currentScore && (
          <Section style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '12px',
            padding: '24px',
            margin: '24px 0',
            textAlign: 'center' as const,
          }}>
            <Text style={{ fontSize: '48px', margin: '0' }}>{currentScore.toFixed(1)}</Text>
            <Text style={{ ...styles.paragraph, color: '#16a34a', fontWeight: 'bold', margin: '8px 0 0 0' }}>
              Je huidige profielscore
            </Text>
          </Section>
        )}

        <Text style={styles.paragraph}>
          Je bent nu klaar voor de <strong>basis</strong>. Maar wist je dat de meeste mannen
          pas echt resultaat zien wanneer ze de complete strategie toepassen?
        </Text>

        <InfoBox type="tip" title="Wist je dat...">
          Kickstart-gebruikers die upgraden naar Transformatie gemiddeld <strong>3x meer matches</strong> krijgen
          dan gebruikers die alleen Kickstart doen. Het verschil? De diepgaande modules over
          gesprekstechnieken en date-voorbereiding.
        </InfoBox>

        <Text style={{ ...styles.heading2, textAlign: 'center' as const, marginTop: '32px' }}>
          Wat krijg je extra met Transformatie?
        </Text>

        <StepsList
          steps={[
            {
              title: '6 Complete Video Modules',
              description: 'Van eerste bericht tot eerste date - alles uitgelegd',
            },
            {
              title: '90 Dagen AI Pro Suite',
              description: 'Onbeperkt Chat Coach, Match Analyse & meer',
            },
            {
              title: '3x Live Q&A Sessies',
              description: 'Persoonlijke vragen beantwoord door experts',
            },
          ]}
        />

        <Section style={{
          backgroundColor: '#fef3f3',
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
          textAlign: 'center' as const,
          border: `2px dashed ${colors.primary}`,
        }}>
          <Text style={{ ...styles.heading2, color: colors.primary, margin: '0 0 8px 0' }}>
            Exclusief voor Kickstart-gebruikers
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0 0 16px 0' }}>
            Upgrade nu en je Kickstart investering (€47) wordt <strong>volledig verrekend</strong>!
          </Text>
          <Text style={{ fontSize: '14px', color: '#666', margin: '0' }}>
            Je betaalt dus slechts €100 extra voor de complete Transformatie.
          </Text>
        </Section>

        <CTAButton href={upgradeUrl}>
          Bekijk Transformatie Upgrade
        </CTAButton>

        <Text style={{ ...styles.paragraph, textAlign: 'center' as const, color: '#666', fontSize: '14px' }}>
          Geen druk - focus eerst op je Kickstart. Deze aanbieding blijft beschikbaar.
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}

// Day 14 - Halfway - Stronger upsell
function Day14Email({ firstName, daysCompleted, upgradeUrl, improvementPercentage }: Omit<KickstartUpgradeEmailProps, 'variant'>) {
  return (
    <BaseEmail preview={`${firstName}, halverwege! Klaar voor meer?`}>
      <HeroHeader
        title="Halverwege!"
        subtitle="14 dagen voltooid - je bent een doorzetter"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Text style={styles.paragraph}>
          <strong>{daysCompleted} dagen</strong> Kickstart voltooid! Je bent officieel halverwege
          en je commitment is bewonderenswaardig.
        </Text>

        {improvementPercentage && improvementPercentage > 0 && (
          <Section style={{
            background: 'linear-gradient(135deg, #fef3f3 0%, #fef7f7 100%)',
            borderRadius: '12px',
            padding: '24px',
            margin: '24px 0',
            textAlign: 'center' as const,
          }}>
            <Text style={{ fontSize: '48px', margin: '0', color: colors.primary }}>+{improvementPercentage}%</Text>
            <Text style={{ ...styles.paragraph, fontWeight: 'bold', margin: '8px 0 0 0' }}>
              Verbetering sinds dag 1
            </Text>
          </Section>
        )}

        <Text style={styles.paragraph}>
          Je hebt nu de basis onder de knie. Maar hier komt de eerlijke vraag:
        </Text>

        <Section style={{
          backgroundColor: '#fff7ed',
          borderLeft: `4px solid #f97316`,
          borderRadius: '8px',
          padding: '20px 24px',
          margin: '24px 0',
        }}>
          <Text style={{ ...styles.paragraph, fontStyle: 'italic', margin: '0' }}>
            "Wat gebeurt er na dag 21? Hoe zorg je dat je resultaten blijven
            en je niet terugvalt in oude patronen?"
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          Dit is precies waar <strong>Transformatie</strong> het verschil maakt.
          Niet alleen leer je de technieken, maar je krijgt de diepgang om ze
          <strong> voor altijd</strong> te beheersen.
        </Text>

        <Text style={{ ...styles.heading2, textAlign: 'center' as const, marginTop: '32px' }}>
          Het verschil tussen Kickstart en Transformatie
        </Text>

        <Section style={{ margin: '24px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}></th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Kickstart</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', backgroundColor: '#fef3f3' }}>Transformatie</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Profiel optimalisatie</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Basis</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef3f3' }}>Uitgebreid</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Gesprekstechnieken</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef3f3' }}>Volledig</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Date voorbereiding</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef3f3' }}>Volledig</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>AI Tools toegang</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>21 dagen</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fef3f3' }}>90 dagen</td>
              </tr>
              <tr>
                <td style={{ padding: '12px' }}>Live Q&A sessies</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>-</td>
                <td style={{ padding: '12px', textAlign: 'center', backgroundColor: '#fef3f3' }}>3x</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <CTAButton href={upgradeUrl}>
          Upgrade naar Transformatie - €100 extra
        </CTAButton>

        <Text style={{ ...styles.paragraph, textAlign: 'center' as const, color: '#666', fontSize: '14px', marginTop: '16px' }}>
          Je Kickstart investering wordt volledig verrekend
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}

// Day 21 - Kickstart Complete - Final offer
function Day21Email({ firstName, upgradeUrl, currentScore, improvementPercentage }: Omit<KickstartUpgradeEmailProps, 'variant'>) {
  return (
    <BaseEmail preview={`${firstName}, Kickstart voltooid! Speciale aanbieding binnen`}>
      <HeroHeader
        title="Kickstart Voltooid!"
        subtitle="21 dagen - Je hebt het gehaald!"
      />

      <Section style={styles.content}>
        <Greeting name={firstName} />

        <Section style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '16px',
          padding: '32px',
          margin: '24px 0',
          textAlign: 'center' as const,
        }}>
          <Text style={{ fontSize: '64px', margin: '0' }}>🎉</Text>
          <Text style={{ ...styles.heading2, color: '#16a34a', margin: '16px 0 8px 0' }}>
            Gefeliciteerd!
          </Text>
          <Text style={{ ...styles.paragraph, margin: '0' }}>
            Je hebt alle 21 dagen van Kickstart voltooid. Dit is een prestatie
            waar je trots op mag zijn!
          </Text>
        </Section>

        {(currentScore || improvementPercentage) && (
          <Section style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            margin: '24px 0',
          }}>
            {currentScore && (
              <Section style={{
                backgroundColor: colors.lightGray,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center' as const,
                flex: '1',
              }}>
                <Text style={{ fontSize: '36px', fontWeight: 'bold', margin: '0', color: colors.primary }}>
                  {currentScore.toFixed(1)}
                </Text>
                <Text style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
                  Huidige score
                </Text>
              </Section>
            )}
            {improvementPercentage && improvementPercentage > 0 && (
              <Section style={{
                backgroundColor: colors.lightGray,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center' as const,
                flex: '1',
              }}>
                <Text style={{ fontSize: '36px', fontWeight: 'bold', margin: '0', color: '#16a34a' }}>
                  +{improvementPercentage}%
                </Text>
                <Text style={{ fontSize: '14px', color: '#666', margin: '8px 0 0 0' }}>
                  Verbetering
                </Text>
              </Section>
            )}
          </Section>
        )}

        <Hr style={{ borderColor: '#e5e7eb', margin: '32px 0' }} />

        <Text style={styles.paragraph}>
          Je hebt de basis gelegd. Maar wees eerlijk tegen jezelf:
        </Text>

        <Text style={{ ...styles.paragraph, fontWeight: 'bold', fontSize: '18px', textAlign: 'center' as const }}>
          Ben je tevreden met waar je nu staat?
          Of wil je door naar het volgende niveau?
        </Text>

        <Section style={{
          backgroundColor: '#fef3f3',
          borderRadius: '16px',
          padding: '32px',
          margin: '32px 0',
          textAlign: 'center' as const,
          border: `3px solid ${colors.primary}`,
        }}>
          <Text style={{ fontSize: '14px', textTransform: 'uppercase' as const, letterSpacing: '2px', color: colors.primary, margin: '0 0 8px 0' }}>
            Exclusief voor Kickstart Afronners
          </Text>
          <Text style={{ ...styles.heading2, margin: '0 0 16px 0' }}>
            Transformatie Upgrade Deal
          </Text>

          <Section style={{ margin: '16px 0' }}>
            <Text style={{ fontSize: '16px', textDecoration: 'line-through', color: '#999', margin: '0' }}>
              Normaal: €147
            </Text>
            <Text style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>
              Minus je Kickstart: -€47
            </Text>
            <Text style={{ fontSize: '36px', fontWeight: 'bold', color: colors.primary, margin: '8px 0' }}>
              €100
            </Text>
            <Text style={{ fontSize: '14px', color: '#666', margin: '0' }}>
              Eenmalig - Levenslange toegang
            </Text>
          </Section>

          <Text style={{ ...styles.paragraph, margin: '16px 0 24px 0' }}>
            Inclusief: 6 video modules, 90 dagen AI Pro Suite,
            3x Live Q&A, en alles wat je nodig hebt voor echte dates.
          </Text>

          <CTAButton href={upgradeUrl}>
            Claim je Transformatie Upgrade
          </CTAButton>

          <Text style={{ fontSize: '12px', color: '#666', margin: '16px 0 0 0' }}>
            30 dagen niet-goed-geld-terug garantie
          </Text>
        </Section>

        <Text style={styles.paragraph}>
          Niet klaar voor de upgrade? Geen probleem. Je Kickstart toegang
          blijft actief en je kunt altijd later upgraden (tegen de normale prijs).
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}

// Main export - renders the correct variant
export default function KickstartUpgradeEmail(props: KickstartUpgradeEmailProps) {
  const { variant, ...emailProps } = props;

  switch (variant) {
    case 'day7':
      return <Day7Email {...emailProps} />;
    case 'day14':
      return <Day14Email {...emailProps} />;
    case 'day21':
      return <Day21Email {...emailProps} />;
    default:
      return <Day7Email {...emailProps} />;
  }
}
