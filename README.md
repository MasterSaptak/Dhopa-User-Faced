# DHOPA Customer Portal

A modern, production-ready laundry service customer portal built with Next.js 16, React 19.2, Supabase, and Stripe.

## Features

- **Full Authentication** - Email/password and Google OAuth via Supabase Auth
- **Service Catalog** - 43+ laundry items across 5 categories with live pricing
- **Smart Ordering** - Item configurations (starch, express, etc.) with real-time pricing
- **Loyalty System** - Bronze/Silver/Gold tiers with automatic progression
- **Payment Processing** - Stripe integration for card/UPI payments
- **Real-time Updates** - Order status changes via Supabase Realtime
- **PDF Invoices** - Generated and downloadable for every order
- **Offline Support** - PWA with offline draft orders and sync
- **Push Notifications** - Status updates via Web Push/FCM
- **Responsive Design** - Mobile-first with glass morphism theme

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **UI:** React 19.2 + TypeScript + Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payments:** Stripe
- **State:** Zustand with persistence
- **Components:** shadcn/ui
- **PDF:** jsPDF
- **Testing:** Vitest + Playwright

## Getting Started

### 1. Clone and Install

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 2. Setup Supabase

Follow the detailed instructions in [MIGRATION.md](./MIGRATION.md):

1. Create a Supabase project
2. Run `scripts/01-create-tables.sql` in SQL Editor
3. Run `scripts/02-seed-data.sql` to populate data
4. Enable Realtime for `orders` table
5. Create `invoices` storage bucket

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your credentials:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional
FCM_SERVER_KEY=your_fcm_key
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_APP_ENV=development
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/
│   ├── api/              # API routes
│   │   ├── catalog/      # Catalog endpoints
│   │   ├── orders/       # Order management
│   │   ├── payments/     # Stripe integration
│   │   └── invoice/      # PDF generation
│   ├── customer/         # Protected customer pages
│   │   ├── order/        # Main ordering interface
│   │   ├── checkout/     # Checkout flow
│   │   ├── history/      # Order history
│   │   └── profile/      # User profile & loyalty
│   └── auth/             # Authentication pages
├── components/           # React components
│   ├── order/           # Order-related components
│   ├── checkout/        # Checkout components
│   ├── profile/         # Profile components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configs
│   ├── supabase.ts      # Browser client
│   ├── supabase-admin.ts # Server client
│   ├── types.ts         # TypeScript types
│   └── store.ts         # Zustand store
├── scripts/             # Database scripts
│   ├── 01-create-tables.sql
│   └── 02-seed-data.sql
└── __tests__/           # Test files
\`\`\`

## Available Routes

### Public
- `/` - Landing page
- `/login` - Login
- `/signup` - Sign up

### Protected (Customer)
- `/customer/order` - Browse and add items to cart
- `/customer/checkout` - Complete order with delivery/payment
- `/customer/checkout/success` - Order confirmation
- `/customer/history` - View order history
- `/customer/profile` - Manage profile and loyalty

### API
- `GET /api/catalog/fast` - Get all items and add-ons
- `GET /api/catalog/item/[id]` - Get single item
- `POST /api/orders/calc` - Calculate order total
- `POST /api/orders/create` - Create new order
- `GET /api/orders/[id]` - Get order details
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/invoice/pdf/[id]` - Generate PDF invoice

## Key Features

### Server-Side Pricing Validation

All pricing calculations happen server-side to prevent manipulation:

\`\`\`typescript
// Client sends only item IDs and quantities
POST /api/orders/calc
{
  "items": [{ "id": "...", "quantity": 2, "config": {...} }],
  "addons": ["addon-id-1"],
  "discountCode": "FIRST10"
}

// Server fetches current prices from DB and calculates
// Returns validated total
\`\`\`

### Real-time Order Updates

Subscribe to order status changes:

\`\`\`typescript
const channel = supabase
  .channel(`orders:${userId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `customer_id=eq.${userId}`
  }, (payload) => {
    // Handle status update
  })
  .subscribe()
\`\`\`

### Offline Draft Sync

Orders created offline are queued and synced when online:

\`\`\`typescript
// Draft saved to IndexedDB
{ id, items, addons, synced: false }

// On reconnect, check for price changes
const serverTotal = await calcOrder(draft)
if (serverTotal !== clientTotal) {
  // Show price-change modal
}
\`\`\`

### Loyalty Points

Automatically calculated on order completion:

\`\`\`sql
-- Called server-side after payment
SELECT increment_loyalty(
  customer_id,
  points_earned,
  total_amount
);
\`\`\`

## Testing

### Unit Tests

\`\`\`bash
npm run test
\`\`\`

### E2E Tests

\`\`\`bash
npm run test:e2e
\`\`\`

### Lighthouse Performance

\`\`\`bash
npm run lighthouse
\`\`\`

Target: >90 mobile performance score

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Configure Stripe Webhook

1. Get your webhook endpoint: `https://yourdomain.com/api/payments/webhook`
2. Add to Stripe Dashboard → Webhooks
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Enable Push Notifications

1. Generate FCM server key in Firebase Console
2. Add to `FCM_SERVER_KEY` environment variable
3. Add Firebase config to `public/firebase-config.json`

## Admin Panel Integration

This app integrates with the DHOPA Admin Panel v1.1.0:

- Orders created here appear in admin panel
- Price changes in admin reflect in customer app within 60s
- Status updates from admin trigger real-time notifications
- Customer loyalty syncs bidirectionally

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `FCM_SERVER_KEY` | No | Firebase Cloud Messaging server key |
| `RESEND_API_KEY` | No | Resend API key for emails |
| `NEXT_PUBLIC_APP_ENV` | No | Environment (development/production) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact support.
