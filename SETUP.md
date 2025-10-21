# Honeypot AI Setup Instructions

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Then update the values in `.env`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EMAIL_PROVIDER_API_KEY=your_api_key_here
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── legal/             # Legal pages
│   ├── pricing/           # Pricing page
│   ├── changelog/         # Changelog page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── data/                  # Mock data (JSON)
├── lib/                   # Utility functions
├── public/               # Static assets
└── ...                   # Config files
```

## Key Features

### Components

All components are located in the `components/` directory:

- **Header**: Sticky navigation with mobile menu
- **Hero**: Main landing section with CTA
- **HalalExplainer**: Explains halal compliance criteria
- **HowItWorks**: 4-step process section
- **ValueCards**: Feature highlights
- **SignalsTable**: Live signal preview with modal
- **WaitlistForm**: Email subscription form
- **PricingTiers**: Pricing cards
- **FAQ**: Accordion-based FAQ section
- **Footer**: Site footer with links
- **CookieConsent**: Cookie consent banner

### Pages

- `/` - Home page
- `/pricing` - Pricing page
- `/changelog` - Product updates
- `/legal/terms` - Terms of Service
- `/legal/privacy` - Privacy Policy
- `/legal/disclaimer` - Risk Disclaimer

### API Routes

- `POST /api/subscribe` - Email subscription endpoint

## Customization

### Colors

Brand colors are defined in `tailwind.config.ts`:

```typescript
colors: {
  hp: {
    yellow: '#F5C518',
    yellow600: '#D4A90E',
    black: '#0A0A0A',
    gray900: '#111213',
    white: '#FFFFFF',
  }
}
```

### Data

Mock data files are in the `data/` directory:
- `signals.json` - Trading signals
- `pricing.json` - Pricing tiers
- `faq.json` - FAQ items
- `testimonials.json` - User testimonials
- `integrations.json` - Integration options

### SEO

SEO configuration is in `lib/seo.ts`. Update with your actual domain and social media handles.

## Email Integration

The `/api/subscribe` route is currently a placeholder. To integrate with an email provider:

1. Choose a provider (Mailchimp, SendGrid, ConvertKit, etc.)
2. Get your API key
3. Update `EMAIL_PROVIDER_API_KEY` in `.env`
4. Implement the integration in `app/api/subscribe/route.ts`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The site works with any Next.js hosting platform:
- Netlify
- AWS Amplify
- Railway
- Render

## Build for Production

```bash
npm run build
npm run start
```

## Need Help?

- Documentation: [Next.js Docs](https://nextjs.org/docs)
- Tailwind: [Tailwind CSS Docs](https://tailwindcss.com/docs)
- shadcn/ui: [shadcn/ui Docs](https://ui.shadcn.com)

## License

© 2025 Honeypot AI. All rights reserved.

