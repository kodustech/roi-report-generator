import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    let browser
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      const page = await browser.newPage()

      const html = generateHTML(data)

      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '1.5cm',
          right: '1.5cm',
          bottom: '1.5cm',
          left: '1.5cm'
        },
        printBackground: true,
        preferCSSPageSize: true
      })

      const fileName = `Kodus-Impacto-${data.companyName}-${new Date().toISOString().split('T')[0]}.pdf`

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      })
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generateHTML(data: any): string {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getHighlights = (): string[] => {
    if (data.highlights && data.highlights.length > 0 && data.highlights.some((h: string) => h.trim())) {
      return data.highlights.filter((h: string) => h.trim())
    }

    const autoHighlights: string[] = []

    if (data.implementationRatePct >= 40) {
      autoHighlights.push('Value signal: the team is applying suggestions in the merge flow.')
    }

    if (data.prsWithImplementedSuggestions > 0) {
      autoHighlights.push('Kodus already influenced real merges (PRs with registered action).')
    }

    if (data.impactCategories && data.impactCategories.length > 0) {
      const sortedCategories = [...data.impactCategories].sort((a: any, b: any) => b.count - a.count)
      const top2 = sortedCategories
        .slice(0, 2)
        .map((c: any) => c.label)
        .join(' and ')
      autoHighlights.push(`Main impact categories: ${top2}.`)
    }

    return autoHighlights.slice(0, 2)
  }

  const getNextSteps = (): string[] => {
    if (data.nextSteps && data.nextSteps.length > 0 && data.nextSteps.some((s: string) => s.trim())) {
      return data.nextSteps.filter((s: string) => s.trim())
    }

    return [
      'Reduce noise and focus on rules with higher return',
      'Define team baseline to standardize what is "must-fix"'
    ]
  }

  const highlights = getHighlights()
  const nextSteps = getNextSteps()
  const generatedAt = new Date().toLocaleDateString('pt-BR')

  const kodusLogoPath = join(process.cwd(), 'public', 'kodus_light.png')
  const kodusLogoBase64 = readFileSync(kodusLogoPath, 'base64')
  const kodusLogoDataUrl = `data:image/png;base64,${kodusLogoBase64}`

  const logoHtml = data.companyLogo
    ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="height: 64px; width: 64px; object-fit: contain;" />`
    : `<div style="height: 64px; width: 64px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: #4b5563; border-radius: 4px;">${getInitials(data.companyName)}</div>`

  const impactTableHtml = data.impactCategories && data.impactCategories.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 12px;">Impact by Category</h2>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #e5e7eb; background: #f3f4f6;">
                <th style="text-align: left; padding: 12px 16px; font-weight: 600; color: #374151;">Category</th>
                <th style="text-align: right; padding: 12px 16px; font-weight: 600; color: #374151;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${[...data.impactCategories]
                .sort((a: any, b: any) => b.count - a.count)
                .map((cat: any) => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px 16px;">${cat.label}</td>
                    <td style="padding: 12px 16px; text-align: right; font-weight: 500;">${cat.count}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
        <p style="font-size: 0.75rem; color: #6b7280; margin-top: 8px;">
          Automatic classification based on accepted/implemented suggestions.
        </p>
      </div>
    `
    : ''

  const highlightsHtml = highlights.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 12px;">Quick Read</h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${highlights.map((h: string) => `
            <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
              <span style="color: #2563eb; margin-top: 2px;">•</span>
              <span style="color: #374151;">${h}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : ''

  const nextStepsHtml = nextSteps.length > 0
    ? `
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 12px;">Next Level of Impact</h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${nextSteps.map((step: string) => `
            <li style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
              <span style="color: #2563eb; margin-top: 2px;">→</span>
              <span style="color: #374151;">${step}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `
    : ''

  return `
    <!DOCTYPE html>
    <html lang="en-US">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kodus Observed Impact - ${data.companyName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 11px;
          line-height: 1.5;
          color: #111827;
        }

        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm;
        }

        .header {
          border-bottom: 2px solid #111827;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .header-text h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .header-text .subtitle {
          color: #6b7280;
          margin-bottom: 8px;
        }

        .header-text .meta {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-card {
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .metric-card.highlight {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .metric-card:not(.highlight) {
          background: #f9fafb;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .footer {
          border-top: 2px solid #111827;
          padding-top: 16px;
          margin-top: 32px;
        }

        .footer p {
          margin-bottom: 4px;
        }

        .footer .cta-label {
          font-weight: 600;
        }

        .no-break {
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header no-break">
          <div class="header-content">
            ${logoHtml}
            <div class="header-text">
              <h1>Kodus Observed Impact</h1>
              <p class="subtitle">Based on real usage • ${data.reportPeriodLabel}</p>
              <p class="meta">${data.companyName}${data.generatedBy ? ` • Generated by ${data.generatedBy}` : ''}</p>
            </div>
          </div>
        </header>

        <div class="metrics-grid no-break">
          <div class="metric-card highlight">
            <div class="metric-label">Implemented suggestions</div>
            <div class="metric-value">${data.implementedSuggestionsCount}</div>
          </div>
          <div class="metric-card highlight">
            <div class="metric-label">Implementation rate</div>
            <div class="metric-value">${data.implementationRatePct}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">PRs analyzed</div>
            <div class="metric-value">${data.prsAnalyzed}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">PRs with Kodus action</div>
            <div class="metric-value">${data.prsWithImplementedSuggestions}</div>
          </div>
        </div>

        ${impactTableHtml}

        ${highlightsHtml}

        ${nextStepsHtml}

        <footer class="footer no-break">
          <p class="cta-label">We want to hear from you:</p>
          <p style="margin-bottom: 16px;">${data.ctaQuestion}</p>
          <div style="text-align: right;">
            <img
              src="${kodusLogoDataUrl}"
              alt="Kodus"
              style="height: 32px; opacity: 0.7;"
            />
          </div>
        </footer>
      </div>
    </body>
    </html>
  `
}
