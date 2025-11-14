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

1. Create a new project at [Supabase](https://supabase.com)
2. In the SQL Editor run the schema below (creates auth-enabled `profiles` plus catalog/order tables):

   ```sql
   create table if not exists profiles (
     id uuid primary key references auth.users(id) on delete cascade,
     name text not null,
     email text unique not null,
     phone text unique,
     created_at timestamp with time zone default timezone('utc', now())
   );

   create table if not exists service_items (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     description text,
     base_price numeric(10,2) not null,
     discount_type text,
     discount_value numeric(10,2),
     icon text,
     image text,
     is_active boolean default true,
     created_at timestamp with time zone default timezone('utc', now())
   );

   create table if not exists add_ons (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     description text,
     price numeric(10,2) not null,
     icon text,
     image text,
     is_active boolean default true,
     created_at timestamp with time zone default timezone('utc', now())
   );

   create table if not exists delivery_options (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     price numeric(10,2) not null,
     eta text,
     icon text,
     image text,
     is_active boolean default true,
     created_at timestamp with time zone default timezone('utc', now())
   );

   create table if not exists orders (
     id uuid default gen_random_uuid() primary key,
     order_number text unique,
     customer_id uuid references auth.users(id) on delete cascade,
     status text default 'pending',
     payment_status text default 'pending',
     delivery_type text,
     delivery_date date,
     delivery_time text,
     pickup_date date,
     pickup_time text,
     delivery_address text,
     delivery_zone_id uuid,
     special_instructions text,
     subtotal numeric(10,2),
     addons_total numeric(10,2),
     configuration_total numeric(10,2),
     delivery_fee numeric(10,2),
     discount_amount numeric(10,2),
     discount_code text,
     tax_amount numeric(10,2),
     total numeric(10,2),
     payment_method text,
     points_earned integer default 0,
     invoice_id uuid,
     created_at timestamp with time zone default timezone('utc', now())
   );

   create table if not exists order_items (
     id uuid default gen_random_uuid() primary key,
     order_id uuid references orders(id) on delete cascade,
     item_id uuid,
     item_name text,
     quantity integer,
     unit_price numeric(10,2),
     starch boolean,
     dettol boolean,
     express boolean,
     spot_remove boolean,
     configuration_cost numeric(10,2),
     line_total numeric(10,2)
   );

   create table if not exists order_addons (
     id uuid default gen_random_uuid() primary key,
     order_id uuid references orders(id) on delete cascade,
     addon_id uuid,
     addon_name text,
     price numeric(10,2),
     quantity integer default 1
   );

   alter table profiles enable row level security;
   create policy "Profiles are self-managed" on profiles
     for all using (auth.uid() = id);

   alter table orders enable row level security;
   create policy "Customers view their orders" on orders
     for select using (auth.uid() = customer_id);
   create policy "Customers insert orders" on orders
     for insert with check (auth.uid() = customer_id);

   alter table order_items enable row level security;
   create policy "Items belong to customer orders" on order_items
     for select using (
       exists (
         select 1 from orders
         where orders.id = order_items.order_id
         and orders.customer_id = auth.uid()
       )
     );

   alter table order_addons enable row level security;
   create policy "Add-ons belong to customer orders" on order_addons
     for select using (
       exists (
         select 1 from orders
         where orders.id = order_addons.order_id
         and orders.customer_id = auth.uid()
       )
     );
   ```

3. Seed sample catalog rows (optional):

   ```sql
   insert into service_items (name, description, base_price, icon)
   values
     ('Wash & Fold', 'Everyday garments with softener finish.', 79, '🧺'),
     ('Steam Press', 'Steam-finish for crisp outfits.', 59, '🧥');

   insert into add_ons (name, description, price, icon)
   values
     ('Stain Shield', 'Protects fabric from new stains.', 99, '🛡️'),
     ('Delicate Wash', 'Gentle cycle for luxury wear.', 129, '🧴');

   insert into delivery_options (name, price, eta, icon)
   values
     ('Standard Delivery', 49, '48 hrs', '🚚'),
     ('Express Delivery', 99, '24 hrs', '⚡');
   ```

4. Enable Email/Password auth (Authentication → Providers) and optional OTP/OAuth providers
5. Copy the Project URL, Anon key, and Service Role key from Settings → API

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
