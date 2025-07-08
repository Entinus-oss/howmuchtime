export interface RecentAccount {
  steamId: string
  personaName: string
  avatar: string
  totalPlaytime: number
  lastAccessed: number
}

export interface EnhancedRecentAccounts {
  manualAccounts: RecentAccount[]
  visitedAccounts: RecentAccount[]
}

const MANUAL_ACCOUNTS_KEY = 'howmuchtime_manual_accounts'
const VISITED_ACCOUNTS_KEY = 'howmuchtime_visited_accounts'
const MAX_MANUAL_ACCOUNTS = 2
const MAX_VISITED_ACCOUNTS = 5

export const recentAccountsStorage = {
  // Get all recent accounts from localStorage (legacy support)
  getRecentAccounts: (): RecentAccount[] => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem('howmuchtime_recent_accounts')
      if (!stored) return []
      
      const accounts: RecentAccount[] = JSON.parse(stored)
      // Sort by last accessed (most recent first)
      return accounts.sort((a, b) => b.lastAccessed - a.lastAccessed)
    } catch (error) {
      console.error('Error loading recent accounts:', error)
      return []
    }
  },

  // Get enhanced recent accounts with separate manual and visited
  getEnhancedRecentAccounts: (): EnhancedRecentAccounts => {
    if (typeof window === 'undefined') return { manualAccounts: [], visitedAccounts: [] }
    
    try {
      const manualStored = localStorage.getItem(MANUAL_ACCOUNTS_KEY)
      const visitedStored = localStorage.getItem(VISITED_ACCOUNTS_KEY)
      
      let manualAccounts: RecentAccount[] = manualStored ? JSON.parse(manualStored) : []
      let visitedAccounts: RecentAccount[] = visitedStored ? JSON.parse(visitedStored) : []
      
      // Migration: If new system is empty but legacy system has accounts, migrate them
      if (manualAccounts.length === 0 && visitedAccounts.length === 0) {
        const legacyAccounts = recentAccountsStorage.getRecentAccounts()
        if (legacyAccounts.length > 0) {
          // Since we can't know which legacy accounts were manual vs visited,
          // migrate all as visited accounts to be safe
          visitedAccounts = legacyAccounts.slice(0, MAX_VISITED_ACCOUNTS)
          
          // Save migrated accounts to new storage
          if (visitedAccounts.length > 0) {
            localStorage.setItem(VISITED_ACCOUNTS_KEY, JSON.stringify(visitedAccounts))
          }
        }
      }
      
      // Deduplication: Remove any accounts that appear in both sections
      // If an account is in manual, remove it from visited
      if (manualAccounts.length > 0 && visitedAccounts.length > 0) {
        const manualSteamIds = new Set(manualAccounts.map(acc => acc.steamId))
        visitedAccounts = visitedAccounts.filter(acc => !manualSteamIds.has(acc.steamId))
      }
      
      // Sort by last accessed (most recent first)
      return {
        manualAccounts: manualAccounts.sort((a, b) => b.lastAccessed - a.lastAccessed),
        visitedAccounts: visitedAccounts.sort((a, b) => b.lastAccessed - a.lastAccessed)
      }
    } catch (error) {
      console.error('Error loading enhanced recent accounts:', error)
      return { manualAccounts: [], visitedAccounts: [] }
    }
  },

  // Add or update a manual account (entered via Steam ID input)
  addManualAccount: (account: Omit<RecentAccount, 'lastAccessed'>) => {
    if (typeof window === 'undefined') return
    
    try {
      const { manualAccounts } = recentAccountsStorage.getEnhancedRecentAccounts()
      const now = Date.now()
      
      // Remove existing entry if it exists
      const filteredAccounts = manualAccounts.filter(
        acc => acc.steamId !== account.steamId
      )
      
      // Add new entry at the beginning
      const newAccount: RecentAccount = {
        ...account,
        lastAccessed: now
      }
      
      const updatedAccounts = [newAccount, ...filteredAccounts]
        .slice(0, MAX_MANUAL_ACCOUNTS) // Keep only the most recent manual accounts
      
      localStorage.setItem(MANUAL_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
      
      // Also update legacy storage for backward compatibility
      recentAccountsStorage.addRecentAccount(account)
    } catch (error) {
      console.error('Error saving manual account:', error)
    }
  },

  // Add or update a visited account (from friends/rankings)
  addVisitedAccount: (account: Omit<RecentAccount, 'lastAccessed'>) => {
    if (typeof window === 'undefined') return
    
    try {
      const { manualAccounts, visitedAccounts } = recentAccountsStorage.getEnhancedRecentAccounts()
      
      // Don't add to visited if it's already in manual accounts
      const isInManual = manualAccounts.some(acc => acc.steamId === account.steamId)
      if (isInManual) {
        return // Skip adding to visited accounts
      }
      
      const now = Date.now()
      
      // Remove existing entry if it exists
      const filteredAccounts = visitedAccounts.filter(
        acc => acc.steamId !== account.steamId
      )
      
      // Add new entry at the beginning
      const newAccount: RecentAccount = {
        ...account,
        lastAccessed: now
      }
      
      const updatedAccounts = [newAccount, ...filteredAccounts]
        .slice(0, MAX_VISITED_ACCOUNTS) // Keep only the most recent visited accounts
      
      localStorage.setItem(VISITED_ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    } catch (error) {
      console.error('Error saving visited account:', error)
    }
  },

  // Add or update a recent account (legacy support)
  addRecentAccount: (account: Omit<RecentAccount, 'lastAccessed'>) => {
    if (typeof window === 'undefined') return
    
    try {
      const existingAccounts = recentAccountsStorage.getRecentAccounts()
      const now = Date.now()
      
      // Remove existing entry if it exists
      const filteredAccounts = existingAccounts.filter(
        acc => acc.steamId !== account.steamId
      )
      
      // Add new entry at the beginning
      const newAccount: RecentAccount = {
        ...account,
        lastAccessed: now
      }
      
      const updatedAccounts = [newAccount, ...filteredAccounts]
        .slice(0, 5) // Keep only the most recent accounts
      
      localStorage.setItem('howmuchtime_recent_accounts', JSON.stringify(updatedAccounts))
    } catch (error) {
      console.error('Error saving recent account:', error)
    }
  },

  // Remove a specific account from both manual and visited
  removeAccount: (steamId: string) => {
    if (typeof window === 'undefined') return
    
    try {
      const { manualAccounts, visitedAccounts } = recentAccountsStorage.getEnhancedRecentAccounts()
      
      // Remove from manual accounts
      const filteredManual = manualAccounts.filter(acc => acc.steamId !== steamId)
      localStorage.setItem(MANUAL_ACCOUNTS_KEY, JSON.stringify(filteredManual))
      
      // Remove from visited accounts
      const filteredVisited = visitedAccounts.filter(acc => acc.steamId !== steamId)
      localStorage.setItem(VISITED_ACCOUNTS_KEY, JSON.stringify(filteredVisited))
      
      // Also remove from legacy storage
      recentAccountsStorage.removeRecentAccount(steamId)
    } catch (error) {
      console.error('Error removing account:', error)
    }
  },

  // Remove a specific account (legacy support)
  removeRecentAccount: (steamId: string) => {
    if (typeof window === 'undefined') return
    
    try {
      const existingAccounts = recentAccountsStorage.getRecentAccounts()
      const filteredAccounts = existingAccounts.filter(
        acc => acc.steamId !== steamId
      )
      
      localStorage.setItem('howmuchtime_recent_accounts', JSON.stringify(filteredAccounts))
    } catch (error) {
      console.error('Error removing recent account:', error)
    }
  },

  // Clear all recent accounts
  clearRecentAccounts: () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem('howmuchtime_recent_accounts')
      localStorage.removeItem(MANUAL_ACCOUNTS_KEY)
      localStorage.removeItem(VISITED_ACCOUNTS_KEY)
    } catch (error) {
      console.error('Error clearing recent accounts:', error)
    }
  }
}

// Format playtime for display
export const formatPlaytime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const years = Math.floor(days / 365)
  
  if (years > 0) {
    return `${years}y ${days % 365}d ${hours % 24}h`
  } else if (days > 0) {
    return `${days}d ${hours % 24}h`
  } else {
    return `${hours}h ${minutes % 60}m`
  }
} 