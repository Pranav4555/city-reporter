import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

// ✅ Fix: Move metadataBase, remove viewport and themeColor
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000'),
  title: 'Smart City Problem Reporter',
  description: 'AI-powered city problem reporting system for better communities',
  keywords: 'smart city, problem reporting, AI, community, urban issues',
  authors: [{ name: 'Smart City Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Smart City Problem Reporter',
    description: 'AI-powered city problem reporting system for better communities',
    type: 'website',
    siteName: 'Smart City Reporter',
    images: [
      {
        url: '/og-image.png', // Will resolve to absolute URL with metadataBase
        width: 1200,
        height: 630,
        alt: 'Smart City Reporter Logo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart City Problem Reporter',
    description: 'AI-powered city problem reporting system for better communities',
    images: ['/og-image.png']
  },
  // viewport and themeColor moved to separate export below
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased bg-gray-50">
        <div id="root">
          {children}
        </div>
        <div id="modal-root"></div>
      </body>
    </html>
  )
}
