import { sql } from '@vercel/postgres';
import { sendEmail } from './email-service';

export interface MonthlyReportEmail {
  userId: number;
  userEmail: string;
  userName: string;
  reportData: any;
  coachName?: string;
}

export interface WeeklyReviewEmail {
  userId: number;
  userEmail: string;
  userName: string;
  reviewData: any;
  coachName?: string;
}

export class EmailCoachService {
  /**
   * Send monthly AI report to client
   */
  static async sendMonthlyReport(emailData: MonthlyReportEmail): Promise<void> {
    try {
      const { userEmail, userName, reportData, coachName = 'Dating Coach' } = emailData;

      const subject = `Jouw Maandelijkse Dating Voortgang - ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`;

      const htmlContent = this.generateMonthlyReportHTML(userName, reportData, coachName);

      await sendEmail({
        to: userEmail,
        subject,
        html: htmlContent,
        from: 'coach@datingsassistent.nl'
      });

      console.log(`✅ Monthly report sent to ${userName} (${userEmail})`);

      // Track email sent
      await this.trackEmailSent(emailData.userId, 'monthly_report', subject);

    } catch (error) {
      console.error('❌ Error sending monthly report email:', error);
      throw error;
    }
  }

  /**
   * Send weekly AI review to client
   */
  static async sendWeeklyReview(emailData: WeeklyReviewEmail): Promise<void> {
    try {
      const { userEmail, userName, reviewData, coachName = 'Dating Coach' } = emailData;

      const subject = `Jouw Wekelijkse Dating Reflectie - Week ${this.getCurrentWeekNumber()}`;

      const htmlContent = this.generateWeeklyReviewHTML(userName, reviewData, coachName);

      await sendEmail({
        to: userEmail,
        subject,
        html: htmlContent,
        from: 'coach@datingsassistent.nl'
      });

      console.log(`✅ Weekly review sent to ${userName} (${userEmail})`);

      // Track email sent
      await this.trackEmailSent(emailData.userId, 'weekly_review', subject);

    } catch (error) {
      console.error('❌ Error sending weekly review email:', error);
      throw error;
    }
  }

  /**
   * Send coach notification email (to coach)
   */
  static async sendCoachNotification(
    coachEmail: string,
    coachName: string,
    notifications: any[]
  ): Promise<void> {
    try {
      const subject = `Coach Dashboard Update - ${notifications.length} nieuwe notificaties`;

      const htmlContent = this.generateCoachNotificationHTML(coachName, notifications);

      await sendEmail({
        to: coachEmail,
        subject,
        html: htmlContent,
        from: 'system@datingsassistent.nl'
      });

      console.log(`✅ Coach notification sent to ${coachName} (${coachEmail})`);

    } catch (error) {
      console.error('❌ Error sending coach notification email:', error);
      throw error;
    }
  }

  /**
   * Send all pending monthly reports to coach
   */
  static async sendAllPendingMonthlyReports(): Promise<void> {
    try {
      console.log('📧 Sending all pending monthly reports to coach...');

      // Get reports that haven't been emailed yet
      const pendingReports = await sql`
        SELECT
          mr.*,
          u.name as user_name,
          u.email as user_email
        FROM monthly_ai_reports mr
        JOIN users u ON mr.user_id = u.id
        WHERE mr.created_at >= CURRENT_DATE - INTERVAL '1 day'
        AND NOT EXISTS (
          SELECT 1 FROM email_tracking et
          WHERE et.user_id = mr.user_id
          AND et.email_type = 'monthly_report'
          AND et.sent_at >= CURRENT_DATE
        )
      `;

      if (pendingReports.rows.length === 0) {
        console.log('📧 No pending monthly reports to send');
        return;
      }

      // Send consolidated report to coach
      await this.sendMonthlyReportsToCoach(pendingReports.rows);

      // Mark all reports as sent
      for (const report of pendingReports.rows) {
        await this.trackEmailSent(report.user_id, 'monthly_report', `Monthly Report for ${report.user_name}`);
      }

      console.log(`✅ Sent consolidated monthly report with ${pendingReports.rows.length} client reports to coach`);

    } catch (error) {
      console.error('❌ Error sending pending monthly reports:', error);
      throw error;
    }
  }

