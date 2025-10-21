# 🚀 Quick Start Guide

Get your Honeypot AI website running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Lucide React icons
- And more...

## Step 2: Start Development Server

```bash
npm run dev
```

Your site will be available at **http://localhost:3000**

## Step 3: Configure Environment (Optional)

If you want to test email subscriptions:

1. Copy `.env.example` to `.env`
2. Add your email provider API key
3. Implement the integration in `app/api/subscribe/route.ts`

For now, subscriptions will just log to console in development mode.

## 🎨 What You'll See

Your landing page includes:

1. **Announcement Bar** - Dismissible banner for announcements
2. **Navigation** - Sticky header with mobile menu
3. **Hero Section** - Bold headline with CTAs
4. **Halal Explainer** - Details on compliance criteria
5. **How It Works** - 4-step process
6. **Value Props** - Feature highlights
7. **Live Signals** - Table with mock trading alerts
8. **Waitlist Form** - Email capture with radio options
9. **FAQ** - Accordion-style questions
10. **Footer** - Links and social media
11. **Cookie Consent** - GDPR-friendly banner

## 📄 Additional Pages

Navigate to:
- `/pricing` - Pricing tiers
- `/changelog` - Product updates
- `/legal/terms` - Terms of Service
- `/legal/privacy` - Privacy Policy
- `/legal/disclaimer` - Risk Disclaimer

## 🎨 Customization

### Update Brand Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  hp: {
    yellow: '#F5C518',      // Your primary color
    yellow600: '#D4A90E',   // Darker shade
    black: '#0A0A0A',       // Background
    gray900: '#111213',     // Card background
    white: '#FFFFFF',       // Text
  }
}
```

### Update Copy

Main hero text is in `components/hero.tsx`:

```typescript
<h1>
  Halal-first trading alerts that{' '}
  <span className="text-hp-yellow">move when markets do</span>
</h1>
```

### Update Mock Data

Edit JSON files in the `data/` folder:
- `signals.json` - Trading signals
- `pricing.json` - Pricing plans
- `faq.json` - FAQ items
- `testimonials.json` - User reviews
- `integrations.json` - Integration options

### Update Logo

Replace `public/logo.svg` and `public/favicon.svg` with your own designs.

## 🚀 Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure environment variables (if needed)
6. Deploy!

## 📱 Mobile-Friendly

All components are fully responsive:
- Mobile menu in header
- Card layouts stack on mobile
- Tables convert to cards on small screens
- Touch-friendly buttons and interactions

## ♿ Accessible

Built with accessibility in mind:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Reduced motion support

## 🎭 Animations

Powered by Framer Motion:
- Scroll-triggered animations
- Smooth transitions
- Respects `prefers-reduced-motion`

## 📊 Analytics

Vercel Analytics is pre-configured. It will automatically track page views when deployed to Vercel.

## 🔒 SEO Ready

- Meta tags configured
- Open Graph images
- JSON-LD structured data
- Sitemap-ready
- Fast Core Web Vitals

## 💡 Tips

1. **Hot Reload**: Changes auto-refresh in dev mode
2. **Type Safety**: TypeScript catches errors at compile time
3. **Fast Builds**: Next.js 14 with Turbopack for speed
4. **Component Library**: shadcn/ui for consistent design

## 🐛 Troubleshooting

### Port Already in Use?
```bash
npm run dev -- -p 3001
```

### TypeScript Errors?
```bash
npm run build
```

### Styling Issues?
Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion/)

## 🎉 You're Ready!

Your Honeypot AI landing page is now running. Customize the content, update the styling, and deploy to production!

Questions? Check `SETUP.md` for detailed documentation.

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS

