import { motion } from 'framer-motion'
import { ArrowLeft, User, ExternalLink, Clock, Calendar, Users } from 'lucide-react'
import { recentAccountsStorage } from '@/lib/recentAccounts'

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

interface FriendsListProps {
  friends: FriendData[]
  totalFriends: number
  loading: boolean
  error: string | null
  onBack: () => void
  onSelectFriend: (steamId: string, personaName: string) => void
}

export function FriendsList({ friends, totalFriends, loading, error, onBack, onSelectFriend }: FriendsListProps) {
  const getPersonaStatus = (state: number) => {
    const statusMap = {
      0: { text: 'Offline', color: 'text-gray-500', bgColor: 'bg-gray-500' },
      1: { text: 'Online', color: 'text-green-500', bgColor: 'bg-green-500' },
      2: { text: 'Busy', color: 'text-red-500', bgColor: 'bg-red-500' },
      3: { text: 'Away', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
      4: { text: 'Snooze', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
      5: { text: 'Looking to trade', color: 'text-blue-500', bgColor: 'bg-blue-500' },
      6: { text: 'Looking to play', color: 'text-purple-500', bgColor: 'bg-purple-500' },
    }
    return statusMap[state as keyof typeof statusMap] || { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-500' }
  }

  const formatFriendSince = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString()
  }

  const onlineFriends = friends.filter(friend => friend.personaState > 0)
  const offlineFriends = friends.filter(friend => friend.personaState === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="crypto-card p-6 mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="crypto-button p-2 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends List ({totalFriends})
          </h3>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-red-400 mb-4">{error}</p>
          <motion.button
            onClick={onBack}
            className="crypto-button px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        </div>
      )}

      {!loading && !error && friends.length === 0 && (
        <div className="text-center py-10">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No friends found or friends list is private.</p>
          <motion.button
            onClick={onBack}
            className="crypto-button px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        </div>
      )}

      {!loading && !error && friends.length > 0 && (
        <div className="space-y-4">
          {/* Friends List - Scrollable Container */}
          <div className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-2 border border-border/10 rounded-lg">
            <div className="space-y-3 p-2">
              {/* Online Friends */}
              {onlineFriends.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm py-2 -my-2 z-10 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Online ({onlineFriends.length})
                  </h4>
                  {onlineFriends.map((friend, index) => (
                    <FriendCard key={friend.steamId} friend={friend} index={index} onSelect={onSelectFriend} />
                  ))}
                </div>
              )}

              {/* Offline Friends */}
              {offlineFriends.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-foreground flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm py-2 -my-2 z-10 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    Offline ({offlineFriends.length})
                  </h4>
                  {offlineFriends.map((friend, index) => (
                    <FriendCard key={friend.steamId} friend={friend} index={index + onlineFriends.length} onSelect={onSelectFriend} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          {friends.length > 3 && (
            <div className="text-center text-xs text-muted-foreground">
              Scroll to see more friends ({friends.length} total)
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

interface FriendCardProps {
  friend: FriendData
  index: number
  onSelect: (steamId: string, personaName: string) => void
}

function FriendCard({ friend, index, onSelect }: FriendCardProps) {
  const getPersonaStatus = (state: number) => {
    const statusMap = {
      0: { text: 'Offline', color: 'text-gray-500', bgColor: 'bg-gray-500' },
      1: { text: 'Online', color: 'text-green-500', bgColor: 'bg-green-500' },
      2: { text: 'Busy', color: 'text-red-500', bgColor: 'bg-red-500' },
      3: { text: 'Away', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
      4: { text: 'Snooze', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
      5: { text: 'Looking to trade', color: 'text-blue-500', bgColor: 'bg-blue-500' },
      6: { text: 'Looking to play', color: 'text-purple-500', bgColor: 'bg-purple-500' },
    }
    return statusMap[state as keyof typeof statusMap] || { text: 'Unknown', color: 'text-gray-500', bgColor: 'bg-gray-500' }
  }

  const formatFriendSince = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString()
  }

  const status = getPersonaStatus(friend.personaState)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card/30 border border-border/20 rounded-lg p-4 hover:bg-card/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
      onClick={() => {
        // Track this as a visited account
        recentAccountsStorage.addVisitedAccount({
          steamId: friend.steamId,
          personaName: friend.personaName,
          avatar: friend.avatarMedium || friend.avatar,
          totalPlaytime: 0 // We don't have playtime data for friends
        })
        onSelect(friend.steamId, friend.personaName)
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={friend.avatarMedium || friend.avatar}
            alt={`${friend.personaName}'s avatar`}
            className="w-12 h-12 rounded-lg border border-border/20"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
          <div className="w-12 h-12 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center hidden">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status.bgColor} border-2 border-background`}></div>
        </div>

        {/* Friend Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {friend.personaName}
            </p>
          </div>
          
          <p className={`text-xs ${status.color} mb-2`}>
            {status.text}
          </p>

          {friend.realName && (
            <p className="text-xs text-muted-foreground mb-1 truncate">
              {friend.realName}
            </p>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Friends since {formatFriendSince(friend.friendSince)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <a
            href={friend.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded"
            title="View Steam Profile"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded"
            onClick={(e) => {
              e.stopPropagation()
              // Track this as a visited account
              recentAccountsStorage.addVisitedAccount({
                steamId: friend.steamId,
                personaName: friend.personaName,
                avatar: friend.avatarMedium || friend.avatar,
                totalPlaytime: 0 // We don't have playtime data for friends
              })
              onSelect(friend.steamId, friend.personaName)
            }}
            title="View Gaming Data"
          >
            <Clock className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
} 