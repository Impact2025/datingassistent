const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';

function getAccessToken() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('WHATSAPP_ACCESS_TOKEN ontbreekt. Voeg deze toe aan de omgeving.');
  }
  return token;
}

function getPhoneNumberId() {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID ontbreekt. Voeg deze toe aan de omgeving.');
  }
  return id;
}

export interface SendWhatsAppMessageParams {
  to: string;
  text: string;
}

export async function sendWhatsAppTextMessage(params: SendWhatsAppMessageParams) {
  const accessToken = getAccessToken();
  const phoneNumberId = getPhoneNumberId();

  const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'text',
      text: {
        preview_url: false,
        body: params.text,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${response.status} ${error}`);
  }

  return response.json();
}
