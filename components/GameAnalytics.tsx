import { motion } from 'framer-motion'
import { Trophy, Calendar, DollarSign, Star, Users, Award } from 'lucide-react'
import { useState, useEffect } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface Achievement {
  apiname: string
  achieved: number
  unlocktime: number
  name?: string
  description?: string
  icon?: string
  icongray?: string
}

interface GameAchievements {
  appid: number
  gameName: string
  achievements: Achievement[]
  totalAchievements: number
  unlockedAchievements: number
  completionPercentage: number
  isPrivateProfile?: boolean
}

interface GameDetails {
  appid: number
  name: string
  releaseDate: string
  isFree: boolean
  price?: {
    currency: string
    current: string
    original: string
    discount: number
  }
  developers: string[]
  publishers: string[]
  platforms: {
    windows: boolean
    mac: boolean
    linux: boolean
  }
  categories: string[]
  genres: string[]
  metacriticScore?: number
  totalAchievements?: number
  totalRecommendations?: number
  headerImage: string
  description: string
  website?: string
}

interface GameAnalyticsProps {
  steamId: string
  gameIds: number[]
  onClose: () => void
}

export function GameAnalytics({ steamId, gameIds, onClose }: GameAnalyticsProps) {
  const [achievements, setAchievements] = useState<GameAchievements[]>([])
  const [gameDetails, setGameDetails] = useState<GameDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrivateProfile, setIsPrivateProfile] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [steamId, gameIds])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch achievements and game details in parallel
      const [achievementsResponse, detailsResponse] = await Promise.all([
        fetch(`/api/achievements?steamId=${steamId}&gameIds=${gameIds.join(',')}`),
        fetch(`/api/gamedetails?gameIds=${gameIds.join(',')}`)
      ])

      if (!achievementsResponse.ok || !detailsResponse.ok) {
        let errorMessage = 'Failed to fetch analytics data'
        
        if (!achievementsResponse.ok) {
          try {
            const achievementsError = await achievementsResponse.json()
            errorMessage = achievementsError.message || errorMessage
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
        
        throw new Error(errorMessage)
      }

      const achievementsData = await achievementsResponse.json()
      const detailsData = await detailsResponse.json()

      setAchievements(achievementsData.games || [])
      setGameDetails(detailsData.games || [])
      setIsPrivateProfile(achievementsData.isPrivateProfile || false)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallStats = () => {
    // Only consider games that actually have achievements
    const gamesWithAchievements = achievements.filter(game => game.totalAchievements > 0)
    
    const totalAchievements = gamesWithAchievements.reduce((sum, game) => sum + game.totalAchievements, 0)
    const totalUnlocked = gamesWithAchievements.reduce((sum, game) => sum + game.unlockedAchievements, 0)
    const avgCompletion = gamesWithAchievements.length > 0 
      ? Math.round(gamesWithAchievements.reduce((sum, game) => sum + game.completionPercentage, 0) / gamesWithAchievements.length)
      : 0

    const avgMetacriticScore = gameDetails.filter(game => game.metacriticScore).length > 0
      ? Math.round(gameDetails.reduce((sum, game) => sum + (game.metacriticScore || 0), 0) / gameDetails.filter(game => game.metacriticScore).length)
      : 0

    return {
      totalAchievements,
      totalUnlocked,
      avgCompletion,
      avgMetacriticScore,
      gamesWithAchievements: gamesWithAchievements.length,
      totalGames: achievements.length
    }
  }











  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const formatUnlockTime = (timestamp: number) => {
    if (!timestamp) return 'Not unlocked'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="crypto-card p-8">
          <LoadingSpinner />
          <p className="text-center mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="crypto-card p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Award className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const stats = calculateOverallStats()

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="crypto-card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Game Analytics</h1>
                <p className="text-muted-foreground">
                  Analyzing {gameIds.length} games from your Steam library
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="crypto-card"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Achievements</h3>
                  <p className="text-2xl font-bold">
                    {isPrivateProfile ? 'Private' : stats.totalAchievements === 0 ? 'N/A' : `${stats.totalUnlocked}/${stats.totalAchievements}`}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {isPrivateProfile 
                  ? 'Profile privacy restricts achievement data'
                  : stats.totalAchievements === 0
                    ? 'No games with achievements'
                    : `${stats.avgCompletion}% average completion (${stats.gamesWithAchievements}/${stats.totalGames} games)`
                }
              </div>
            </motion.div>



            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="crypto-card"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Metacritic</h3>
                  <p className="text-2xl font-bold">{stats.avgMetacriticScore || 'N/A'}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Average score
              </div>
            </motion.div>
          </div>

          {/* Games List */}
          <div className="space-y-6">
            {gameDetails.map((game, index) => {
              const gameAchievements = achievements.find(a => a.appid === game.appid)
              
              return (
                <motion.div
                  key={game.appid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="crypto-card"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Game Header */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={game.headerImage}
                          alt={game.name}
                          className="w-32 h-18 object-cover rounded-lg neon-border"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{game.description}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {game.genres.slice(0, 3).map((genre, idx) => (
                              <span key={idx} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs">
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Game Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                          </div>
                          <p className="text-sm font-semibold">Release Date</p>
                          <p className="text-xs text-muted-foreground">{formatDate(game.releaseDate)}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="w-4 h-4 mr-1" />
                          </div>
                          <p className="text-sm font-semibold">Price</p>
                          <p className="text-xs text-muted-foreground">
                            {game.isFree ? 'Free' : (game.price?.current || 'N/A')}
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Star className="w-4 h-4 mr-1" />
                          </div>
                          <p className="text-sm font-semibold">Metacritic</p>
                          <p className="text-xs text-muted-foreground">{game.metacriticScore || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="w-4 h-4 mr-1" />
                          </div>
                          <p className="text-sm font-semibold">Recommendations</p>
                          <p className="text-xs text-muted-foreground">{game.totalRecommendations || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                                         {/* Achievements */}
                     <div className="lg:w-1/3">
                       <div className="crypto-card bg-primary/5">
                         <div className="flex items-center space-x-2 mb-4">
                           <Trophy className="w-5 h-5 text-primary" />
                           <h4 className="font-semibold">Achievements</h4>
                         </div>
                         
                         {gameAchievements ? (
                           <>
                             <div className="mb-4">
                               <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm">Progress</span>
                                 <span className="text-sm font-semibold">
                                   {gameAchievements.totalAchievements === 0
                                     ? "N/A"
                                     : gameAchievements.isPrivateProfile || isPrivateProfile 
                                       ? `0/${gameAchievements.totalAchievements}*`
                                       : `${gameAchievements.unlockedAchievements}/${gameAchievements.totalAchievements}`
                                   }
                                 </span>
                               </div>
                               {gameAchievements.totalAchievements > 0 && (
                                 <div className="w-full bg-muted rounded-full h-2">
                                   <div 
                                     className="bg-primary h-2 rounded-full transition-all duration-150"
                                     style={{ width: `${gameAchievements.isPrivateProfile || isPrivateProfile ? 0 : gameAchievements.completionPercentage}%` }}
                                   />
                                 </div>
                               )}
                               <p className="text-xs text-muted-foreground mt-1">
                                 {gameAchievements.totalAchievements === 0
                                   ? 'This game does not support achievements'
                                   : gameAchievements.isPrivateProfile || isPrivateProfile
                                     ? '*Profile is private - progress unavailable'
                                     : `${gameAchievements.completionPercentage}% complete`
                                 }
                               </p>
                             </div>

                             {/* Recent Achievements */}
                             <div className="space-y-2">
                               <h5 className="text-sm font-semibold mb-2">Recent Unlocks</h5>
                               {gameAchievements.isPrivateProfile || isPrivateProfile ? (
                                 <div className="text-center py-2">
                                   <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                                     <Award className="w-3 h-3" />
                                     <span>Profile privacy restricts achievement details</span>
                                   </div>
                                 </div>
                               ) : gameAchievements.achievements
                                 .filter(a => a.achieved === 1)
                                 .sort((a, b) => b.unlocktime - a.unlocktime)
                                 .slice(0, 3)
                                 .length > 0 ? (
                                 gameAchievements.achievements
                                   .filter(a => a.achieved === 1)
                                   .sort((a, b) => b.unlocktime - a.unlocktime)
                                   .slice(0, 3)
                                   .map((achievement, idx) => (
                                     <div key={idx} className="flex items-center space-x-2 text-xs">
                                       <Award className="w-3 h-3 text-green-400 flex-shrink-0" />
                                       <div className="flex-1 min-w-0">
                                         <p className="font-medium truncate">{achievement.name}</p>
                                         <p className="text-muted-foreground">
                                           {formatUnlockTime(achievement.unlocktime)}
                                         </p>
                                       </div>
                                     </div>
                                   ))
                               ) : (
                                 <p className="text-xs text-muted-foreground">
                                   {gameAchievements.totalAchievements === 0 
                                     ? "This game has no achievements"
                                     : "No achievements unlocked yet"}
                                 </p>
                               )}
                             </div>
                           </>
                         ) : (
                           <div className="text-center py-4">
                             <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                             <p className="text-sm text-muted-foreground">
                               Achievement data unavailable
                             </p>
                             <p className="text-xs text-muted-foreground">
                               Profile may be private or game doesn't support achievements
                             </p>
                           </div>
                         )}
                       </div>
                     </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 