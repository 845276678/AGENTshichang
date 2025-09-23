'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Github,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  _Phone,
  Zap,
  ArrowUp,
  Heart
} from 'lucide-react'

interface FooterProps {
  className?: string
}

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Browse Agents', href: '/agents' },
      { label: 'Categories', href: '/categories' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API Documentation', href: '/docs/api' },
    ]
  },
  {
    title: 'Developers',
    links: [
      { label: 'Create Agent', href: '/agents/create' },
      { label: 'Developer Docs', href: '/docs' },
      { label: 'SDK & Tools', href: '/docs/sdk' },
      { label: 'Community', href: '/community' },
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Security', href: '/security' },
    ]
  }
]

const socialLinks = [
  {
    name: 'GitHub',
    icon: Github,
    href: 'https://github.com/ai-agent-market',
    color: 'hover:text-gray-900 dark:hover:text-white'
  },
  {
    name: 'Twitter',
    icon: Twitter,
    href: 'https://twitter.com/aiagentmarket',
    color: 'hover:text-blue-400'
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: 'https://linkedin.com/company/ai-agent-market',
    color: 'hover:text-blue-600'
  },
  {
    name: 'Email',
    icon: Mail,
    href: 'mailto:hello@aiagentmarket.com',
    color: 'hover:text-red-500'
  }
]

const ScrollToTopButton = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex justify-center mb-8"
    >
      <Button
        onClick={scrollToTop}
        variant="outline"
        size="icon"
        className="rounded-full bg-background/50 backdrop-blur border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t bg-background/50 backdrop-blur', className)}>
      <div className="container">
        <ScrollToTopButton />
        
        {/* Main Footer Content */}
        <div className="grid gap-8 py-16 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-primary to-agent-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg">AI Agent Market</span>
              </Link>
              
              <p className="text-muted-foreground text-sm mb-6 max-w-md leading-relaxed">
                The world's largest marketplace for AI agents. Discover, deploy, and monetize 
                intelligent automation solutions that transform how you work and create.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:hello@aiagentmarket.com" className="hover:text-primary transition-colors">
                    hello@aiagentmarket.com
                  </a>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'text-muted-foreground transition-colors duration-200',
                      social.color
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="h-5 w-5" />
                    <span className="sr-only">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Links Sections */}
          {footerSections.map((section, sectionIndex) => (
            <div key={section.title} className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + sectionIndex * 0.05 }}
              >
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
        </div>
        
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border-t border-border/50 py-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-semibold mb-2">Stay updated with AI trends</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest news, agent releases, and platform updates delivered to your inbox.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 border border-border rounded-md bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 flex-1 md:w-64"
              />
              <Button className="whitespace-nowrap">
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-border/50 py-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 AI Agent Market. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for the AI community</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}