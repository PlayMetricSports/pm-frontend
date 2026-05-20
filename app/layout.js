import './globals.css'
import { Inter, Montserrat } from 'next/font/google'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const inter = Inter({ subsets: ['latin'], variable: '--font-main' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-logo' })
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
      <body className={`${inter.variable} ${montserrat.variable}`}>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Header />
            <div className="views-container">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
