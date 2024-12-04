# Dodo Payment Integration (Next.js)

This project demonstrates a comprehensive Dodo payment integration solution using Next.js. It includes payment link creation, webhook updates, and merchant database updates, all built with  TypeScript and Nextjs. Follow the steps in the documentaion below to quickly set up and start using the Dodo payment features in your application.

## Features

- 🔒 Secure payment processing with [Dodo Payments]
- ⚡ Server-side API routes for payment handling
- 🎯 Type-safe implementation with TypeScript
- 🔄 Real-time payment status updates with webhook
- 🎨 Styled with TailwindCSS
- ✨ Modern Next.js App Router architecture

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/project-name.git

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

## Environment Variables

```env
PAYMENT_API_KEY=your_api_key
PAYMENT_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_PAYMENT_PUBLIC_KEY=your_public_key
```

## Usage

```typescript
// pages/checkout.tsx
import { PaymentForm } from '@/components/payment/PaymentForm'

export default function CheckoutPage() {
  return (
    <PaymentForm
      amount={1000}
      currency="USD"
      onSuccess="/success"
      onCancel="/cancel"
    />
  )
}
```

## API Routes

- `POST /api/payments/create` - Create new payment session
- `POST /api/payments/webhook` - Handle payment webhooks
- `GET /api/payments/verify` - Verify payment status

## Project Structure

```
├── app/
│   ├── api/
│   │   └── payments/
│   └── payments/
├── components/
│   └── payment/
├── lib/
│   └── payment/
└── config/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For support, please raise an issue in the GitHub repository or refer to the documentation.