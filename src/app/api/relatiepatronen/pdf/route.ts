import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import puppeteer from 'puppeteer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const userId = searchParams.get('userId');

    if (!assessmentId || !userId) {
      return NextResponse.json({ error: 'Assessment ID and User ID required' }, { status: 400 });
    }

    // Fetch assessment results
    const results = await sql`
      SELECT
        rpr.*,
        rpa.created_at,
        rpa.completed_at
      FROM relationship_patterns_results rpr
      JOIN relationship_patterns_assessments rpa ON rpr.assessment_id = rpa.id
      WHERE rpr.assessment_id = ${assessmentId} AND rpa.user_id = ${userId}
    `;

    if (results.rows.length === 0) {
      return NextResponse.json({ error: 'Assessment results not found' }, { status: 404 });
    }

    const result = results.rows[0];

    // Generate HTML for PDF
    const html = generatePDFHTML(result);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatiepatronen-resultaat-${assessmentId}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generatePDFHTML(result: any): string {
  const getPatternName = (pattern: string) => {
    const names: Record<string, string> = {
      idealize: 'Idealiseringslus',
      avoid_conflict: 'Conflictvermijding',
      rebound: 'Rebound Patroon',
      sabotage: 'Self-Sabotage',
      boundary_deficit: 'Boundary Deficit',
      role_expectation: 'Rol Verwachting',
      unavailable_preference: 'Onbereikbaarheid Voorkeur',
      validation_seeking: 'Validatie Zoeken'
    };
    return names[pattern] || pattern;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatiepatronen Resultaat</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ec4899, #f97316);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1f2937;
          margin: 10px 0;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
        }
        .confidence {
          display: inline-block;
          background: ${result.confidence >= 80 ? '#dcfce7' : result.confidence >= 60 ? '#fef3c7' : '#fee2e2'};
          color: ${result.confidence >= 80 ? '#166534' : result.confidence >= 60 ? '#92400e' : '#991b1b'};
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          margin: 15px 0;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }
        .primary-pattern {
          background: linear-gradient(135deg, #fce7f3, #fef3c7);
          border: 2px solid #ec4899;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }
        .pattern-name {
          font-size: 24px;
          font-weight: bold;
          color: #be185d;
          margin-bottom: 10px;
        }
        .pattern-description {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 15px;
        }
        .scores-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .score-item {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #ec4899;
        }
        .score-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 5px;
        }
        .score-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }
        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #ec4899, #f97316);
          border-radius: 4px;
        }
        .score-value {
          text-align: right;
          font-weight: 600;
          color: #6b7280;
          font-size: 14px;
        }
        .examples-list {
          background: #fefce8;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .example-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .example-number {
          width: 24px;
          height: 24px;
          background: #fbbf24;
          color: #92400e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
          margin-right: 10px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .interventions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .intervention-card {
          background: #ecfdf5;
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 15px;
        }
        .intervention-title {
          font-weight: bold;
          color: #065f46;
          margin-bottom: 8px;
        }
        .intervention-description {
          color: #047857;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .intervention-duration {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
        }
        .scripts-section {
          background: #eff6ff;
          border: 1px solid #3b82f6;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .script-item {
          margin-bottom: 15px;
        }
        .script-title {
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        .script-text {
          background: white;
          padding: 10px;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
          font-style: italic;
          color: #1e40af;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .date-info {
          background: #f3f4f6;
          padding: 10px;
          border-radius: 6px;
          margin: 15px 0;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💕</div>
        <h1 class="title">Jouw Relatiepatronen Analyse</h1>
        <p class="subtitle">Persoonlijke inzichten voor betere relaties</p>
        <div class="confidence">
          Betrouwbaarheid: ${result.confidence || 0}%
        </div>
        <div class="date-info">
          Assessment voltooid op ${formatDate(result.completed_at || result.created_at)}
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">🎯 Jouw Primaire Patroon</h2>
        <div class="primary-pattern">
          <div class="pattern-name">${result.ai_headline || 'Analyse Resultaat'}</div>
          <div class="pattern-description">${result.ai_one_liner || 'Jouw relatiepatroon analyse is voltooid.'}</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📊 Patroon Scores</h2>
        <div class="scores-grid">
          ${Object.entries({
            idealize: result.idealize_score || 0,
            avoid_conflict: result.avoid_conflict_score || 0,
            rebound: result.rebound_score || 0,
            sabotage: result.sabotage_score || 0,
            boundary_deficit: result.boundary_deficit_score || 0,
            role_expectation: result.role_expectation_score || 0,
            unavailable_preference: result.unavailable_preference_score || 0,
            validation_seeking: result.validation_seeking_score || 0
          }).map(([pattern, score]) => `
            <div class="score-item">
              <div class="score-label">${getPatternName(pattern)}</div>
              <div class="score-bar">
                <div class="score-fill" style="width: ${score}%"></div>
              </div>
              <div class="score-value">${Math.round(score)}%</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${result.pattern_examples && result.pattern_examples.length > 0 ? `
      <div class="section">
        <h2 class="section-title">💝 Hoe dit patroon zich uit in dating</h2>
        <div class="examples-list">
          ${result.pattern_examples.map((example: string, index: number) => `
            <div class="example-item">
              <div class="example-number">${index + 1}</div>
              <div>${example}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${result.micro_interventions ? `
      <div class="section">
        <h2 class="section-title">🎯 Direct Toepasbare Interventies</h2>
        <div class="interventions-grid">
          ${JSON.parse(result.micro_interventions).map((intervention: any) => `
            <div class="intervention-card">
              <div class="intervention-title">${intervention.title}</div>
              <div class="intervention-description">${intervention.description}</div>
              <div class="intervention-duration">${intervention.duration} dagen</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${result.conversation_scripts ? `
      <div class="section">
        <h2 class="section-title">💬 Conversation Scripts</h2>
        <div class="scripts-section">
          ${(() => {
            const scripts = JSON.parse(result.conversation_scripts);
            return `
              <div class="script-item">
                <div class="script-title">Boundary Setting</div>
                <div class="script-text">"${scripts.boundary}"</div>
              </div>
              <div class="script-item">
                <div class="script-title">Check-in</div>
                <div class="script-text">"${scripts.checkIn}"</div>
              </div>
              <div class="script-item">
                <div class="script-title">Post-date Reflectie</div>
                <div class="script-text">"${scripts.postDate}"</div>
              </div>
            `;
          })()}
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Belangrijke Opmerking:</strong></p>
        <p>Deze inzichten zijn bedoeld voor zelfreflectie en gedragsverandering.</p>
        <p>Bij ernstige relatieproblemen of trauma, raadpleeg een professionele hulpverlener.</p>
        <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
          Gegenereerd door Dating Assistent - ${new Date().toLocaleDateString('nl-NL')}
        </p>
      </div>
    </body>
    </html>
  `;
}