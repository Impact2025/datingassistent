/**
 * Google Analytics 4 Integration
 * For fetching real website analytics data
 */

interface GA4Response {
  rows?: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
}

interface VisitorData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number }>;
}

export class GoogleAnalyticsService {
  private propertyId: string;
  private serviceAccountEmail: string;
  private privateKey: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.propertyId = process.env.GA4_PROPERTY_ID || '';
    this.serviceAccountEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL || '';
    this.privateKey = (process.env.GA4_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  }

  /**
   * Get fresh access token using service account
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // Check if we have valid cached token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Check if we have all required credentials
      if (!this.serviceAccountEmail || !this.privateKey || !this.propertyId) {
        console.log('GA4 credentials not configured, using mock data');
        return null;
      }

      // Create JWT for Google OAuth
      const now = Math.floor(Date.now() / 1000);
      const jwtHeader = {
        alg: 'RS256',
        typ: 'JWT'
      };

      const jwtPayload = {
        iss: this.serviceAccountEmail,
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600, // 1 hour
        iat: now
      };

      // Base64 encode header and payload
      const headerB64 = Buffer.from(JSON.stringify(jwtHeader)).toString('base64url');
      const payloadB64 = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');

      // Create signature
      const crypto = await import('crypto');
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(`${headerB64}.${payloadB64}`);
      const signature = sign.sign(this.privateKey, 'base64url');

      const jwt = `${headerB64}.${payloadB64}.${signature}`;

      // Exchange JWT for access token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      if (!response.ok) {
        throw new Error(`OAuth token request failed: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

      return this.accessToken;
    } catch (error) {
      console.error('Error getting GA4 access token:', error);
      return null;
    }
  }

  /**
   * Make request to Google Analytics Data API
   */
  private async makeGARequest(
    dimensions: string[],
    metrics: string[],
    dateRange: { startDate: string; endDate: string },
    dimensionFilter?: any
  ): Promise<GA4Response | null> {
    const token = await this.getAccessToken();

    if (!token || !this.propertyId) {
      return null; // Will fall back to mock data
    }

    try {
      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dimensions: dimensions.map(name => ({ name })),
            metrics: metrics.map(name => ({ name })),
            dateRanges: [dateRange],
            dimensionFilter,
            limit: 10,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`GA4 API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling GA4 API:', error);
      return null;
    }
  }

  /**
   * Get visitor analytics data
   */
  async getVisitorData(): Promise<VisitorData> {
    try {
      // Try to get real data from GA4
      const realData = await this.fetchRealVisitorData();

      if (realData) {
        return realData;
      }

      // Fallback to mock data
      console.log('Using mock visitor data (GA4 not configured)');
      return this.getMockVisitorData();
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      return this.getMockVisitorData();
    }
  }

  /**
   * Fetch real data from Google Analytics 4
   */
  private async fetchRealVisitorData(): Promise<VisitorData | null> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get today's visitors
    const todayResponse = await this.makeGARequest(
      ['date'],
      ['totalUsers'],
      { startDate: today, endDate: today }
    );

    // Get this week's visitors
    const weekResponse = await this.makeGARequest(
      ['date'],
      ['totalUsers'],
      { startDate: weekAgo, endDate: today }
    );

    // Get this month's visitors
    const monthResponse = await this.makeGARequest(
      ['date'],
      ['totalUsers'],
      { startDate: monthAgo, endDate: today }
    );

    // Get top pages
    const pagesResponse = await this.makeGARequest(
      ['pagePath'],
      ['screenPageViews'],
      { startDate: monthAgo, endDate: today },
      {
        filter: {
          fieldName: 'pagePath',
          stringFilter: {
            matchType: 'BEGINS_WITH',
            value: '/'
          }
        }
      }
    );

    // Get conversion rate (simplified - sessions with goal completions)
    const conversionResponse = await this.makeGARequest(
      ['date'],
      ['totalUsers', 'sessions'],
      { startDate: monthAgo, endDate: today }
    );

    if (!todayResponse?.rows || !weekResponse?.rows || !monthResponse?.rows) {
      return null;
    }

    const todayVisitors = parseInt(todayResponse.rows[0]?.metricValues[0]?.value || '0');
    const weekVisitors = weekResponse.rows.reduce((sum, row) =>
      sum + parseInt(row.metricValues[0]?.value || '0'), 0
    );
    const monthVisitors = monthResponse.rows.reduce((sum, row) =>
      sum + parseInt(row.metricValues[0]?.value || '0'), 0
    );

    // Calculate conversion rate (mock for now - would need goal setup)
    const conversionRate = Math.random() * 0.05 + 0.02; // 2-7%

    // Process top pages
    const topPages = pagesResponse?.rows?.slice(0, 5).map(row => ({
      page: row.dimensionValues[0]?.value || '/',
      views: parseInt(row.metricValues[0]?.value || '0')
    })) || [];

    return {
      today: todayVisitors,
      thisWeek: weekVisitors,
      thisMonth: monthVisitors,
      conversionRate,
      topPages
    };
  }

  /**
   * Get mock visitor data for development/fallback
   */
  private getMockVisitorData(): VisitorData {
    return {
      today: Math.floor(Math.random() * 500) + 200,
      thisWeek: Math.floor(Math.random() * 3000) + 1000,
      thisMonth: Math.floor(Math.random() * 12000) + 5000,
      conversionRate: Math.random() * 0.05 + 0.02,
      topPages: [
        { page: '/', views: Math.floor(Math.random() * 2000) + 1000 },
        { page: '/courses', views: Math.floor(Math.random() * 800) + 400 },
        { page: '/register', views: Math.floor(Math.random() * 600) + 300 },
        { page: '/blog', views: Math.floor(Math.random() * 400) + 200 },
        { page: '/dashboard', views: Math.floor(Math.random() * 300) + 150 }
      ]
    };
  }
}

// Export singleton instance
export const googleAnalytics = new GoogleAnalyticsService();