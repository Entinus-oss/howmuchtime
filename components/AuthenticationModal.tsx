import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, User, LogOut } from 'lucide-react'
import { SteamOAuthButton } from './SteamOAuthButton'

interface AuthenticationModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthComplete?: (steamId: string) => void
}

interface AuthSession {
  authenticated: boolean
  steamId?: string
  timestamp?: number
}

export function AuthenticationModal({ isOpen, onClose, onAuthComplete }: AuthenticationModalProps) {
  const [authSession, setAuthSession] = useState<AuthSession>({ authenticated: false })
  const [loading, setLoading] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (response.ok && data.authenticated) {
        setAuthSession({
          authenticated: true,
          steamId: data.steamId,
          timestamp: data.timestamp
        })
      } else {
        setAuthSession({ authenticated: false })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthSession({ authenticated: false })
    }
  }

  const handleAuthComplete = (steamId: string) => {
    setAuthSession({
      authenticated: true,
      steamId,
      timestamp: Date.now()
    })
    onAuthComplete?.(steamId)
    onClose()
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
      setAuthSession({ authenticated: false })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Steam Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {authSession.authenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Successfully Authenticated</h3>
              <p className="text-sm text-gray-600">
                Steam ID: <span className="font-mono text-blue-600">{authSession.steamId}</span>
              </p>
              <p className="text-xs text-gray-500">
                Authenticated at: {authSession.timestamp ? new Date(authSession.timestamp).toLocaleString() : 'Unknown'}
              </p>
              <motion.button
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                <span>{loading ? 'Logging out...' : 'Logout'}</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Steam OAuth Login</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Click the button below to authenticate with your Steam account through Steam's official login page.
                </p>
              </div>
              <SteamOAuthButton
                onAuthComplete={handleAuthComplete}
                className="w-full"
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Hook for managing authentication state
export function useAuthentication() {
  const [authSession, setAuthSession] = useState<AuthSession>({ authenticated: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      if (response.ok && data.authenticated) {
        setAuthSession({
          authenticated: true,
          steamId: data.steamId,
          timestamp: data.timestamp
        })
      } else {
        setAuthSession({ authenticated: false })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthSession({ authenticated: false })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
      setAuthSession({ authenticated: false })
      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    }
  }

  return {
    authSession,
    loading,
    checkAuthStatus,
    logout
  }
} 