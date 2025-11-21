/**
 * ENHANCED GA4 ANALYTICS SERVICE
 * Intelligent mock data generator for Google Analytics 4
 * Created: 2025-11-21
 * Author: Analytics & Data Specialist
 */

// Note: Real GA4 integration would require @google-analytics/data package
// For now, we provide intelligent mock data that mimics real analytics

export interface GA4Config {
  propertyId: string;
  credentials: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
  };
}

export interface VisitorData {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    pagePath: string;
    pageViews: number;
    uniqueViews: number;
  }>;
  trafficSources: Array<{
    source: string;
    medium: string;
    sessions: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    deviceCategory: string;
    sessions: number;
    percentage: number;
  }>;
  geographicData: Array<{
    country: string;
    region: string;
    sessions: number;
    percentage: number;
  }>;
  realtime: {
    activeUsers: number;
    topPages: Array<{
      pagePath: string;
      activeUsers: number;
    }>;
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export class EnhancedGA4Analytics {
  private configured: boolean = false;

  constructor(config?: GA4Config) {
    if (config) {
      this.configured = true;
      console.log('✅ GA4 configuration provided');
    } else {
      this.checkEnvironmentConfig();
    }
  }

  private checkEnvironmentConfig(): void {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const hasCredentials = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GA4_CREDENTIALS_JSON);

    if (propertyId && hasCredentials) {
      this.configured = true;
      console.log('✅ GA4 credentials configured');
    } else {
      console.log('⚠️  GA4 credentials not configured, using intelligent mock data');
    }
  }

  /**
   * Get visitor analytics data
   */
  async getVisitorData(dateRange: DateRange = this.getDefaultDateRange()): Promise<VisitorData> {
    // Always use intelligent mock data for now
    // In production, this would check if GA4 is configured and try real API calls
    return this.generateIntelligentMockData(dateRange);
  }

  /**
   * Generate intelligent mock data based on application patterns
   */
  private generateIntelligentMockData(dateRange: DateRange): VisitorData {
    const daysDiff = Math.ceil(
      (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    // Base metrics that scale with time period
    const baseMultiplier = Math.max(1, daysDiff / 7); // Weekly baseline

    // Generate realistic but varied data
    const totalVisitors = Math.floor((Math.random() * 2000 + 500) * baseMultiplier);
    const newVisitors = Math.floor(totalVisitors * (0.65 + Math.random() * 0.2)); // 65-85% new visitors
    const pageViews = Math.floor(totalVisitors * (2.5 + Math.random() * 1.5)); // 2.5-4 pages per visitor

    // Dutch dating app typical pages
    const typicalPages = [
      { path: '/', weight: 0.25 },
      { path: '/dashboard', weight: 0.20 },
      { path: '/login', weight: 0.15 },
      { path: '/register', weight: 0.10 },
      { path: '/profile-analysis', weight: 0.08 },
      { path: '/courses', weight: 0.07 },
      { path: '/community', weight: 0.06 },
      { path: '/contact', weight: 0.05 },
      { path: '/prijzen', weight: 0.03 },
      { path: '/over-ons', weight: 0.01 }
    ];

    const topPages = typicalPages.map(page => ({
      pagePath: page.path,
      pageViews: Math.floor(pageViews * page.weight * (0.8 + Math.random() * 0.4)),
      uniqueViews: Math.floor(totalVisitors * page.weight * (0.9 + Math.random() * 0.2))
    })).sort((a, b) => b.pageViews - a.pageViews);

    // Traffic sources typical for dating apps
    const trafficSources = [
      { source: 'google', medium: 'organic', baseWeight: 0.35 },
      { source: 'facebook', medium: 'social', baseWeight: 0.20 },
      { source: '(direct)', medium: '(none)', baseWeight: 0.15 },
      { source: 'instagram', medium: 'social', baseWeight: 0.12 },
      { source: 'bing', medium: 'organic', baseWeight: 0.08 },
      { source: 'tiktok', medium: 'social', baseWeight: 0.06 },
      { source: 'newsletter', medium: 'email', baseWeight: 0.04 }
    ].map(source => {
      const sessions = Math.floor(totalVisitors * source.baseWeight * (0.8 + Math.random() * 0.4));
      return {
        source: source.source,
        medium: source.medium,
        sessions,
        percentage: (sessions / totalVisitors) * 100
      };
    }).sort((a, b) => b.sessions - a.sessions);

    // Device breakdown
    const deviceBreakdown = [
      { deviceCategory: 'mobile', baseWeight: 0.65 },
      { deviceCategory: 'desktop', baseWeight: 0.30 },
      { deviceCategory: 'tablet', baseWeight: 0.05 }
    ].map(device => {
      const sessions = Math.floor(totalVisitors * device.baseWeight * (0.9 + Math.random() * 0.2));
      return {
        deviceCategory: device.deviceCategory,
        sessions,
        percentage: (sessions / totalVisitors) * 100
      };
    });

    // Geographic data (Netherlands-focused)
    const geographicData = [
      { country: 'Netherlands', baseWeight: 0.70 },
      { country: 'Belgium', baseWeight: 0.15 },
      { country: 'Germany', baseWeight: 0.08 },
      { country: 'United States', baseWeight: 0.03 },
      { country: 'United Kingdom', baseWeight: 0.02 },
      { country: 'France', baseWeight: 0.02 }
    ].map(geo => {
      const sessions = Math.floor(totalVisitors * geo.baseWeight * (0.8 + Math.random() * 0.4));
      return {
        country: geo.country,
        region: geo.country === 'Netherlands' ? 'North Holland' : '',
        sessions,
        percentage: (sessions / totalVisitors) * 100
      };
    }).sort((a, b) => b.sessions - a.sessions);

    return {
      totalVisitors,
      newVisitors,
      returningVisitors: totalVisitors - newVisitors,
      pageViews,
      avgSessionDuration: 180 + Math.random() * 120, // 3-5 minutes average
      bounceRate: 35 + Math.random() * 20, // 35-55% bounce rate
      topPages,
      trafficSources,
      deviceBreakdown,
      geographicData,
      realtime: {
        activeUsers: Math.floor(Math.random() * 25) + 5,
        topPages: topPages.slice(0, 3).map(page => ({
          pagePath: page.pagePath,
          activeUsers: Math.floor(Math.random() * 8) + 1
        }))
      }
    };
  }

  /**
   * Get default date range (last 30 days)
   */
  private getDefaultDateRange(): DateRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  /**
   * Check if GA4 is properly configured
   */
  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Get configuration status
   */
  getStatus(): {
    configured: boolean;
    hasCredentials: boolean;
  } {
    return {
      configured: this.configured,
      hasCredentials: this.configured
    };
  }
}

// Export singleton instance
export const ga4Analytics = new EnhancedGA4Analytics();

// Export utility functions
export function createGA4Analytics(config?: GA4Config): EnhancedGA4Analytics {
  return new EnhancedGA4Analytics(config);
}

export default ga4Analytics;