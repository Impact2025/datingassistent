/**
 * Admin Daily Management Report Email
 * Sent daily to info@datingassistent.nl with key business metrics
 */

import * as React from 'react';
import { Section, Text, Hr, Row, Column } from '@react-email/components';
import {
  BaseEmail,
  SimpleHeader,
  CTAButton,
  EmailFooter,
  styles,
  colors,
} from './components/email-base';

interface DailyStats {
  // New registrations
  newUsersToday: number;
  newUsersYesterday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;

  // Revenue
  revenueToday: number;
  revenueYesterday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;

  // Subscriptions
  activeSubscriptions: number;
  newSubscriptionsToday: number;
  cancelledToday: number;
  trialConversionsToday: number;

  // Engagement
  activeUsersToday: number;
  activeUsersYesterday: number;
  totalAiMessages: number;
  totalToolUsage: number;

  // Leads
  newLeadsToday: number;
  hotLeadsToday: number;
  otoConversionsToday: number;

  // Email performance
  emailsSentToday: number;
  emailOpenRate: number;
  emailClickRate: number;

  // Traffic (if available)
  pageViewsToday?: number;
  uniqueVisitorsToday?: number;

  // Top sources
  topTrafficSources?: Array<{ source: string; count: number }>;

  // Churn risk
  highChurnRiskUsers: number;

  // Technical metrics
  apiErrorsToday: number;
  apiErrorsYesterday: number;
  apiCallsToday: number;
  aiCostToday: number;
  aiCostThisMonth: number;
  avgResponseTimeMs: number;
  slowestEndpoint?: string;
  topErrors?: Array<{ endpoint: string; count: number; lastError: string }>;
}

interface AdminDailyReportEmailProps {
  stats: DailyStats;
  reportDate: string;
  dashboardUrl?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getTrendIndicator(current: number, previous: number): { icon: string; color: string; text: string } {
  if (previous === 0) {
    return current > 0
      ? { icon: '🆕', color: colors.success, text: 'nieuw' }
      : { icon: '➖', color: colors.gray, text: 'gelijk' };
  }

  const change = ((current - previous) / previous) * 100;

  if (change > 10) {
    return { icon: '📈', color: colors.success, text: `+${change.toFixed(0)}%` };
  } else if (change > 0) {
    return { icon: '↗️', color: colors.success, text: `+${change.toFixed(0)}%` };
  } else if (change < -10) {
    return { icon: '📉', color: colors.error, text: `${change.toFixed(0)}%` };
  } else if (change < 0) {
    return { icon: '↘️', color: colors.warning, text: `${change.toFixed(0)}%` };
  }

  return { icon: '➖', color: colors.gray, text: 'gelijk' };
}

function StatCard({
  title,
  value,
  subtitle,
  trend,
  highlight = false
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { icon: string; color: string; text: string };
  highlight?: boolean;
}) {
  return (
    <td style={{
      backgroundColor: highlight ? colors.primary + '10' : colors.lightGray,
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      verticalAlign: 'top',
      border: highlight ? `2px solid ${colors.primary}` : 'none',
    }}>
      <Text style={{
        fontSize: '12px',
        color: colors.gray,
        margin: '0 0 4px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {title}
      </Text>
      <Text style={{
        fontSize: '28px',
        fontWeight: '700',
        color: highlight ? colors.primary : colors.dark,
        margin: '0',
      }}>
        {value}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: '12px', color: colors.gray, margin: '4px 0 0 0' }}>
          {subtitle}
        </Text>
      )}
      {trend && (
        <Text style={{
          fontSize: '12px',
          color: trend.color,
          margin: '8px 0 0 0',
          fontWeight: '600',
        }}>
          {trend.icon} {trend.text}
        </Text>
      )}
    </td>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      fontSize: '16px',
      fontWeight: '700',
      color: colors.secondary,
      margin: '32px 0 16px 0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: `2px solid ${colors.primary}`,
      paddingBottom: '8px',
    }}>
      {children}
    </Text>
  );
}

