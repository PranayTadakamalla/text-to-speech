import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Text To Speech',
  description: 'Created by Sai Pranay Tadakamalla',
  generator: 'Sai Pranay Tadakamalla',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
