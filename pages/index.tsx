import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { GameCard } from '@/components/GameCard'
import { StatsCard } from '@/components/StatsCard'
import { SteamIdInput } from '@/components/SteamIdInput'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { GameList } from '@/components/GameList'
import { SteamProfile } from '@/components/SteamProfile'
import { ProfileSuggestions } from '@/components/ProfileSuggestions'
import { FriendsList } from '@/components/FriendsList'
import { Rankings } from '@/components/Rankings'
import { GameAnalytics } from '@/components/GameAnalytics'
import { FunFacts } from '@/components/FunFacts'
import { InteractiveTitle } from '@/components/InteractiveTitle'
import { AuthenticationModal, useAuthentication } from '@/components/AuthenticationModal'

import { useHiddenGames, calculateVisibleStats } from '@/lib/gameUtils'
import { recentAccountsStorage } from '@/lib/recentAccounts'
import { Gamepad2, Clock, Trophy, TrendingUp, List, ArrowLeft, X } from 'lucide-react'

interface GameData {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  playtime_2weeks?: number
}

interface SteamProfileData {
  steamId: string
  personaName: string
  realName?: string
  avatar: string
  avatarMedium: string
  avatarFull: string
  profileUrl: string
  personaState: number
  communityVisibilityState: number
  timeCreated?: number
  countryCode?: string
  steamLevel?: number
}

interface ProfileSuggestion {
  personaName: string
  avatar: string
  profileUrl: string
  steamId: string
}

interface SteamData {
  games: GameData[]
  totalGames: number
  totalPlaytime: number
  profile: SteamProfileData
}

interface FriendData {
  steamId: string
  personaName: string
  avatar: string
  avatarMedium: string
  avatarFull: string
  profileUrl: string
  personaState: number
  communityVisibilityState: number
  friendSince: number
  realName?: string
  timeCreated?: number
  countryCode?: string
}

interface RankedPlayer {
  steamId: string
  personaName: string
  avatar: string
  avatarMedium: string
  avatarFull: string
  profileUrl: string
  personaState: number
  totalPlaytime: number
  totalGames: number
  rank: number
  countryCode?: string
  realName?: string
}

interface RankingsData {
  friends: RankedPlayer[]
  userRank: number
  totalPlayers: number
}

