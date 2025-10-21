import { DefaultSeoProps } from 'next-seo'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://honeypot.ai'

export const defaultSEO: DefaultSeoProps = {
  titleTemplate: '%s | Honeypot AI',
  defaultTitle: 'Honeypot AI - Halal-First Trading Alerts',
  description:
    'Real-time halal-compliant buy/sell signals with transparent rationale. No haram sectors, no options. Research Chatbot coming soon.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Honeypot AI',
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Honeypot AI Trading Bot',
      },
    ],
  },
  twitter: {
    handle: '@honeypotai',
    site: '@honeypotai',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'halal trading, islamic trading, trading alerts, stock signals, halal investing, compliant trading bot',
    },
    {
      name: 'author',
      content: 'Honeypot AI',
    },
  ],
}

export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export const getProductSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Honeypot AI Trading Bot',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '199',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '127',
    },
    description:
      'Halal-compliant trading alerts with real-time buy/sell signals and transparent rationale.',
  }
}

