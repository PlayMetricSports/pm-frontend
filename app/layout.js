import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-main' })

export const metadata = {
  title: 'PlayMetric - Academy Console',
  description: 'Business Management Console for PlayMetric',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
