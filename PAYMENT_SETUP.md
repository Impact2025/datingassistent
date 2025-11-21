# MultiSafePay Betaling Integratie

## Overzicht

DatingAssistent gebruikt MultiSafePay voor betalingsverwerking. Gebruikers moeten betalen voordat ze toegang krijgen tot de app.

## Flow

1. **Registratie** → Gebruiker maakt account aan (`/register`)
2. **Pakket Selectie** → Kiest pakket en betaalperiode (`/select-package`)
3. **Betaling** → Wordt doorgestuurd naar MultiSafePay
4. **Success** → Na betaling: redirect naar `/payment/success`
5. **Dashboard** → Toegang tot app features

## Setup

### 1. MultiSafePay Account

1. Ga naar [MultiSafePay Merchant Portal](https://merchant.multisafepay.com/)
2. Maak een account aan (of log in)
3. Ga naar **Settings** → **API Key**
4. Kopieer je API key

### 2. Environment Variables

Update `.env.local`:

```bash
# MultiSafePay Configuration
MSP_API_KEY=jouw_multisafepay_api_key
NEXT_PUBLIC_MSP_TEST_MODE=true  # false voor productie
NEXT_PUBLIC_BASE_URL=http://localhost:9002  # of je productie URL
```

### 3. Test Mode

Voor development gebruik je de **test API**:
- Test API URL: `https://testapi.multisafepay.com/v1/json/`
- Test credit cards: [zie docs](https://docs.multisafepay.com/docs/testing/)

Zet `NEXT_PUBLIC_MSP_TEST_MODE=true` in `.env.local`

### 4. Webhook Setup

In MultiSafePay merchant portal:
1. Ga naar **Settings** → **Webhook**
2. Voeg toe: `https://jouw-domain.nl/api/payment/webhook`
3. Selecteer events: `transaction status changed`

## Pakketten

| Pakket | Prijs/mnd | Prijs/jaar |
|--------|-----------|------------|
| Sociaal | €9,95 | €99,50 |
| Core | €24,50 | €245 |
| Pro | €39,50 | €395 |
| Premium | €69,50 | €695 |

## Testing

### Test een betaling:

1. Start de server: `npm run dev`
2. Registreer een account: http://localhost:9002/register
3. Ga naar pakket selectie: http://localhost:9002/select-package
4. Kies pakket en klik "Kies dit pakket"
5. Je wordt doorgestuurd naar MultiSafePay test pagina
6. Gebruik test credit card:
   - Card: 5500000000000004
   - CVC: 123
   - Expiry: Any future date

### Test Cards:

```
✅ Success: 5500000000000004
❌ Declined: 5100081112223332
⏳ Pending: 5100081112223333
```

## API Routes

### POST `/api/payment/create`
Maakt een betaling aan bij MultiSafePay

**Body:**
```json
{
  "userId": "firebase-user-id",
  "email": "user@example.com",
  "packageType": "core",
  "billingPeriod": "monthly",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "payment_url": "https://payv2.multisafepay.com/connect/...",
  "order_id": "DA-1234567890-abc12345"
}
```

### POST `/api/payment/webhook`
Ontvangt notificaties van MultiSafePay

**Body:**
```json
{
  "transactionid": "order-id"
}
```

## Subscription Management

### TODO: Implement

- [ ] Store subscriptions in Firebase
- [ ] Check subscription status before allowing app access
- [ ] Implement subscription pause feature (€2,95 for 2 weeks)
- [ ] Weekly credit drip system
- [ ] Progressive feature unlock
- [ ] Subscription renewal notifications

## Security

- ✅ API key alleen server-side
- ✅ Webhook signature verification (TODO)
- ✅ Order validation before payment
- ✅ Secure redirect URLs

## Production Checklist

- [ ] MultiSafePay API key van test naar productie
- [ ] `NEXT_PUBLIC_MSP_TEST_MODE=false`
- [ ] `NEXT_PUBLIC_BASE_URL` naar productie domain
- [ ] Webhook URL configureren in MultiSafePay
- [ ] SSL certificaat actief
- [ ] Firestore security rules voor subscriptions
- [ ] Error monitoring (Sentry)
- [ ] Payment logging

## Support

- [MultiSafePay Docs](https://docs.multisafepay.com/)
- [API Reference](https://docs.multisafepay.com/api/)
- [Support](https://www.multisafepay.com/nl/support)