  /**
   * Send all pending weekly reviews to coach
   */
  static async sendAllPendingWeeklyReviews(): Promise<void> {
    try {
      console.log('📧 Sending all pending weekly reviews to coach...');

      // Get reviews that haven't been emailed yet
      const pendingReviews = await sql`
        SELECT
          wr.*,
          u.name as user_name,
          u.email as user_email
        FROM weekly_ai_reviews wr
        JOIN users u ON wr.user_id = u.id
        WHERE wr.created_at >= CURRENT_DATE - INTERVAL '1 day'
        AND NOT EXISTS (
          SELECT 1 FROM email_tracking et
          WHERE et.user_id = wr.user_id
          AND et.email_type = 'weekly_review'
          AND et.sent_at >= CURRENT_DATE
        )
      `;

      if (pendingReviews.rows.length === 0) {
        console.log('📧 No pending weekly reviews to send');
        return;
      }

      // Send consolidated report to coach
      await this.sendWeeklyReviewsToCoach(pendingReviews.rows);

      // Mark all reviews as sent
      for (const review of pendingReviews.rows) {
        await this.trackEmailSent(review.user_id, 'weekly_review', `Weekly Review for ${review.user_name}`);
      }

      console.log(`✅ Sent consolidated weekly review with ${pendingReviews.rows.length} client reviews to coach`);

    } catch (error) {
      console.error('❌ Error sending pending weekly reviews:', error);
      throw error;
    }
  }

