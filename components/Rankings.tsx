import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Medal, Award, Crown, Users, Clock, User } from 'lucide-react'
import { recentAccountsStorage } from '@/lib/recentAccounts'

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

interface RankingsProps {
  data: RankingsData
  loading: boolean
  error: string | null
  onBack: () => void
  onSelectPlayer: (steamId: string, personaName: string) => void
}

export function Rankings({ data, loading, error, onBack, onSelectPlayer }: RankingsProps) {

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    if (hours >= 1000) {
      return `${(hours / 1000).toFixed(1)}k hrs`
    }
    return `${hours} hrs`
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getPersonaStatus = (state: number) => {
    return state === 1 ? 'border-green-500' : 'border-gray-500'
  }

  const currentData = data.friends || []
  const userRank = data.userRank || 0
  const totalPlayers = data.totalPlayers || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="crypto-button p-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gaming Rankings</h2>
            <p className="text-muted-foreground">Compare your gaming hours with others</p>
          </div>
        </div>
        <Trophy className="w-8 h-8 text-primary" />
      </div>

      {/* User Rank Summary */}
      <div className="crypto-card p-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">#{userRank}</div>
          <div className="text-lg text-muted-foreground">Among Friends</div>
          <div className="text-sm text-muted-foreground">({totalPlayers} players)</div>
        </div>
      </div>

      {/* Description */}
      <div className="text-center text-sm text-muted-foreground">
        Your ranking among Steam friends based on total gaming hours
      </div>

      {/* Loading State */}
      {loading && (
        <div className="crypto-card p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Loading rankings...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="crypto-card p-6 border border-red-500/20 bg-red-500/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Rankings List */}
      {!loading && !error && (
        <div className="crypto-card p-6">
          <div className="space-y-4">
            {currentData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No friends data available</p>
                <p className="text-sm mt-2">Add some Steam friends to see rankings!</p>
              </div>
            ) : (
              <>
                {/* Scrollable Rankings Container */}
                <div className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2 border border-border/10 rounded-lg">
                  <div className="space-y-3 p-2">
                    {currentData.map((player, index) => {
                      const isUser = player.personaName.includes('(You)')
                      
                      return (
                        <motion.div
                          key={player.steamId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                            isUser 
                              ? 'bg-primary/20 border border-primary/30' 
                              : 'bg-secondary/50 hover:bg-secondary/80'
                          } ${!isUser && !player.steamId.startsWith('mock_') ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (!isUser && !player.steamId.startsWith('mock_')) {
                              // Track this as a visited account
                              recentAccountsStorage.addVisitedAccount({
                                steamId: player.steamId,
                                personaName: player.personaName,
                                avatar: player.avatarMedium,
                                totalPlaytime: player.totalPlaytime
                              })
                              onSelectPlayer(player.steamId, player.personaName)
                            }
                          }}
                        >
                          {/* Rank */}
                          <div className="flex items-center justify-center w-10">
                            {getRankIcon(player.rank)}
                          </div>

                          {/* Avatar */}
                          <div className="relative">
                            <img
                              src={player.avatarMedium}
                              alt={`${player.personaName}'s avatar`}
                              className={`w-12 h-12 rounded-lg border-2 ${getPersonaStatus(player.personaState)}`}
                            />
                            {player.personaState === 1 && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>

                          {/* Player Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium truncate ${isUser ? 'text-primary' : 'text-foreground'}`}>
                                {player.personaName}
                              </h4>
                              {isUser && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">YOU</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatPlaytime(player.totalPlaytime)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{player.totalGames} games</span>
                              </div>
                            </div>
                          </div>

                          {/* Playtime Badge */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground">
                              {formatPlaytime(player.totalPlaytime)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {player.totalGames} games
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Scroll Indicator */}
                {currentData.length > 3 && (
                  <div className="text-center text-xs text-muted-foreground">
                    Scroll to see more players ({currentData.length} total)
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 