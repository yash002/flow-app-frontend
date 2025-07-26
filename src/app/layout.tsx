import '@shopify/polaris/build/esm/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProviders from '../components/ClientProviders'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flow Builder',
  description: 'Drag and drop flow builder application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