type ViewState = 'profile' | 'friends' | 'rankings'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [steamId, setSteamId] = useState<string>('')
  const [originalSteamId, setOriginalSteamId] = useState<string>('')
  const [steamData, setSteamData] = useState<SteamData | null>(null)
  const [originalSteamData, setOriginalSteamData] = useState<SteamData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileSuggestions, setProfileSuggestions] = useState<ProfileSuggestion[]>([])
  const [showGameList, setShowGameList] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([])
  const [showFunFacts, setShowFunFacts] = useState(false)
  
  // Friends state
  const [currentView, setCurrentView] = useState<ViewState>('profile')
  const [friendsData, setFriendsData] = useState<FriendData[]>([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [friendsError, setFriendsError] = useState<string | null>(null)
  const [totalFriends, setTotalFriends] = useState(0)
  
  // Rankings state
  const [rankingsData, setRankingsData] = useState<RankingsData | null>(null)
  const [rankingsLoading, setRankingsLoading] = useState(false)
  const [rankingsError, setRankingsError] = useState<string | null>(null)
  
  // Authentication state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { authSession, loading: authLoading, checkAuthStatus, logout } = useAuthentication()
  
  const { hiddenGames, toggleHidden, getHiddenCount, isClient } = useHiddenGames()

  // Handle SSR hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchSteamData = async (id: string, isOriginalSearch: boolean = false) => {
    setLoading(true)
    setError(null)
    setProfileSuggestions([])
    setCurrentView('profile') // Reset to profile view when fetching new data
    
    try {
      const response = await fetch(`/api/steam?steamid=${encodeURIComponent(id)}`)
      const data = await response.json()
      
      if (!response.ok) {
        // Check if response contains suggestions
        if (data.type === 'suggestions' && data.suggestions) {
          setProfileSuggestions(data.suggestions)
          setError(data.error)
          return
        }
        throw new Error(data.error || 'Failed to fetch Steam data')
      }
      
      setSteamData(data)
      setSteamId(id)
      
      // Save to recent accounts if successful
      if (data.profile && data.totalPlaytime !== undefined) {
        // Use manual account tracking for Steam IDs entered directly
        if (isOriginalSearch) {
          recentAccountsStorage.addManualAccount({
            steamId: data.profile.steamId,
            personaName: data.profile.personaName,
            avatar: data.profile.avatar,
            totalPlaytime: data.totalPlaytime
          })
        } else {
          // Use visited account tracking for accounts accessed from friends/rankings
          recentAccountsStorage.addVisitedAccount({
            steamId: data.profile.steamId,
            personaName: data.profile.personaName,
            avatar: data.profile.avatar,
            totalPlaytime: data.totalPlaytime
          })
        }
      }
      
      // If this is an original search (from input), save as original
      if (isOriginalSearch || !originalSteamId) {
        setOriginalSteamId(id)
        setOriginalSteamData(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchFriendsData = async (steamId: string) => {
    setFriendsLoading(true)
    setFriendsError(null)
    
    try {
      const response = await fetch(`/api/friends?steamid=${encodeURIComponent(steamId)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch friends data')
      }
      
      setFriendsData(data.friends)
      setTotalFriends(data.totalFriends)
    } catch (err) {
      setFriendsError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setFriendsLoading(false)
    }
  }

  const fetchRankingsData = async (steamId: string) => {
    setRankingsLoading(true)
    setRankingsError(null)
    
    try {
      const response = await fetch(`/api/rankings?steamid=${encodeURIComponent(steamId)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rankings data')
      }
      
      setRankingsData(data)
    } catch (err) {
      setRankingsError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRankingsLoading(false)
    }
  }

  const handleViewFriends = () => {
    if (steamData?.profile?.steamId) {
      setCurrentView('friends')
      fetchFriendsData(steamData.profile.steamId)
    }
  }

  const handleViewRankings = () => {
    if (steamData?.profile?.steamId) {
      setCurrentView('rankings')
      fetchRankingsData(steamData.profile.steamId)
    }
  }

  const handleBackToProfile = () => {
    setCurrentView('profile')
    setFriendsData([])
    setFriendsError(null)
    setRankingsData(null)
    setRankingsError(null)
  }

  const handleSelectFriend = (friendSteamId: string, friendName: string) => {
    fetchSteamData(friendSteamId, false) // Not an original search
  }

  const handleSelectPlayer = (playerSteamId: string, playerName: string) => {
    fetchSteamData(playerSteamId, false) // Not an original search
  }

  const handleSelectProfile = (steamId: string, personaName: string) => {
    setProfileSuggestions([])
    setError(null)
    fetchSteamData(steamId, true) // This is an original search
  }

  const handleBackToOriginal = () => {
    if (originalSteamId && originalSteamData) {
      setSteamId(originalSteamId)
      setSteamData(originalSteamData)
      setCurrentView('profile')
      setFriendsData([])
      setFriendsError(null)
      setRankingsData(null)
      setRankingsError(null)
    }
  }

  const handleShowAnalytics = (appid: number) => {
    setSelectedGameIds([appid])
    setShowAnalytics(true)
  }

  const handleCloseAnalytics = () => {
    setShowAnalytics(false)
    setSelectedGameIds([])
  }

  const formatPlaytime = (minutes: number) => {
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

  // Calculate visible stats excluding hidden games (for statistics only)
  const visibleStats = steamData && isClient ? calculateVisibleStats(steamData.games, hiddenGames) : {
    totalGames: steamData?.totalGames || 0,
    totalPlaytime: steamData?.totalPlaytime || 0,
    topGames: [],
    recentGames: [],
    visibleGames: steamData?.games || []
  }

  // Display lists include ALL games (hidden and visible) - sorted by playtime
  const allTopGames = steamData?.games
    ?.sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 10) || []
  
  const allRecentGames = steamData?.games
    ?.filter(game => game.playtime_2weeks && game.playtime_2weeks > 0)
    .sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0))
    .slice(0, 5) || []

  const handleSelectRecentAccount = (steamId: string) => {
    fetchSteamData(steamId, true) // Treat recent account selection as original search
  }

  // Handle authentication callback URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const authStatus = urlParams.get('auth')
      const steamid = urlParams.get('steamid')
      
      if (authStatus === 'success' && steamid) {
        // OAuth authentication successful
        fetchSteamData(steamid, true)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else if (authStatus === 'error' || authStatus === 'cancelled') {
        // Show error message
        const message = urlParams.get('message') || 'Authentication failed'
        setError(message)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [mounted])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Head>
          <title>HowMuchTime - Steam Gaming Analytics</title>
          <meta name="description" content="Discover your Steam gaming habits and achievements with crypto-style analytics" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen bg-background">
          <div className="flex items-center justify-center h-screen">
            <LoadingSpinner />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>HowMuchTime - Steam Gaming Analytics</title>
        <meta name="description" content="Track your Steam gaming time with a crypto-style dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="text-center mb-6">
              <InteractiveTitle className="glow-text" />
            </div>
            <div className="mt-12 mb-8">
              <SteamIdInput
                onSubmit={(id) => fetchSteamData(id, true)}
                onSelectRecentAccount={handleSelectRecentAccount}
                loading={loading}
                error={profileSuggestions.length > 0 ? null : error}
                onShowAuth={() => setShowAuthModal(true)}
              />
            </div>
          </motion.div>


        </div>

        {/* Loading State and Profile Suggestions - show regardless of steamData */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {/* Profile Suggestions */}
        {profileSuggestions.length > 0 && (
          <ProfileSuggestions
            suggestions={profileSuggestions}
            onSelectProfile={handleSelectProfile}
            onClose={() => {
              setProfileSuggestions([])
              setError(null)
            }}
          />
        )}

        {/* Content that shows only when Steam data is available */}
        {steamData && (
          <div className="max-w-7xl mx-auto">

          {/* Error Banner - Show when there's an error and steam data exists */}
          {error && steamData && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="text-red-400 font-semibold">Unable to Load Profile</h3>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
                <motion.button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Back to Original Profile Button */}
          {steamData && originalSteamId && steamId !== originalSteamId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <motion.button
                onClick={handleBackToOriginal}
                className="crypto-button px-4 py-2 rounded-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Original Profile ({originalSteamData?.profile?.personaName})
              </motion.button>
            </motion.div>
          )}

          {/* Profile Information with Friends and Rankings Buttons */}
          {steamData && steamData.profile && currentView === 'profile' && (
            <SteamProfile 
              profile={steamData.profile} 
              onViewFriends={handleViewFriends}
              onViewRankings={handleViewRankings}
            />
          )}

          {/* Friends List View */}
          {currentView === 'friends' && (
            <FriendsList
              friends={friendsData}
              totalFriends={totalFriends}
              loading={friendsLoading}
              error={friendsError}
              onBack={handleBackToProfile}
              onSelectFriend={handleSelectFriend}
            />
          )}

          {/* Rankings View */}
          {currentView === 'rankings' && (
            <Rankings
              data={rankingsData || {
                friends: [],
                userRank: 0,
                totalPlayers: 0
              }}
              loading={rankingsLoading}
              error={rankingsError}
              onBack={handleBackToProfile}
              onSelectPlayer={handleSelectPlayer}
            />
          )}

          {/* Stats Overview - Only show in profile view */}
          {steamData && currentView === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-12"
            >
              {/* Game List Button */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Gaming Statistics
                  {isClient && getHiddenCount() > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({getHiddenCount()} games hidden)
                    </span>
                  )}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGameList(true)}
                  className="crypto-button px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <List className="w-4 h-4" />
                  All Games ({steamData.totalGames})
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  icon={<Gamepad2 className="w-6 h-6" />}
                  title={isClient && getHiddenCount() > 0 ? "Visible Games" : "Total Games"}
                  value={visibleStats.totalGames.toString()}
                  subtitle={isClient && getHiddenCount() > 0 ? `of ${steamData.totalGames} total` : "in library"}
                />
                <StatsCard
                  icon={<Clock className="w-6 h-6" />}
                  title={isClient && getHiddenCount() > 0 ? "Visible Playtime" : "Total Playtime"}
                  value={formatPlaytime(visibleStats.totalPlaytime)}
                  subtitle="all time"
                  onClick={() => setShowFunFacts(true)}
                  showIndicator={true}
                />
                <StatsCard
                  icon={<Trophy className="w-6 h-6" />}
                  title="Most Played"
                  value={visibleStats.topGames[0]?.name || 'N/A'}
                  subtitle={visibleStats.topGames[0] ? formatPlaytime(visibleStats.topGames[0].playtime_forever) : ''}
                />
                <StatsCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Recent Favorite"
                  value={visibleStats.recentGames[0]?.name || 'N/A'}
                  subtitle={visibleStats.recentGames[0] ? `${formatPlaytime(visibleStats.recentGames[0].playtime_2weeks || 0)} recently` : ''}
                />
              </div>
            </motion.div>
          )}

          {/* Top Games */}
          {steamData && allTopGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-6 text-foreground">Most Played Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {allTopGames.slice(0, 10).map((game: GameData, index: number) => (
                  <GameCard
                    key={game.appid}
                    game={game}
                    rank={index + 1}
                    formatPlaytime={formatPlaytime}
                    isHidden={isClient ? hiddenGames.has(game.appid) : false}
                    onToggleHidden={isClient ? toggleHidden : undefined}
                    onShowAnalytics={handleShowAnalytics}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          {steamData && allRecentGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mb-12"
            >
              <h2 className="text-xl font-semibold mb-6 text-foreground">Recent Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {allRecentGames.slice(0, 5).map((game: GameData, index: number) => (
                  <GameCard
                    key={game.appid}
                    game={game}
                    rank={index + 1}
                    formatPlaytime={formatPlaytime}
                    showRecentPlaytime={true}
                    isHidden={isClient ? hiddenGames.has(game.appid) : false}
                    onToggleHidden={isClient ? toggleHidden : undefined}
                    onShowAnalytics={handleShowAnalytics}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Smart Shopper Score Section - At the end */}
          {steamData && currentView === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mb-12"
            >

            </motion.div>
          )}

          {showGameList && steamData && (
            <GameList
              games={steamData.games}
              formatPlaytime={formatPlaytime}
              hiddenGames={hiddenGames}
              onToggleHidden={toggleHidden}
              onClose={() => setShowGameList(false)}
              steamId={steamData.profile.steamId}
            />
          )}

          {/* Analytics Modal */}
          {showAnalytics && steamData && (
            <GameAnalytics
              steamId={steamData.profile.steamId}
              gameIds={selectedGameIds}
              onClose={handleCloseAnalytics}
            />
          )}

          {/* Fun Facts Modal */}
          {showFunFacts && steamData && (
            <FunFacts
              isOpen={showFunFacts}
              onClose={() => setShowFunFacts(false)}
              totalMinutes={visibleStats.totalPlaytime}
              isVisible={isClient && getHiddenCount() > 0}
            />
          )}

          {/* Authentication Modal */}
          <AuthenticationModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onAuthComplete={(steamId) => {
              fetchSteamData(steamId, true)
              checkAuthStatus()
            }}
          />
        </div>
        )}
      </div>
    </>
  )
} 