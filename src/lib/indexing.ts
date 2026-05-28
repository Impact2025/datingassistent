import { google } from 'googleapis'

export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!key || !siteUrl) {
    console.warn('[IndexNow] INDEXNOW_KEY of NEXT_PUBLIC_SITE_URL niet ingesteld, sla over')
    return
  }

  try {
    const host = new URL(siteUrl).hostname
    const keyLocation = `${siteUrl}/api/indexnow-key`

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
    })

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] ${urls.length} URL(s) ingediend:`, urls)
    } else {
      console.warn(`[IndexNow] Onverwachte status ${response.status}:`, await response.text())
    }
  } catch (error) {
    console.error('[IndexNow] Ping mislukt:', error)
  }
}

export async function pingGoogleIndexingAPI(url: string): Promise<void> {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

  if (!credentialsJson) {
    console.warn('[Google Indexing] GOOGLE_SERVICE_ACCOUNT_JSON niet ingesteld, sla over')
    return
  }

  try {
    const credentials = JSON.parse(credentialsJson) as Record<string, unknown>

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    })

    const indexing = google.indexing({ version: 'v3', auth })

    const result = await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' },
    })

    console.log(`[Google Indexing] URL ingediend: ${url}, status: ${result.status}`)
  } catch (error) {
    console.error('[Google Indexing] Ping mislukt:', error)
  }
}
