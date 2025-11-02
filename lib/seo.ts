import { DefaultSeoProps } from 'next-seo'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helwa.ai'

export const defaultSEO: DefaultSeoProps = {
  titleTemplate: '%s | Helwa AI',
  defaultTitle: 'Helwa AI - Ethical Trading Alerts',
  description:
    'Real-time ethical trading signals with transparent rationale and AI-powered analysis. Smart, transparent, and principled trading decisions.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Helwa AI',
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Helwa AI Trading Bot',
      },
    ],
  },
  twitter: {
    handle: '@helwaai',
    site: '@helwaai',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'ethical trading, ai trading bot, trading alerts, stock signals, transparent investing, principled trading',
    },
    {
      name: 'author',
      content: 'Helwa AI',
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
    name: 'Helwa AI Trading Bot',
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
      'Ethical trading alerts with real-time buy/sell signals, transparent rationale, and AI-powered analysis.',
  }
}

