/**
 * Admin New Lead Notification Email
 * Sent to admin@datingassistent.nl when a new user registers
 */

import * as React from 'react';
import { Section, Text, Hr, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  CTAButton,
  InfoBox,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface LeadIntakeInfo {
  lookingFor?: string;
  datingStatus?: string;
  mainObstacle?: string;
}

interface AdminNewLeadEmailProps {
  leadName: string;
  leadEmail: string;
  leadId: number;
  registrationSource: 'lead_wizard' | 'legacy' | 'api';
  photoScore?: number | null;
  intakeData?: LeadIntakeInfo | null;
  otoShown?: boolean;
  otoAccepted?: boolean;
  registeredAt: string;
  dashboardUrl?: string;
}

// Human-readable mappings
const lookingForLabels: Record<string, string> = {
  man: 'Een man',
  vrouw: 'Een vrouw',
  anders: 'Anders / Beiden',
};

const datingStatusLabels: Record<string, string> = {
  net_begonnen: 'Net begonnen met online daten',
  tijdje_bezig_geen_succes: 'Al een tijdje bezig, nog geen succes',
  gefrustreerd: 'Gefrustreerd en klaar met spelletjes',
};

const obstacleLabels: Record<string, string> = {
  profiel_trekt_niemand_aan: 'Profiel trekt niemand aan',
  gesprekken_vallen_stil: 'Gesprekken vallen stil',
  krijg_geen_dates: 'Krijgt geen dates',
};

export default function AdminNewLeadEmail({
  leadName,
  leadEmail,
  leadId,
  registrationSource,
  photoScore,
  intakeData,
  otoShown,
  otoAccepted,
  registeredAt,
  dashboardUrl = 'https://datingassistent.nl/admin/users',
}: AdminNewLeadEmailProps) {
  const sourceLabels: Record<string, string> = {
    lead_wizard: 'Lead Activation Wizard',
    legacy: 'Standaard Registratie',
    api: 'API / Directe Aanmelding',
  };

  // Calculate lead quality score
  const getLeadQuality = (): { score: string; color: string; label: string } => {
    let points = 0;

    // Has intake data (+2)
    if (intakeData?.mainObstacle) points += 2;

    // Has photo score (+1)
    if (photoScore !== null && photoScore !== undefined) points += 1;

    // Photo score is good (+1)
    if (photoScore && photoScore < 7) points += 1; // Lower score = more likely to convert

    // Saw OTO (+1)
    if (otoShown) points += 1;

    // Accepted OTO (+3)
    if (otoAccepted) points += 3;

    if (points >= 6) return { score: '🔥', color: colors.success, label: 'HOT Lead' };
    if (points >= 3) return { score: '🌡️', color: colors.warning, label: 'Warm Lead' };
    return { score: '❄️', color: colors.info, label: 'Cold Lead' };
  };

  const quality = getLeadQuality();

  return (
    <BaseEmail preview={`Nieuwe Lead: ${leadName} (${quality.label})`}>
      <SimpleHeader />

      <Section style={styles.content}>
        {/* Lead Quality Badge */}
        <Section style={{
          backgroundColor: quality.color + '15',
          border: `2px solid ${quality.color}`,
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <Text style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{quality.score}</Text>
          <Text style={{
            fontSize: '18px',
            fontWeight: '700',
            color: quality.color,
            margin: '0',
          }}>
            {quality.label}
          </Text>
        </Section>

        <Text style={styles.heading1}>Nieuwe Lead Registratie</Text>

        <Text style={styles.paragraph}>
          Er heeft zich zojuist iemand aangemeld via {sourceLabels[registrationSource]}.
        </Text>

        {/* Lead Details Card */}
        <Section style={{
          backgroundColor: colors.lightGray,
          borderRadius: '12px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Text style={{ ...styles.heading2, marginTop: '0' }}>Lead Gegevens</Text>

          <table width="100%" cellPadding="8" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ color: colors.gray, fontSize: '14px', width: '40%' }}>Naam:</td>
                <td style={{ color: colors.dark, fontSize: '14px', fontWeight: '600' }}>{leadName}</td>
              </tr>
              <tr>
                <td style={{ color: colors.gray, fontSize: '14px' }}>Email:</td>
                <td style={{ color: colors.dark, fontSize: '14px', fontWeight: '600' }}>
                  <a href={`mailto:${leadEmail}`} style={{ color: colors.primary }}>{leadEmail}</a>
                </td>
              </tr>
              <tr>
                <td style={{ color: colors.gray, fontSize: '14px' }}>User ID:</td>
                <td style={{ color: colors.dark, fontSize: '14px', fontWeight: '600' }}>#{leadId}</td>
              </tr>
              <tr>
                <td style={{ color: colors.gray, fontSize: '14px' }}>Registratie:</td>
                <td style={{ color: colors.dark, fontSize: '14px' }}>{registeredAt}</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* Photo Score */}
        {photoScore !== null && photoScore !== undefined && (
          <Section style={{
            backgroundColor: photoScore >= 7 ? '#f0fdf4' : photoScore >= 5 ? '#fefce8' : '#fef2f2',
            borderRadius: '12px',
            padding: '20px',
            margin: '16px 0',
            textAlign: 'center',
          }}>
            <Text style={{ fontSize: '14px', color: colors.gray, margin: '0 0 8px 0' }}>
              Foto Score (AI Analyse)
            </Text>
            <Text style={{
              fontSize: '36px',
              fontWeight: '700',
              color: photoScore >= 7 ? colors.success : photoScore >= 5 ? colors.warning : colors.error,
              margin: '0',
            }}>
              {photoScore.toFixed(1)}/10
            </Text>
            <Text style={{ fontSize: '12px', color: colors.gray, margin: '8px 0 0 0' }}>
              {photoScore < 6 ? 'Veel verbeterpotentieel = hogere conversiekans' :
               photoScore < 8 ? 'Gemiddeld verbeterpotentieel' : 'Al een sterk profiel'}
            </Text>
          </Section>
        )}

        {/* Intake Data */}
        {intakeData && (
          <>
            <Text style={{ ...styles.heading2, marginTop: '24px' }}>Intake Antwoorden</Text>

            <Section style={{
              backgroundColor: colors.lightGray,
              borderRadius: '12px',
              padding: '20px',
              margin: '16px 0',
            }}>
              <table width="100%" cellPadding="8" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  {intakeData.lookingFor && (
                    <tr>
                      <td style={{ color: colors.gray, fontSize: '14px', width: '40%' }}>Zoekt naar:</td>
                      <td style={{ color: colors.dark, fontSize: '14px', fontWeight: '600' }}>
                        {lookingForLabels[intakeData.lookingFor] || intakeData.lookingFor}
                      </td>
                    </tr>
                  )}
                  {intakeData.datingStatus && (
                    <tr>
                      <td style={{ color: colors.gray, fontSize: '14px' }}>Status:</td>
                      <td style={{ color: colors.dark, fontSize: '14px', fontWeight: '600' }}>
                        {datingStatusLabels[intakeData.datingStatus] || intakeData.datingStatus}
                      </td>
                    </tr>
                  )}
                  {intakeData.mainObstacle && (
                    <tr>
                      <td style={{ color: colors.gray, fontSize: '14px' }}>Grootste obstakel:</td>
                      <td style={{
                        color: colors.primary,
                        fontSize: '14px',
                        fontWeight: '700',
                        backgroundColor: colors.primary + '15',
                        padding: '8px 12px',
                        borderRadius: '6px',
                      }}>
                        {obstacleLabels[intakeData.mainObstacle] || intakeData.mainObstacle}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>
          </>
        )}

        {/* OTO Status */}
        {otoShown !== undefined && (
          <Section style={{
            backgroundColor: otoAccepted ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${otoAccepted ? colors.success : colors.error}`,
            borderRadius: '12px',
            padding: '16px',
            margin: '16px 0',
            textAlign: 'center',
          }}>
            <Text style={{
              fontSize: '14px',
              fontWeight: '600',
              color: otoAccepted ? colors.success : colors.error,
              margin: '0',
            }}>
              {otoAccepted
                ? '✅ Kickstart OTO Geaccepteerd - Conversie!'
                : otoShown
                  ? '❌ Kickstart OTO Afgewezen - Follow-up nodig'
                  : '⏸️ OTO Nog niet getoond'}
            </Text>
          </Section>
        )}

        <Hr style={styles.divider} />

        {/* Recommended Actions */}
        <Text style={styles.heading2}>Aanbevolen Acties</Text>

        {intakeData?.mainObstacle === 'profiel_trekt_niemand_aan' && (
          <InfoBox type="tip" title="Upsell Advies">
            Deze lead heeft problemen met zijn/haar profiel. Focus op Kickstart of Foto Coach.
          </InfoBox>
        )}

        {intakeData?.mainObstacle === 'gesprekken_vallen_stil' && (
          <InfoBox type="tip" title="Upsell Advies">
            Deze lead heeft moeite met gesprekken. Focus op Chat Coach of Transformatie.
          </InfoBox>
        )}

        {intakeData?.mainObstacle === 'krijg_geen_dates' && (
          <InfoBox type="tip" title="Upsell Advies">
            Deze lead krijgt geen dates. Focus op Transformatie of VIP coaching.
          </InfoBox>
        )}

        {!otoAccepted && otoShown && (
          <InfoBox type="warning" title="Follow-up Vereist">
            Lead heeft de OTO afgewezen. Stuur binnen 24 uur een follow-up email met alternatief aanbod.
          </InfoBox>
        )}

        <CTAButton href={`${dashboardUrl}?search=${encodeURIComponent(leadEmail)}`}>
          Bekijk in Admin Dashboard
        </CTAButton>

        <Text style={{ ...styles.paragraph, fontSize: '14px', color: colors.gray, textAlign: 'center' }}>
          Dit is een automatische notificatie van het DatingAssistent systeem.
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
