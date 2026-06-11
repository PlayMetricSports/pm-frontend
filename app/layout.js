import './globals.css'
import LayoutWrapper from '../components/LayoutWrapper'

export const metadata = {
  title: 'PlayMetric - Academy Console',
  description: 'Business Management Console for PlayMetric',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme') || 'dark';
              document.documentElement.setAttribute('data-theme', theme);
            })();
          `
        }} />
      </head>
      <body style={{
        '--font-main': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        '--font-logo': "'Montserrat', 'Inter', system-ui, sans-serif"
      }}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
}
