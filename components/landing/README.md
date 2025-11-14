# Landing Page Components

This directory contains the components for the public-facing landing page of DHOPA.

## Components

### Header (`Header.tsx`)
- Sticky navigation header with logo, primary nav, and CTA buttons
- Responsive mobile menu with hamburger animation
- Smooth scroll behavior and shadow on scroll

### Hero (`Hero.tsx`)
- Two-column layout: content on left, illustration on right
- Animated entrance effects
- Primary and secondary CTAs
- Metrics badges (Fast pickup, Student friendly, Low prices)

### How It Works (`HowItWorks.tsx`)
- Three-step process visualization
- Icon-based cards with hover animations
- Responsive grid layout

### Pricing Snapshot (`PricingSnapshot.tsx`)
- Grid of pricing category cards
- Click any card to open a modal with full pricing details
- Integrates with existing pricing data via `lib/pricingAdapter.ts`

### Footer (`Footer.tsx`)
- Multi-column layout with links, contact info, and social links
- Accessible navigation structure
- Copyright and legal links

## Pricing Integration

The pricing data is sourced from:
- `lib/services-data.ts` - Contains service categories, addons, and delivery options
- `lib/pricingAdapter.ts` - Maps the existing data structure to landing page format

The `PricingSnapshot` component automatically reads from these sources. If pricing data is not available, it displays a fallback message.

## Usage

The landing page is located at `app/(landing)/page.tsx`. 

**Note:** If you want the landing page to be the root route (`/`), you may need to:
1. Move the current `app/page.tsx` (dashboard) to a different route like `app/dashboard/page.tsx`
2. Or conditionally render the landing page for non-authenticated users

## Accessibility

All components include:
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`)
- ARIA labels where appropriate
- Keyboard navigation support
- Focus-visible states
- Screen reader friendly text

## Testing & QA

- Smoke test: `__tests__/landing/landing-page.test.tsx` renders the landing page and asserts hero + CTA visibility.
- Components include `data-test-id` attributes:
  - `landing-header` - Main header
  - `hero-cta-primary` / `hero-cta-secondary` - CTA buttons
  - `pricing-grid` and `pricing-card-{categoryId}` - Pricing snapshot coverage
- Storybook is not configured in this repository; add-on stories can be introduced once Storybook is installed.

