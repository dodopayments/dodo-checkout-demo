## Dodo Checkout Starter

End-to-end demo app showing three billing models wired to Dodo Payments (test environment):
- One-time payments (credit pack)
- Recurring subscriptions
- Usage-based billing (pay-per-event)

Built with Next.js App Router, NextAuth, MongoDB, and Tailwind.

### Quick start
1. Clone and install:
   - `npm install`
2. Create `.env.local` (see Environment variables) and fill required keys.
3. Run locally:
   - `npm run dev` → open `http://localhost:3000`
4. Go to `Pricing` → pick a plan → complete Dodo test checkout → land on `Dashboard`.

---

## How the demo works

### One-time payment (Credit Pack)
- User picks Credit Pack on `Pricing`.
- Backend calls `POST /api/create-payment` → gets `payment_link` from Dodo → redirect to checkout.
- After success, `Dashboard` calls `POST /api/verify-payment` to confirm and update the user in MongoDB.
- Credits added: 10 credits per successful purchase.

### Subscriptions (Monthly/Annual)
- User picks a subscription plan.
- Backend calls `POST /api/create-subscription` → `payment_link` → redirect to checkout.
- On return, `POST /api/verify-payment` confirms and stores subscription status.

### Usage-based billing (Pay per Image)
- User chooses the usage-based plan.
- Backend calls `POST /api/create-usage-subscription` (marks `metadata.billing_type = usage_based`).
- Verification persists the Dodo `customer_id`.
- When features are used (e.g., image generation), the app sends usage events that accrue cost.

### Tracking usage in-app
- Hook `useUsageTracking` posts to `POST /api/send-usage-event`, which forwards usage to Dodo against the stored `customer_id`.
- The dashboard reads current usage/cost via `POST /api/check-payment-status`.

Example snippet:

```typescript
import { useUsageTracking } from '@/hooks/useUsageTracking'

function ImageGenerator() {
  const { trackUsage } = useUsageTracking()

  async function generateImage() {
    const image = await yourAPI.generate()
    await trackUsage('image.generation', { resolution: '1024x1024' })
    return image
  }
}
```

See `src/components/examples/ImageGeneratorExample.tsx` for a full example.

---

## Environment variables
Create `.env.local` in the project root and provide the following:

Required for database and NextAuth:
- `MONGO_URI` – MongoDB connection string
- `NEXTAUTH_URL` – e.g. `http://localhost:3000`
- `NEXTAUTH_SECRET` – random string for session/JWT encryption

Auth providers (enable at least one sign-in method):
- `RESEND_API_KEY` – for email sign-in via Resend
- `FROM_EMAIL` – sender email for Resend (e.g. `no-reply@yourdomain.com`)
- `AUTH_GOOGLE_ID` – Google OAuth Client ID
- `AUTH_GOOGLE_SECRET` – Google OAuth Client Secret

Dodo Payments (test environment):
- `DODO_PAYMENTS_API_KEY` – server-side secret key for Dodo test API
- `NEXT_PUBLIC_APP_URL` – app base URL used in return URLs (default `http://localhost:3000`)

Notes:
- All server routes call `https://test.dodopayments.com`.
- For local dev, webhooks to `localhost` are often blocked; use manual verification (`/api/verify-payment`).

---

## Running locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

Sign in from `/auth/signin`, visit `Pricing`, complete a test checkout, and review your status on `Dashboard`.

---

## API routes (server)
- `POST /api/create-payment` – Create a one-time payment and get a Dodo `payment_link`.
- `POST /api/create-subscription` – Create a recurring subscription and get a `payment_link`.
- `POST /api/create-usage-subscription` – Create a usage-based subscription and get a `payment_link`.
- `POST /api/send-usage-event` – Forward a usage event for the current user’s `customer_id`.
- `POST /api/check-payment-status` – Read persisted user payment and usage status.
- `POST /api/verify-payment` – Manually verify payment/subscription with Dodo (handy locally).
- `POST /api/webhooks/payment` – Receives Dodo webhooks (configure in production; optional locally).

Webhook signature verification is stubbed; add verification before going to production.

---

## Tech stack
- Next.js App Router (TypeScript)
- NextAuth (JWT sessions, MongoDB adapter)
- MongoDB (native driver)
- Tailwind CSS
- Dodo Payments (test API)

Key files:
- Auth config: `auth.ts`
- DB client: `src/lib/mongo.ts`
- Payments/usage routes: `src/app/api/*`
- Dashboard: `src/app/dashboard/page.tsx`
- Pricing: `src/app/pricing/page.tsx`

---

## Troubleshooting
- Missing `MONGO_URI`: the app will throw at startup – set `.env.local`.
- 500 on payment routes: ensure `DODO_PAYMENTS_API_KEY` is set.
- Redirect loops after sign-in: check `NEXTAUTH_URL` and `NEXTAUTH_SECRET`.
- No credits after purchasing Credit Pack: use `POST /api/verify-payment` (local), or configure webhooks in prod.
- Usage not reflected: ensure `customer_id` is saved by `verify-payment` and your feature calls `trackUsage`.

---

## Demo walkthrough

Follow these paths end-to-end in test mode:
1. Credit Pack → Pay → Dashboard shows +10 credits
2. Subscription → Pay → Dashboard shows active subscription
3. Usage-based → Pay → Generate image → Usage and cost update on Dashboard

---

## Links
- Dodo Payments Docs: `https://docs.dodopayments.com`
