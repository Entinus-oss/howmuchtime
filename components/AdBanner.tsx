import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AdBannerProps {
  size?: 'leaderboard' | 'banner' | 'mobile' | 'medium-rectangle'
  className?: string
  position?: string
  style?: React.CSSProperties
}

// Ad size configurations
const AD_SIZES = {
  leaderboard: { width: 728, height: 90 },
  banner: { width: 468, height: 60 },
  mobile: { width: 320, height: 50 },
  'medium-rectangle': { width: 300, height: 250 }
}

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

  const adSize = AD_SIZES[size]
  const adSlot = `ad-${position}-${size}`

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const loadAd = () => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
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
        className={`flex items-center justify-center rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 ${className}`}
        style={{
          width: adSize.width,
          height: adSize.height,
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
        className={`flex items-center justify-center rounded-lg bg-gradient-to-r from-red-500/5 to-red-600/5 border border-red-500/10 ${className}`}
        style={{
          width: adSize.width,
          height: adSize.height,
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
      className={`ad-container rounded-lg overflow-hidden ${className}`}
      style={{
        width: adSize.width,
        height: adSize.height,
        maxWidth: '100%',
        ...style
      }}
    >
      {/* Crypto-style border glow */}
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-sm opacity-50"></div>
        <div className="relative w-full h-full bg-background/80 backdrop-blur-sm rounded-lg border border-primary/20">
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              width: '100%',
              height: '100%'
            }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={adSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
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