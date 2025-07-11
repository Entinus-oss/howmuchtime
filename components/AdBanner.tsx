import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AdBannerProps {
  size?: 'leaderboard' | 'banner' | 'mobile' | 'medium-rectangle'
  className?: string
  position?: string
  style?: React.CSSProperties
}

// Using responsive ads that auto-size based on available space

// Environment variables
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-1472717657817413'
const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED !== 'false'

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  size = 'leaderboard', 
  className = '',
  position = 'default',
  style = {}
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Don't render if ads are disabled
  if (!ADS_ENABLED) {
    return null
  }

  // Use the specific ad slot ID from Google AdSense
  const adSlot = '1005213415'

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const loadAd = () => {
      try {
        if (typeof window !== 'undefined') {
          // Initialize adsbygoogle array if it doesn't exist
          window.adsbygoogle = window.adsbygoogle || []
          // Push ad to AdSense
          window.adsbygoogle.push({})
          setIsLoaded(true)
          setIsVisible(true)
        }
      } catch (error) {
        console.error('AdSense loading error:', error)
        setHasError(true)
      }
    }

    // Delay ad loading to avoid layout shift
    timeoutId = setTimeout(loadAd, 500)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  // Show loading placeholder while ad loads
  if (!isLoaded && !hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex items-center justify-center p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 ${className}`}
        style={{
          minHeight: '90px',
          maxWidth: '100%',
          ...style
        }}
      >
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span>Loading ad...</span>
        </div>
      </motion.div>
    )
  }

  // Show error state if ad fails to load
  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex items-center justify-center p-4 rounded-lg bg-gradient-to-r from-red-500/5 to-red-600/5 border border-red-500/10 ${className}`}
        style={{
          minHeight: '90px',
          maxWidth: '100%',
          ...style
        }}
      >
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Ad unavailable</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className={`ad-container ${className}`}
      style={{
        maxWidth: '100%',
        textAlign: 'center',
        ...style
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block'
        }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </motion.div>
  )
}

// Responsive wrapper component for different screen sizes
export const ResponsiveAdBanner: React.FC<Omit<AdBannerProps, 'size'>> = (props) => {
  return (
    <div className="flex justify-center w-full">
      {/* Desktop: Leaderboard */}
      <div className="hidden lg:block">
        <AdBanner {...props} size="leaderboard" />
      </div>
      
      {/* Tablet: Banner */}
      <div className="hidden md:block lg:hidden">
        <AdBanner {...props} size="banner" />
      </div>
      
      {/* Mobile: Mobile banner */}
      <div className="block md:hidden">
        <AdBanner {...props} size="mobile" />
      </div>
    </div>
  )
} 