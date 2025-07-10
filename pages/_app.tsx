import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import '../styles/globals.css'
import { ThemeProvider } from '@/components/InteractiveTitle'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      {/* Google AdSense Script */}
      <Script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1472717657817413"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      
      <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="relative min-h-screen">
        {/* Background Grid Pattern */}
        <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
        
        {/* Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        {/* Main Content */}
        <div className="relative z-10">
          <ThemeProvider>
            <Component {...pageProps} />
          </ThemeProvider>
        </div>
      </div>
    </div>
    </>
  )
} 