export default function AdminDailyReportEmail({
  stats,
  reportDate,
  dashboardUrl = 'https://datingassistent.nl/admin',
}: AdminDailyReportEmailProps) {
  const userTrend = getTrendIndicator(stats.newUsersToday, stats.newUsersYesterday);
  const revenueTrend = getTrendIndicator(stats.revenueToday, stats.revenueYesterday);
  const activeTrend = getTrendIndicator(stats.activeUsersToday, stats.activeUsersYesterday);

  // Calculate conversion rate
  const conversionRate = stats.newLeadsToday > 0
    ? ((stats.otoConversionsToday / stats.newLeadsToday) * 100)
    : 0;

  return (
    <BaseEmail preview={`Dagrapport ${reportDate}: ${stats.newUsersToday} nieuwe leden, ${formatCurrency(stats.revenueToday)} omzet`}>
      <SimpleHeader />

      <Section style={styles.content}>
        {/* Header */}
        <Text style={{
          ...styles.heading1,
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Dagelijks Management Rapport
        </Text>

        <Text style={{ ...styles.paragraph, fontSize: '14px' }}>
          Overzicht van <strong>{reportDate}</strong> - gegenereerd om {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {/* Quick Summary - The Most Important Numbers */}
        <Section style={{
          backgroundColor: colors.secondary,
          borderRadius: '16px',
          padding: '24px',
          margin: '24px 0',
        }}>
          <Text style={{
            color: colors.white,
            fontSize: '14px',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.8,
          }}>
            Vandaag in het kort
          </Text>

          <table width="100%" cellPadding="8" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Nieuwe leden:</td>
                <td style={{ color: colors.white, fontSize: '20px', fontWeight: '700', textAlign: 'right' }}>
                  {stats.newUsersToday} {userTrend.icon}
                </td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Omzet:</td>
                <td style={{ color: colors.white, fontSize: '20px', fontWeight: '700', textAlign: 'right' }}>
                  {formatCurrency(stats.revenueToday)} {revenueTrend.icon}
                </td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Actieve gebruikers:</td>
                <td style={{ color: colors.white, fontSize: '20px', fontWeight: '700', textAlign: 'right' }}>
                  {stats.activeUsersToday} {activeTrend.icon}
                </td>
              </tr>
              <tr>
                <td style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Hot leads:</td>
                <td style={{ color: colors.white, fontSize: '20px', fontWeight: '700', textAlign: 'right' }}>
                  {stats.hotLeadsToday} 🔥
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* New Users Section */}
        <SectionTitle>Nieuwe Leden</SectionTitle>

        <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <StatCard
                title="Vandaag"
                value={stats.newUsersToday}
                trend={userTrend}
                highlight={true}
              />
              <StatCard
                title="Gisteren"
                value={stats.newUsersYesterday}
              />
              <StatCard
                title="Deze week"
                value={stats.newUsersThisWeek}
              />
              <StatCard
                title="Deze maand"
                value={stats.newUsersThisMonth}
              />
            </tr>
          </tbody>
        </table>

        {/* Revenue Section */}
        <SectionTitle>Omzet</SectionTitle>

        <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <StatCard
                title="Vandaag"
                value={formatCurrency(stats.revenueToday)}
                trend={revenueTrend}
                highlight={true}
              />
              <StatCard
                title="Gisteren"
                value={formatCurrency(stats.revenueYesterday)}
              />
              <StatCard
                title="Deze week"
                value={formatCurrency(stats.revenueThisWeek)}
              />
              <StatCard
                title="Deze maand"
                value={formatCurrency(stats.revenueThisMonth)}
              />
            </tr>
          </tbody>
        </table>

        {/* Subscriptions */}
        <SectionTitle>Abonnementen</SectionTitle>

        <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <StatCard
                title="Actief totaal"
                value={stats.activeSubscriptions}
                highlight={true}
              />
              <StatCard
                title="Nieuw vandaag"
                value={stats.newSubscriptionsToday}
              />
              <StatCard
                title="Geannuleerd"
                value={stats.cancelledToday}
              />
              <StatCard
                title="Trial → Paid"
                value={stats.trialConversionsToday}
              />
            </tr>
          </tbody>
        </table>

        {/* Leads & Conversions */}
        <SectionTitle>Leads & Conversies</SectionTitle>

        <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <StatCard
                title="Nieuwe leads"
                value={stats.newLeadsToday}
              />
              <StatCard
                title="Hot leads"
                value={stats.hotLeadsToday}
                subtitle="🔥 Hoge conversiekans"
                highlight={stats.hotLeadsToday > 0}
              />
              <StatCard
                title="OTO Conversies"
                value={stats.otoConversionsToday}
              />
              <StatCard
                title="Conversie %"
                value={formatPercentage(conversionRate)}
              />
            </tr>
          </tbody>
        </table>

        {/* Engagement */}
        <SectionTitle>Engagement</SectionTitle>

        <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <StatCard
                title="Actieve users"
                value={stats.activeUsersToday}
                trend={activeTrend}
                highlight={true}
              />
              <StatCard
                title="AI Berichten"
                value={stats.totalAiMessages}
                subtitle="Vandaag"
              />
              <StatCard
                title="Tool gebruik"
                value={stats.totalToolUsage}
                subtitle="Vandaag"
              />
              <StatCard
                title="Churn risico"
                value={stats.highChurnRiskUsers}
                subtitle="Hoog risico"
              />
            </tr>
          </tbody>
        </table>

        {/* Email Performance */}
        <SectionTitle>Email Performance</SectionTitle>

        <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <StatCard
                title="Verzonden"
                value={stats.emailsSentToday}
              />
              <StatCard
                title="Open rate"
                value={formatPercentage(stats.emailOpenRate)}
              />
              <StatCard
                title="Click rate"
                value={formatPercentage(stats.emailClickRate)}
              />
            </tr>
          </tbody>
        </table>

        {/* Traffic (if available) */}
        {(stats.pageViewsToday || stats.uniqueVisitorsToday) && (
          <>
            <SectionTitle>Website Traffic</SectionTitle>

            <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
              <tbody>
                <tr>
                  {stats.uniqueVisitorsToday && (
                    <StatCard
                      title="Unieke bezoekers"
                      value={stats.uniqueVisitorsToday}
                      highlight={true}
                    />
                  )}
                  {stats.pageViewsToday && (
                    <StatCard
                      title="Pageviews"
                      value={stats.pageViewsToday}
                    />
                  )}
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Top Traffic Sources */}
        {stats.topTrafficSources && stats.topTrafficSources.length > 0 && (
          <>
            <Text style={{ ...styles.heading2, marginTop: '24px' }}>Top Traffic Bronnen</Text>

            <Section style={{
              backgroundColor: colors.lightGray,
              borderRadius: '12px',
              padding: '16px',
            }}>
              <table width="100%" cellPadding="8" cellSpacing="0">
                <tbody>
                  {stats.topTrafficSources.slice(0, 5).map((source, index) => (
                    <tr key={index}>
                      <td style={{
                        color: colors.dark,
                        fontSize: '14px',
                        borderBottom: index < stats.topTrafficSources!.length - 1 ? `1px solid ${colors.white}` : 'none',
                        padding: '8px 0',
                      }}>
                        {index + 1}. {source.source}
                      </td>
                      <td style={{
                        color: colors.primary,
                        fontSize: '14px',
                        fontWeight: '600',
                        textAlign: 'right',
                        borderBottom: index < stats.topTrafficSources!.length - 1 ? `1px solid ${colors.white}` : 'none',
                        padding: '8px 0',
                      }}>
                        {source.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </>
        )}

        {/* Technical / System Health */}
        <SectionTitle>Techniek & Systeem</SectionTitle>

        <table width="100%" cellPadding="8" cellSpacing="8" style={{ borderCollapse: 'separate' }}>
          <tbody>
            <tr>
              <StatCard
                title="API Errors"
                value={stats.apiErrorsToday}
                trend={getTrendIndicator(stats.apiErrorsYesterday, stats.apiErrorsToday)}
                highlight={stats.apiErrorsToday > 10}
              />
              <StatCard
                title="API Calls"
                value={stats.apiCallsToday}
                subtitle="Vandaag"
              />
              <StatCard
                title="Gem. Response"
                value={`${Math.round(stats.avgResponseTimeMs)}ms`}
                highlight={stats.avgResponseTimeMs > 2000}
              />
              <StatCard
                title="AI Kosten"
                value={`$${(stats.aiCostToday / 100).toFixed(2)}`}
                subtitle={`MTD: $${(stats.aiCostThisMonth / 100).toFixed(2)}`}
              />
            </tr>
          </tbody>
        </table>

        {/* Top Errors */}
        {stats.topErrors && stats.topErrors.length > 0 && (
          <Section style={{
            backgroundColor: '#fef2f2',
            border: `2px solid ${colors.error}`,
            borderRadius: '12px',
            padding: '16px',
            margin: '16px 0',
          }}>
            <Text style={{
              fontSize: '14px',
              fontWeight: '700',
              color: colors.error,
              margin: '0 0 12px 0',
            }}>
              🚨 Top Errors Vandaag
            </Text>
            <table width="100%" cellPadding="4" cellSpacing="0">
              <tbody>
                {stats.topErrors.slice(0, 5).map((error, index) => (
                  <tr key={index}>
                    <td style={{
                      color: colors.dark,
                      fontSize: '12px',
                      padding: '4px 0',
                      borderBottom: index < stats.topErrors!.length - 1 ? `1px solid #fecaca` : 'none',
                    }}>
                      <strong>{error.endpoint}</strong>
                      <br />
                      <span style={{ color: colors.gray, fontSize: '11px' }}>
                        {error.lastError.substring(0, 80)}{error.lastError.length > 80 ? '...' : ''}
                      </span>
                    </td>
                    <td style={{
                      color: colors.error,
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'right',
                      padding: '4px 0',
                      borderBottom: index < stats.topErrors!.length - 1 ? `1px solid #fecaca` : 'none',
                      verticalAlign: 'top',
                    }}>
                      {error.count}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        <Hr style={styles.divider} />

        {/* Action Items */}
        {(stats.highChurnRiskUsers > 5 || stats.hotLeadsToday > 0 || stats.cancelledToday > 2 || stats.apiErrorsToday > 10) && (
          <Section style={{
            backgroundColor: '#fef3c7',
            border: `2px solid ${colors.warning}`,
            borderRadius: '12px',
            padding: '20px',
            margin: '24px 0',
          }}>
            <Text style={{
              fontSize: '16px',
              fontWeight: '700',
              color: colors.dark,
              margin: '0 0 12px 0'
            }}>
              ⚠️ Actie nodig
            </Text>

            {stats.highChurnRiskUsers > 5 && (
              <Text style={{ fontSize: '14px', color: colors.dark, margin: '8px 0' }}>
                • <strong>{stats.highChurnRiskUsers} gebruikers</strong> met hoog churn risico - overweeg re-engagement campagne
              </Text>
            )}

            {stats.hotLeadsToday > 0 && (
              <Text style={{ fontSize: '14px', color: colors.dark, margin: '8px 0' }}>
                • <strong>{stats.hotLeadsToday} hot leads</strong> vandaag - follow-up binnen 24 uur aanbevolen
              </Text>
            )}

            {stats.cancelledToday > 2 && (
              <Text style={{ fontSize: '14px', color: colors.dark, margin: '8px 0' }}>
                • <strong>{stats.cancelledToday} annuleringen</strong> vandaag - check exit survey feedback
              </Text>
            )}

            {stats.apiErrorsToday > 10 && (
              <Text style={{ fontSize: '14px', color: colors.dark, margin: '8px 0' }}>
                • <strong>{stats.apiErrorsToday} API errors</strong> vandaag - check logs en monitoring
              </Text>
            )}
          </Section>
        )}

        <CTAButton href={dashboardUrl}>
          Open Admin Dashboard
        </CTAButton>

        <Text style={{ ...styles.paragraph, fontSize: '12px', color: colors.gray, textAlign: 'center' }}>
          Dit rapport wordt dagelijks om 08:00 verzonden naar info@datingassistent.nl
        </Text>
      </Section>

      <EmailFooter />
    </BaseEmail>
  );
}
