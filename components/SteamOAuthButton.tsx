import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'

interface SteamOAuthButtonProps {
  onAuthStart?: () => void
  onAuthComplete?: (steamId: string) => void
  className?: string
}

export function SteamOAuthButton({ onAuthStart, onAuthComplete, className = '' }: SteamOAuthButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    onAuthStart?.()
    
    try {
      // Redirect to Steam OAuth login
      window.location.href = '/api/auth/steam/login'
    } catch (error) {
      console.error('Steam OAuth error:', error)
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handleLogin}
      disabled={loading}
      className={`
        relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 
        text-white font-semibold py-3 px-6 rounded-lg
        hover:from-blue-700 hover:to-blue-800 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150 flex items-center justify-center space-x-2
        ${className}
      `}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.187.008l2.861-4.142c0-.016-.002-.032-.002-.048 0-2.084 1.688-3.772 3.772-3.772 2.085 0 3.772 1.688 3.772 3.772 0 2.084-1.687 3.772-3.772 3.772h-.087l-4.089 2.921c0 .052.002.104.002.156 0 1.867-1.509 3.376-3.376 3.376-1.867 0-3.376-1.509-3.376-3.376 0-.052.002-.104.004-.156l-2.598-1.075C.344 18.982 5.678 24 11.979 24c6.624 0 11.979-5.355 11.979-11.979C23.958 5.355 18.603.001 11.979.001z"/>
          </svg>
          <span>Login with Steam</span>
        </>
      )}
    </motion.button>
  )
} 