  // HTML Email Templates
  private static generateMonthlyReportHTML(userName: string, reportData: any, coachName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jouw Maandelijkse Dating Rapport</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .section { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
          .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
          .success { color: #28a745; }
          .warning { color: #ffc107; }
          .danger { color: #dc3545; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; border-top: 1px solid #dee2e6; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Jouw Maandelijkse Dating Rapport</h1>
            <p>Hoi ${userName}, hier is je persoonlijke voortgangsoverzicht!</p>
          </div>

          <div class="content">
            <div class="section">
              <h2>🎯 Voortgang Overzicht</h2>
              <div style="text-align: center; margin: 20px 0;">
                <div class="metric">
                  <div style="font-size: 2em; font-weight: bold; color: #667eea;">${reportData.goals_achieved?.length || 0}/${(reportData.goals_achieved?.length || 0) + (reportData.goals_missed?.length || 0)}</div>
                  <div>Doelen Behaald</div>
                </div>
                <div class="metric">
                  <div style="font-size: 2em; font-weight: bold; color: #28a745;">${reportData.actions_completed || 0}</div>
                  <div>Acties Uitgevoerd</div>
                </div>
                <div class="metric">
                  <div style="font-size: 2em; font-weight: bold; color: #ffc107;">${reportData.consistency_score || 0}/10</div>
                  <div>Consistentie Score</div>
                </div>
              </div>
            </div>

            ${reportData.success_highlights?.length > 0 ? `
            <div class="section">
              <h2>✨ Jouw Successen Deze Maand</h2>
              <ul>
                ${reportData.success_highlights.map((success: string) => `<li>${success}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${reportData.improvement_areas?.length > 0 ? `
            <div class="section">
              <h2>🎯 Verbeterpunten & Focus</h2>
              <p><strong>Deze maand focussen we op:</strong> ${reportData.recommended_focus || 'Verdere groei en consistentie'}</p>
              <ul>
                ${reportData.improvement_areas.map((area: string) => `<li>${area}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            ${reportData.suggested_next_goal ? `
            <div class="section">
              <h2>🚀 Voorgesteld Volgend Doel</h2>
              <p style="font-size: 1.1em; color: #667eea;"><strong>${reportData.suggested_next_goal}</strong></p>
              <p>Laten we dit samen aanpakken! Neem contact op als je vragen hebt.</p>
            </div>
            ` : ''}

            <div class="section">
              <h2>💬 Persoonlijke Notitie van ${coachName}</h2>
              <p>${reportData.ai_insights || 'Geweldig werk deze maand! Blijf zo doorgaan en je zult zien dat dating steeds makkelijker wordt.'}</p>
              <p>Ik ben trots op je voortgang en kijk ernaar uit om je volgende successen te zien! 💪</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://datingsassistent.nl'}/dashboard" class="button">
                📱 Naar Mijn Dashboard
              </a>
            </div>
          </div>

          <div class="footer">
            <p>❤️ Met vriendelijke groet,<br><strong>${coachName}</strong></p>
            <p style="font-size: 0.9em; color: #888;">
              Dit rapport is automatisch gegenereerd op basis van je activiteit.<br>
              Vragen? Reageer gewoon op deze email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateWeeklyReviewHTML(userName: string, reviewData: any, coachName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jouw Wekelijkse Dating Reflectie</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .section { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
          .energy-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
          .energy-fill { height: 100%; background: linear-gradient(90deg, #28a745, #ffc107, #dc3545); border-radius: 10px; }
          .suggestion { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 3px solid #28a745; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; border-top: 1px solid #dee2e6; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Jouw Wekelijkse Reflectie</h1>
            <p>Hoi ${userName}, hoe ging het deze week?</p>
          </div>

          <div class="content">
            <div class="section">
              <h2>📊 Jouw Energie & Motivatie</h2>
              <p><strong>Energie niveau:</strong> ${reviewData.energy_level || 7}/10</p>
              <div class="energy-bar">
                <div class="energy-fill" style="width: ${(reviewData.energy_level || 7) * 10}%"></div>
              </div>
              <p><strong>Motivatie niveau:</strong> ${reviewData.motivation_level || 7}/10</p>
              <div class="energy-bar">
                <div class="energy-fill" style="width: ${(reviewData.motivation_level || 7) * 10}%"></div>
              </div>
            </div>

            <div class="section">
              <h2>💭 AI Analyse van Jouw Week</h2>
              <p>${reviewData.ai_summary || 'Deze week liet zien dat je actief bezig bent met je dating doelen. Goed werk!'}</p>
            </div>

            ${reviewData.ai_suggestions?.length > 0 ? `
            <div class="section">
              <h2>💡 Concrete Suggesties</h2>
              ${reviewData.ai_suggestions.map((suggestion: string) => `
                <div class="suggestion">
                  <p>${suggestion}</p>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${reviewData.micro_goals?.length > 0 ? `
            <div class="section">
              <h2>🎯 Micro Doelen voor Komende Week</h2>
              <ul>
                ${reviewData.micro_goals.map((goal: string) => `<li>${goal}</li>`).join('')}
              </ul>
            </div>
            ` : ''}

            <div class="section">
              <h2>❤️ Bemoedigende Woorden</h2>
              <p style="font-style: italic; color: #667eea;">
                ${reviewData.encouragement_message || 'Je doet het geweldig! Elke stap die je zet brengt je dichter bij je dating doelen. Blijf geloven in jezelf! 💪'}
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://datingsassistent.nl'}/dashboard" class="button">
                📱 Naar Mijn Dashboard
              </a>
            </div>
          </div>

          <div class="footer">
            <p>🤗 Met warme groet,<br><strong>${coachName}</strong></p>
            <p style="font-size: 0.9em; color: #888;">
              Deze reflectie is gebaseerd op je wekelijkse input.<br>
              Deel je gedachten gerust met me!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateCoachNotificationHTML(coachName: string, notifications: any[]): string {
    return `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Coach Dashboard Update</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .notification { margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
          .urgent { border-left-color: #dc3545; background: #fff5f5; }
          .high { border-left-color: #ffc107; background: #fffbf0; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
          .urgent-badge { background: #dc3545; color: white; }
          .high-badge { background: #ffc107; color: black; }
          .medium-badge { background: #17a2b8; color: white; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; border-top: 1px solid #dee2e6; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Coach Dashboard Update</h1>
            <p>Hoi ${coachName}, er zijn ${notifications.length} nieuwe notificaties voor je aandacht.</p>
          </div>

          <div class="content">
            ${notifications.map(notification => `
              <div class="notification ${notification.priority === 'urgent' ? 'urgent' : notification.priority === 'high' ? 'high' : ''}">
                <div style="margin-bottom: 10px;">
                  <span class="badge ${notification.priority}-badge">${notification.priority.toUpperCase()}</span>
                  <strong>${notification.userName}</strong> - ${notification.type}
                </div>
                <h3 style="margin: 10px 0; color: #667eea;">${notification.title}</h3>
                <p>${notification.message}</p>
                ${notification.suggestedActions?.length > 0 ? `
                  <div style="margin-top: 15px;">
                    <strong>Suggested Actions:</strong>
                    <ul>
                      ${notification.suggestedActions.map((action: string) => `<li>${action}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://datingsassistent.nl'}/admin/coach" class="button">
                👁️ Naar Coach Dashboard
              </a>
            </div>
          </div>

          <div class="footer">
            <p>🤖 Automatisch gegenereerd door het AI Coach Systeem</p>
            <p style="font-size: 0.9em; color: #888;">
              Deze notificaties zijn gebaseerd op real-time analyse van je cliënten.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateConsolidatedMonthlyReportsHTML(reports: any[], coachName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Maandelijkse AI Rapporten - Alle Cliënten</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 800px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .client-report { margin-bottom: 30px; padding: 25px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
          .client-header { display: flex; justify-between; align-items: center; margin-bottom: 15px; }
          .client-name { font-size: 1.2em; font-weight: bold; color: #667eea; }
          .client-email { color: #666; font-size: 0.9em; }
          .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
          .metric { background: white; padding: 15px; border-radius: 6px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-value { font-size: 1.5em; font-weight: bold; color: #667eea; }
          .metric-label { font-size: 0.8em; color: #666; text-transform: uppercase; }
          .insights { margin-top: 15px; }
          .insights h4 { color: #667eea; margin-bottom: 10px; }
          .insights ul { margin: 0; padding-left: 20px; }
          .insights li { margin-bottom: 5px; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; border-top: 1px solid #dee2e6; }
          .summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #dee2e6; }
          .summary h3 { color: #667eea; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Maandelijkse AI Rapporten</h1>
            <p>Hoi ${coachName}, hier zijn de voortgangsrapporten van al je cliënten deze maand.</p>
            <p style="font-size: 1.1em; margin-top: 10px;">📈 Totaal: ${reports.length} cliënt${reports.length !== 1 ? 'en' : ''}</p>
          </div>

          <div class="content">
            <div class="summary">
              <h3>📈 Overzicht Deze Maand</h3>
              <div class="metric-grid">
                <div class="metric">
                  <div class="metric-value">${reports.reduce((sum, r) => sum + (r.goals_achieved?.length || 0), 0)}</div>
                  <div class="metric-label">Totaal Doelen Behaald</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${reports.reduce((sum, r) => sum + (r.actions_completed || 0), 0)}</div>
                  <div class="metric-label">Totaal Acties Uitgevoerd</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${Math.round(reports.reduce((sum, r) => sum + (r.consistency_score || 0), 0) / reports.length) || 0}/10</div>
                  <div class="metric-label">Gemiddelde Consistentie</div>
                </div>
              </div>
            </div>

            ${reports.map(report => `
              <div class="client-report">
                <div class="client-header">
                  <div>
                    <div class="client-name">${report.user_name}</div>
                    <div class="client-email">${report.user_email}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.2em; font-weight: bold; color: #28a745;">
                      ${report.goals_achieved?.length || 0}/${(report.goals_achieved?.length || 0) + (report.goals_missed?.length || 0)}
                    </div>
                    <div style="font-size: 0.8em; color: #666;">Doelen Behaald</div>
                  </div>
                </div>

                <div class="metric-grid">
                  <div class="metric">
                    <div class="metric-value">${report.actions_completed || 0}</div>
                    <div class="metric-label">Acties Uitgevoerd</div>
                  </div>
                  <div class="metric">
                    <div class="metric-value">${report.consistency_score || 0}/10</div>
                    <div class="metric-label">Consistentie Score</div>
                  </div>
                </div>

                ${report.success_highlights?.length > 0 ? `
                  <div class="insights">
                    <h4>✨ Successen</h4>
                    <ul>
                      ${report.success_highlights.map((success: string) => `<li>${success}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                ${report.improvement_areas?.length > 0 ? `
                  <div class="insights">
                    <h4>🎯 Verbeterpunten</h4>
                    <ul>
                      ${report.improvement_areas.map((area: string) => `<li>${area}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                ${report.ai_insights ? `
                  <div class="insights">
                    <h4>🤖 AI Analyse</h4>
                    <p style="margin: 0; font-style: italic;">${report.ai_insights}</p>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>🤖 Automatisch gegenereerd door het AI Coach Systeem</p>
            <p style="font-size: 0.9em; color: #888;">
              Deze rapporten zijn gebaseerd op de activiteit van je cliënten in ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private static generateConsolidatedWeeklyReviewsHTML(reviews: any[], coachName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wekelijkse AI Reviews - Alle Cliënten</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 800px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .client-review { margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; }
          .client-header { display: flex; justify-between; align-items: center; margin-bottom: 15px; }
          .client-name { font-size: 1.1em; font-weight: bold; color: #667eea; }
          .client-email { color: #666; font-size: 0.9em; }
          .energy-section { margin: 15px 0; }
          .energy-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 5px 0; }
          .energy-fill { height: 100%; background: linear-gradient(90deg, #28a745, #ffc107, #dc3545); border-radius: 10px; }
          .insights { margin-top: 15px; }
          .insights h4 { color: #667eea; margin-bottom: 10px; }
          .insights ul { margin: 0; padding-left: 20px; }
          .insights li { margin-bottom: 5px; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; border-top: 1px solid #dee2e6; }
          .summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #dee2e6; }
          .summary h3 { color: #667eea; margin-bottom: 15px; }
          .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 15px 0; }
          .metric { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
          .metric-value { font-size: 1.3em; font-weight: bold; color: #667eea; }
          .metric-label { font-size: 0.8em; color: #666; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Wekelijkse AI Reviews</h1>
            <p>Hoi ${coachName}, hier zijn de wekelijkse reflecties van al je cliënten.</p>
            <p style="font-size: 1.1em; margin-top: 10px;">📋 Totaal: ${reviews.length} cliënt${reviews.length !== 1 ? 'en' : ''} - Week ${this.getCurrentWeekNumber()}</p>
          </div>

          <div class="content">
            <div class="summary">
              <h3>📊 Overzicht Deze Week</h3>
              <div class="metric-grid">
                <div class="metric">
                  <div class="metric-value">${Math.round(reviews.reduce((sum, r) => sum + (r.energy_level || 0), 0) / reviews.length) || 0}/10</div>
                  <div class="metric-label">Gem. Energie</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${Math.round(reviews.reduce((sum, r) => sum + (r.motivation_level || 0), 0) / reviews.length) || 0}/10</div>
                  <div class="metric-label">Gem. Motivatie</div>
                </div>
                <div class="metric">
                  <div class="metric-value">${reviews.reduce((sum, r) => sum + (r.micro_goals?.length || 0), 0)}</div>
                  <div class="metric-label">Totaal Micro Doelen</div>
                </div>
              </div>
            </div>

            ${reviews.map(review => `
              <div class="client-review">
                <div class="client-header">
                  <div>
                    <div class="client-name">${review.user_name}</div>
                    <div class="client-email">${review.user_email}</div>
                  </div>
                </div>

                <div class="energy-section">
                  <div><strong>Energie niveau:</strong> ${review.energy_level || 0}/10</div>
                  <div class="energy-bar">
                    <div class="energy-fill" style="width: ${(review.energy_level || 0) * 10}%"></div>
                  </div>
                  <div><strong>Motivatie niveau:</strong> ${review.motivation_level || 0}/10</div>
                  <div class="energy-bar">
                    <div class="energy-fill" style="width: ${(review.motivation_level || 0) * 10}%"></div>
                  </div>
                </div>

                ${review.ai_summary ? `
                  <div class="insights">
                    <h4>🤖 AI Analyse</h4>
                    <p style="margin: 0; font-style: italic;">${review.ai_summary}</p>
                  </div>
                ` : ''}

                ${review.ai_suggestions?.length > 0 ? `
                  <div class="insights">
                    <h4>💡 Suggesties</h4>
                    <ul>
                      ${review.ai_suggestions.map((suggestion: string) => `<li>${suggestion}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                ${review.micro_goals?.length > 0 ? `
                  <div class="insights">
                    <h4>🎯 Micro Doelen</h4>
                    <ul>
                      ${review.micro_goals.map((goal: string) => `<li>${goal}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                ${review.encouragement_message ? `
                  <div class="insights">
                    <h4>❤️ Bemoediging</h4>
                    <p style="margin: 0; font-style: italic; color: #667eea;">${review.encouragement_message}</p>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <div class="footer">
            <p>🤖 Automatisch gegenereerd door het AI Coach Systeem</p>
            <p style="font-size: 0.9em; color: #888;">
              Deze reviews zijn gebaseerd op de wekelijkse input van je cliënten - Week ${this.getCurrentWeekNumber()}.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send consolidated monthly reports to coach
   */
  private static async sendMonthlyReportsToCoach(reports: any[]): Promise<void> {
    const coachEmail = 'info@datingassistent.nl';
    const coachName = 'Dating Coach';

    const subject = `📊 Maandelijkse AI Rapporten - ${reports.length} Cliënten - ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`;

    const htmlContent = this.generateConsolidatedMonthlyReportsHTML(reports, coachName);

    await sendEmail({
      to: coachEmail,
      subject,
      html: htmlContent,
      from: 'system@datingsassistent.nl'
    });

    console.log(`✅ Consolidated monthly reports sent to coach (${coachEmail})`);
  }

  /**
   * Send consolidated weekly reviews to coach
   */
  private static async sendWeeklyReviewsToCoach(reviews: any[]): Promise<void> {
    const coachEmail = 'info@datingassistent.nl';
    const coachName = 'Dating Coach';

    const subject = `📝 Wekelijkse AI Reviews - ${reviews.length} Cliënten - Week ${this.getCurrentWeekNumber()}`;

    const htmlContent = this.generateConsolidatedWeeklyReviewsHTML(reviews, coachName);

    await sendEmail({
      to: coachEmail,
      subject,
      html: htmlContent,
      from: 'system@datingsassistent.nl'
    });

    console.log(`✅ Consolidated weekly reviews sent to coach (${coachEmail})`);
  }

  // Helper methods
  private static async trackEmailSent(userId: number, emailType: string, subject: string): Promise<void> {
    try {
      await sql`
        INSERT INTO email_tracking (user_id, email_type, subject, sent_at)
        VALUES (${userId}, ${emailType}, ${subject}, CURRENT_TIMESTAMP)
      `;
    } catch (error) {
      console.error('Error tracking email sent:', error);
    }
  }

  private static getCurrentWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }
}