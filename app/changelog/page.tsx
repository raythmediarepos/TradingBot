import * as React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Changelog',
  description: 'Latest updates and improvements to Helwa AI trading platform.',
}

type ChangelogEntry = {
  version: string
  date: string
  type: 'feature' | 'improvement' | 'fix' | 'upcoming'
  changes: string[]
}

const changelogEntries: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: 'January 1, 2026',
    type: 'upcoming',
    changes: [
      'Official Trading Bot v1 launch',
      'Full production release with all core features',
      'Real-time ethical trading signals',
      'Complete ethical screening engine',
      'Multi-ticker support',
      'Signal rationale and datapoints',
    ],
  },
  {
    version: 'Beta',
    date: 'December 1, 2025',
    type: 'upcoming',
    changes: [
      'First 100 beta testers get early access',
      'Limited testing group for Trading Bot',
      'Feedback collection and improvements',
      'Real-world signal testing',
    ],
  },
  {
    version: 'Discord',
    date: 'November 15, 2025',
    type: 'upcoming',
    changes: [
      'Discord community launch',
      'Trading signals delivered to Discord channel',
      'Community access for early supporters',
      'Direct communication with the team',
    ],
  },
]

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'feature':
      return 'default'
    case 'improvement':
      return 'secondary'
    case 'fix':
      return 'outline'
    case 'upcoming':
      return 'default'
    default:
      return 'default'
  }
}

const getTypeBadgeLabel = (type: string) => {
  switch (type) {
    case 'upcoming':
      return 'Upcoming'
    case 'feature':
      return 'New'
    case 'improvement':
      return 'Improved'
    case 'fix':
      return 'Fixed'
    default:
      return type
  }
}

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-hp-black">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-hp-white mb-4">
              Changelog
            </h1>
            <p className="text-gray-400 text-lg mb-12">
              Track all updates, new features, and improvements to Helwa AI
            </p>

            <div className="space-y-12">
              {changelogEntries.map((entry, index) => (
                <div
                  key={index}
                  className="relative pl-8 border-l-2 border-hp-yellow/20"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-hp-yellow rounded-full" />

                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-hp-white">
                        {entry.version.includes('.') ? `v${entry.version}` : entry.version}
                      </h2>
                      <Badge variant={getTypeBadgeVariant(entry.type)}>
                        {getTypeBadgeLabel(entry.type)}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{entry.date}</p>
                  </div>

                  <ul className="space-y-2">
                    {entry.changes.map((change, changeIndex) => (
                      <li
                        key={changeIndex}
                        className="flex items-start space-x-2"
                      >
                        <span className="text-hp-yellow mt-1.5">•</span>
                        <span className="text-gray-300">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-hp-gray900 border border-hp-yellow/10 rounded-lg">
              <h3 className="text-hp-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-hp-yellow">•</span> Future Roadmap
              </h3>
              <p className="text-sm text-gray-500 mb-4">Dates to be announced</p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-hp-yellow mt-1">→</span>
                  <span><strong className="text-hp-white">Trading Bot v2.0</strong> - Enhanced features and improvements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-hp-yellow mt-1">→</span>
                  <span><strong className="text-hp-white">Research Chatbot Beta</strong> - Limited beta testing program</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-hp-yellow mt-1">→</span>
                  <span><strong className="text-hp-white">Research Chatbot v1.0</strong> - Public release with AI-powered research assistant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

