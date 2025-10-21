import * as React from 'react'
import Link from 'next/link'
import { Twitter, Linkedin, Github, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Changelog', href: '/changelog' },
      { name: 'FAQ', href: '#faq' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/legal/terms' },
      { name: 'Privacy Policy', href: '/legal/privacy' },
      { name: 'Disclaimer', href: '/legal/disclaimer' },
    ],
    company: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: 'mailto:hello@honeypot.ai' },
    ],
  }

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/honeypotai' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/honeypotai' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/honeypotai' },
    { name: 'Email', icon: Mail, href: 'mailto:hello@honeypot.ai' },
  ]

  return (
    <footer className="bg-hp-black border-t border-hp-gray900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-hp-yellow rounded-md flex items-center justify-center font-bold text-hp-black">
                H
              </div>
              <span className="text-hp-white font-semibold text-lg">
                Honeypot AI
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-xs">
              Halal-first trading alerts with transparent rationale. Fast,
              compliant, and trustworthy.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-hp-yellow transition-colors"
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-hp-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-hp-yellow transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-hp-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-hp-yellow transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-hp-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-hp-yellow transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-hp-gray900">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {currentYear} Honeypot AI. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

