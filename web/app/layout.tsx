import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'e-Khadi — Community Credit for SASSA Grant Recipients',
  description:
    'e-Khadi is a community-powered stokvel credit platform for SASSA grant recipients in South Africa. Access grant-backed credit at spaza shops in your area.',
  keywords: ['stokvel', 'SASSA', 'credit', 'spaza shop', 'South Africa', 'grant'],
  authors: [{ name: 'e-Khadi' }],
  openGraph: {
    title: 'e-Khadi',
    description: 'Community Credit for SASSA Grant Recipients',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
