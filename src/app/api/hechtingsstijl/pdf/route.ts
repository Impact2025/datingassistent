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
        hr.*,
        ha.created_at,
        ha.completed_at,
        ha.dating_fase,
        ha.laatste_relatie_recent,
        ha.stress_niveau
      FROM hechtingsstijl_results hr
      JOIN hechtingsstijl_assessments ha ON hr.assessment_id = ha.id
      WHERE hr.assessment_id = ${assessmentId} AND ha.user_id = ${userId}
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
        'Content-Disposition': `attachment; filename="hechtingsstijl-resultaat-${assessmentId}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generatePDFHTML(result: any): string {
  const getStyleName = (style: string) => {
    const names: Record<string, string> = {
      veilig: 'Veilig Hechting',
      angstig: 'Angstig Hechting',
      vermijdend: 'Vermijdend Hechting',
      angstig_vermijdend: 'Angstig-Vermijdend Hechting'
    };
    return names[style] || style;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStressLevel = (level: number) => {
    const levels = ['Laag', 'Gemiddeld', 'Hoog', 'Zeer Hoog', 'Extreem Hoog'];
    return levels[level - 1] || 'Onbekend';
  };

  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hechtingsstijl Resultaat</title>
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
        .profiel-summary {
          background: linear-gradient(135deg, #fce7f3, #fef3c7);
          border: 2px solid #ec4899;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .profiel-text {
          font-size: 18px;
          font-weight: bold;
          color: #be185d;
          margin-bottom: 10px;
        }
        .interpretatie {
          font-size: 16px;
          color: #4b5563;
          font-style: italic;
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
        .triggers-list {
          background: #fef2f2;
          border: 1px solid #f87171;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .trigger-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .trigger-bullet {
          width: 8px;
          height: 8px;
          background: #f87171;
          border-radius: 50%;
          margin-right: 10px;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .strategieen-list {
          background: #f0fdf4;
          border: 1px solid #4ade80;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .strategie-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .strategie-bullet {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          margin-right: 10px;
          margin-top: 6px;
          flex-shrink: 0;
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
        .intervention-steps {
          color: #065f46;
          font-size: 13px;
          line-height: 1.4;
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
          font-size: 14px;
        }
        .tools-section {
          background: #f3f4f6;
          border: 1px solid #9ca3af;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        }
        .tool-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .tool-name {
          font-weight: 600;
          color: #374151;
          margin-right: 10px;
        }
        .tool-reason {
          color: #6b7280;
          font-size: 14px;
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
        .context-info {
          background: #f9fafb;
          padding: 12px;
          border-radius: 6px;
          margin: 15px 0;
          border-left: 4px solid #6b7280;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💕</div>
        <h1 class="title">Jouw Hechtingsstijl Analyse</h1>
        <p class="subtitle">Snelle, moderne inzichten voor beter daten</p>
        <div class="date-info">
          Assessment voltooid op ${formatDate(result.completed_at || result.created_at)}
        </div>
        ${result.dating_fase || result.stress_niveau ? `
        <div class="context-info">
          <strong>Context:</strong>
          ${result.dating_fase ? ` Dating fase: ${result.dating_fase}` : ''}
          ${result.laatste_relatie_recent !== null ? ` • Recente relatie: ${result.laatste_relatie_recent ? 'Ja' : 'Nee'}` : ''}
          ${result.stress_niveau ? ` • Stress niveau: ${getStressLevel(result.stress_niveau)}` : ''}
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h2 class="section-title">🎯 Jouw Hechtingsprofiel</h2>
        <div class="profiel-summary">
          <div class="profiel-text">${result.ai_profiel || 'Jouw hechtingsstijl analyse'}</div>
          <div class="interpretatie">${result.toekomstgerichte_interpretatie || 'Persoonlijke inzichten voor bewuster daten.'}</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📊 Hechtingsstijl Scores</h2>
        <div class="scores-grid">
          <div class="score-item">
            <div class="score-label">Veilig Hechting</div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${result.veilig_score || 0}%"></div>
            </div>
            <div class="score-value">${Math.round(result.veilig_score || 0)}%</div>
          </div>
          <div class="score-item">
            <div class="score-label">Angstig Hechting</div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${result.angstig_score || 0}%"></div>
            </div>
            <div class="score-value">${Math.round(result.angstig_score || 0)}%</div>
          </div>
          <div class="score-item">
            <div class="score-label">Vermijdend Hechting</div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${result.vermijdend_score || 0}%"></div>
            </div>
            <div class="score-value">${Math.round(result.vermijdend_score || 0)}%</div>
          </div>
          <div class="score-item">
            <div class="score-label">Angstig-Vermijdend</div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${result.angstig_vermijdend_score || 0}%"></div>
            </div>
            <div class="score-value">${Math.round(result.angstig_vermijdend_score || 0)}%</div>
          </div>
        </div>
      </div>

      ${result.dating_voorbeelden && result.dating_voorbeelden.length > 0 ? `
      <div class="section">
        <h2 class="section-title">💝 Hoe dit zich uit in modern daten</h2>
        <div class="examples-list">
          ${result.dating_voorbeelden.map((voorbeeld: string, index: number) => `
            <div class="example-item">
              <div class="example-number">${index + 1}</div>
              <div>${voorbeeld}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${result.triggers && result.triggers.length > 0 ? `
      <div class="section">
        <h2 class="section-title">🚨 Triggers & Herkenning</h2>
        <div class="triggers-list">
          ${result.triggers.map((trigger: string) => `
            <div class="trigger-item">
              <div class="trigger-bullet"></div>
              <div>${trigger}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${result.herstel_strategieen && result.herstel_strategieen.length > 0 ? `
      <div class="section">
        <h2 class="section-title">🌱 Herstelstrategieën</h2>
        <div class="strategieen-list">
          ${result.herstel_strategieen.map((strategie: string) => `
            <div class="strategie-item">
              <div class="strategie-bullet"></div>
              <div>${strategie}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${result.micro_interventies ? `
      <div class="section">
        <h2 class="section-title">🎯 3 Micro-Interventies</h2>
        <div class="interventions-grid">
          ${(() => {
            try {
              const interventions = typeof result.micro_interventies === 'string'
                ? JSON.parse(result.micro_interventies)
                : result.micro_interventies;

              return Object.entries(interventions).map(([key, intervention]: [string, any]) => `
                <div class="intervention-card">
                  <div class="intervention-title">${intervention.titel || key}</div>
                  <div class="intervention-description">${intervention.beschrijving || intervention.description || ''}</div>
                  ${intervention.stappen ? `
                  <div class="intervention-steps">
                    ${Array.isArray(intervention.stappen)
                      ? intervention.stappen.map((stap: string, i: number) => `${i + 1}. ${stap}`).join('<br>')
                      : intervention.stappen
                    }
                  </div>
                  ` : ''}
                </div>
              `).join('');
            } catch (e) {
              return '<div class="intervention-card"><div class="intervention-title">Interventies beschikbaar</div></div>';
            }
          })()}
        </div>
      </div>
      ` : ''}

      ${result.gesprek_scripts ? `
      <div class="section">
        <h2 class="section-title">💬 Conversation Scripts</h2>
        <div class="scripts-section">
          ${(() => {
            try {
              const scripts = typeof result.gesprek_scripts === 'string'
                ? JSON.parse(result.gesprek_scripts)
                : result.gesprek_scripts;

              return `
                ${scripts.inconsistent_reageren ? `
                <div class="script-item">
                  <div class="script-title">Bij inconsistent reageren</div>
                  <div class="script-text">"${scripts.inconsistent_reageren}"</div>
                </div>
                ` : ''}
                ${scripts.ruimte_nodig ? `
                <div class="script-item">
                  <div class="script-title">Ruimte nodig</div>
                  <div class="script-text">"${scripts.ruimte_nodig}"</div>
                </div>
                ` : ''}
                ${scripts.grenzen ? `
                <div class="script-item">
                  <div class="script-title">Grenzen stellen</div>
                  <div class="script-text">"${scripts.grenzen}"</div>
                </div>
                ` : ''}
              `;
            } catch (e) {
              return '<div class="script-item"><div class="script-title">Scripts beschikbaar in je dashboard</div></div>';
            }
          })()}
        </div>
      </div>
      ` : ''}

      ${result.recommended_tools ? `
      <div class="section">
        <h2 class="section-title">🔗 Aanbevolen Tools</h2>
        <div class="tools-section">
          ${(() => {
            try {
              const tools = typeof result.recommended_tools === 'string'
                ? JSON.parse(result.recommended_tools)
                : result.recommended_tools;

              return tools.map((tool: any) => `
                <div class="tool-item">
                  <span class="tool-name">${tool.name || 'Tool'}</span>
                  <span class="tool-reason">${tool.reason || 'Integratie beschikbaar'}</span>
                </div>
              `).join('');
            } catch (e) {
              return '<div class="tool-item"><span class="tool-name">Tools beschikbaar in dashboard</span></div>';
            }
          })()}
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Belangrijke Opmerking:</strong></p>
        <p>Dit is een moderne, consumentenversie van hechtingstheorie voor zelfbewustzijn.</p>
        <p>Geen klinische diagnose — wel praktische inzichten voor beter daten.</p>
        <p>Bij ernstige relatieproblemen, raadpleeg een professionele hulpverlener.</p>
        <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
          Gegenereerd door Dating Assistent - ${new Date().toLocaleDateString('nl-NL')}
        </p>
      </div>
    </body>
    </html>
  `;
}