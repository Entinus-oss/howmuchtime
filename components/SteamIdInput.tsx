import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertCircle, Info, Clock, ChevronDown, X, User, Users } from 'lucide-react'
import { recentAccountsStorage, RecentAccount, EnhancedRecentAccounts, formatPlaytime } from '@/lib/recentAccounts'
import { SteamIcon } from './SteamIcon'

interface SteamIdInputProps {
  onSubmit: (steamId: string) => void
  onSelectRecentAccount?: (steamId: string) => void
  loading: boolean
  error: string | null
  onShowAuth?: () => void
}

export function SteamIdInput({ onSubmit, onSelectRecentAccount, loading, error, onShowAuth }: SteamIdInputProps) {
  const [steamId, setSteamId] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [enhancedRecentAccounts, setEnhancedRecentAccounts] = useState<EnhancedRecentAccounts>({
    manualAccounts: [],
    visitedAccounts: []
  })
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [focusedSection, setFocusedSection] = useState<'manual' | 'visited'>('manual')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load enhanced recent accounts on component mount
  useEffect(() => {
    const accounts = recentAccountsStorage.getEnhancedRecentAccounts()
    setEnhancedRecentAccounts(accounts)
  }, [])

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (steamId.trim()) {
      onSubmit(steamId.trim())
      setShowDropdown(false)
      // Clear the input field after submission
      setSteamId('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSteamId(e.target.value)
    
    // If input is cleared, refresh accounts to get latest visited accounts
    if (e.target.value.length === 0) {
      const refreshedAccounts = recentAccountsStorage.getEnhancedRecentAccounts()
      setEnhancedRecentAccounts(refreshedAccounts)
      
      const hasRecentAccounts = refreshedAccounts.manualAccounts.length > 0 || refreshedAccounts.visitedAccounts.length > 0
      setShowDropdown(hasRecentAccounts)
    } else {
      setShowDropdown(false)
    }
    
    setFocusedIndex(-1)
  }

  const handleInputFocus = () => {
    // Refresh accounts when input is focused to get latest visited accounts
    const refreshedAccounts = recentAccountsStorage.getEnhancedRecentAccounts()
    setEnhancedRecentAccounts(refreshedAccounts)
    
    const hasRecentAccounts = refreshedAccounts.manualAccounts.length > 0 || refreshedAccounts.visitedAccounts.length > 0
    if (steamId.length === 0 && hasRecentAccounts) {
      setShowDropdown(true)
    }
  }

  const handleSelectAccount = (account: RecentAccount) => {
    setShowDropdown(false)
    setFocusedIndex(-1)
    
    if (onSelectRecentAccount) {
      onSelectRecentAccount(account.steamId)
    } else {
      onSubmit(account.steamId)
    }
    
    // Clear the input field after selection
    setSteamId('')
  }

  const handleRemoveAccount = (e: React.MouseEvent, steamId: string) => {
    e.stopPropagation()
    recentAccountsStorage.removeAccount(steamId)
    const updatedAccounts = recentAccountsStorage.getEnhancedRecentAccounts()
    setEnhancedRecentAccounts(updatedAccounts)
    
    const hasRecentAccounts = updatedAccounts.manualAccounts.length > 0 || updatedAccounts.visitedAccounts.length > 0
    if (!hasRecentAccounts) {
      setShowDropdown(false)
    }
  }

  const getAllAccounts = () => {
    return [...enhancedRecentAccounts.manualAccounts, ...enhancedRecentAccounts.visitedAccounts]
  }

  const getAccountByIndex = (index: number) => {
    const allAccounts = getAllAccounts()
    return allAccounts[index]
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allAccounts = getAllAccounts()
    if (!showDropdown || allAccounts.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < allAccounts.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : allAccounts.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < allAccounts.length) {
          handleSelectAccount(allAccounts[focusedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setFocusedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Calculate if we have recent accounts dynamically since it can change when refreshed
  const hasRecentAccounts = enhancedRecentAccounts.manualAccounts.length > 0 || enhancedRecentAccounts.visitedAccounts.length > 0

  return (
    <div className="max-w-2xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Authentication Options */}
        {onShowAuth && (
          <div className="text-center">
            <motion.button
              onClick={() => window.location.href = '/api/auth/steam/login'}
              className="w-full bg-primary/30 hover:bg-primary/40 text-primary border border-primary/40 hover:border-primary/50 py-3 px-6 rounded-lg font-semibold transition-all duration-150 ease-out hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <SteamIcon className="w-5 h-5" />
              <span>Login with Steam</span>
            </motion.button>
            
            <div className="flex items-center justify-center space-x-4 my-6">
              <div className="flex-1 h-px bg-border/20"></div>
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border/20"></div>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={steamId}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder="Enter Steam profile URL or Steam ID"
              className="w-full px-4 py-3 pl-12 pr-16 bg-card/50 border border-border/20 rounded-lg 
                       text-foreground placeholder-muted-foreground backdrop-blur-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                       transition-all duration-200"
              disabled={loading}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            
            {/* Show dropdown button when there are recent accounts */}
            {hasRecentAccounts && (
              <button
                type="button"
                onClick={() => {
                  // Refresh accounts when dropdown is toggled to get latest visited accounts
                  const refreshedAccounts = recentAccountsStorage.getEnhancedRecentAccounts()
                  setEnhancedRecentAccounts(refreshedAccounts)
                  
                  setShowDropdown(!showDropdown)
                  setFocusedIndex(-1)
                }}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Enhanced Recent Accounts Dropdown */}
          <AnimatePresence>
            {showDropdown && hasRecentAccounts && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card/90 backdrop-blur-sm border border-border/20 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
              >
                <div className="p-2">
                  {/* Manual Accounts Section */}
                  {enhancedRecentAccounts.manualAccounts.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 px-2">
                        <User className="w-3 h-3" />
                        <span>Manual Entries</span>
                      </div>
                      <div className="space-y-1">
                        {enhancedRecentAccounts.manualAccounts.map((account, index) => (
                          <AccountCard
                            key={`manual-${account.steamId}`}
                            account={account}
                            index={index}
                            focused={focusedIndex === index}
                            onSelect={handleSelectAccount}
                            onRemove={handleRemoveAccount}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visited Accounts Section */}
                  {enhancedRecentAccounts.visitedAccounts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 px-2">
                        <Users className="w-3 h-3" />
                        <span>Recently Visited</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-1">
                        <div className="space-y-1">
                          {enhancedRecentAccounts.visitedAccounts.map((account, index) => (
                            <AccountCard
                              key={`visited-${account.steamId}`}
                              account={account}
                              index={enhancedRecentAccounts.manualAccounts.length + index}
                              focused={focusedIndex === enhancedRecentAccounts.manualAccounts.length + index}
                              onSelect={handleSelectAccount}
                              onRemove={handleRemoveAccount}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            type="submit"
            disabled={loading || !steamId.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="mt-4 w-full bg-primary/30 hover:bg-primary/40 text-primary border border-primary/40 hover:border-primary/50 px-6 py-3 rounded-lg font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-150 ease-out hover:shadow-lg hover:shadow-primary/25"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span>Fetching Steam data...</span>
              </div>
            ) : (
              'Analyze Gaming Time'
            )}
          </motion.button>
        </div>



        {/* Help Text */}
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card/30 border border-border/20 rounded-lg p-4 space-y-3"
          >
            <h4 className="font-medium text-primary">Multiple ways to find your Steam profile:</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">🔗 Steam Profile URL</p>
                <p className="text-sm text-muted-foreground">Copy and paste your full Steam profile URL</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Example: <code>https://steamcommunity.com/id/gabelogannewell</code></p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-foreground mb-1">🔢 Steam ID (64-bit)</p>
                <p className="text-sm text-muted-foreground">The traditional 17-digit Steam ID</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Example: <code>76561198000000000</code></p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/20">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Go to your Steam profile and copy the URL from your browser!
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </form>
    </div>
  )
}

interface AccountCardProps {
  account: RecentAccount
  index: number
  focused: boolean
  onSelect: (account: RecentAccount) => void
  onRemove: (e: React.MouseEvent, steamId: string) => void
}

function AccountCard({ account, index, focused, onSelect, onRemove }: AccountCardProps) {
  return (
    <motion.div
      onClick={() => onSelect(account)}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${focused ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <img 
        src={account.avatar} 
        alt={account.personaName}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {account.personaName}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          {formatPlaytime(account.totalPlaytime)}
        </div>
        <div className="text-xs text-muted-foreground/70 truncate">
          Steam ID: {account.steamId}
        </div>
      </div>
      <button
        onClick={(e) => onRemove(e, account.steamId)}
        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
} 