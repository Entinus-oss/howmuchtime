import { motion } from 'framer-motion'
import { ExternalLink, Calendar, MapPin, Users, Trophy, Star, Hash } from 'lucide-react'

interface SteamProfile {
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

interface SteamProfileProps {
  profile: SteamProfile
  onViewFriends?: () => void
  onViewRankings?: () => void
}

export function SteamProfile({ profile, onViewFriends, onViewRankings }: SteamProfileProps) {
  const getPersonaStatus = (state: number) => {
    const statusMap = {
      0: { text: 'Offline', color: 'text-gray-500' },
      1: { text: 'Online', color: 'text-green-500' },
      2: { text: 'Busy', color: 'text-red-500' },
      3: { text: 'Away', color: 'text-yellow-500' },
      4: { text: 'Snooze', color: 'text-yellow-500' },
      5: { text: 'Looking to trade', color: 'text-blue-500' },
      6: { text: 'Looking to play', color: 'text-purple-500' },
    }
    return statusMap[state as keyof typeof statusMap] || { text: 'Unknown', color: 'text-gray-500' }
  }

  const formatAccountAge = (timeCreated?: number) => {
    if (!timeCreated) return null
    const createdDate = new Date(timeCreated * 1000)
    const now = new Date()
    const years = now.getFullYear() - createdDate.getFullYear()
    return `${years} years`
  }

  const status = getPersonaStatus(profile.personaState)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="crypto-card p-6 mb-8"
    >
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={profile.avatarFull}
            alt={`${profile.personaName}'s avatar`}
            className="w-20 h-20 rounded-lg border-2 border-primary/20"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status.color.replace('text-', 'bg-')} border-2 border-background`}></div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-foreground">{profile.personaName}</h3>
            <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
          </div>

          {profile.realName && (
            <p className="text-muted-foreground mb-2">{profile.realName}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {profile.steamLevel !== undefined && profile.steamLevel > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>Level {profile.steamLevel}</span>
              </div>
            )}

            {profile.timeCreated && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Account: {formatAccountAge(profile.timeCreated)}</span>
              </div>
            )}
            
            {profile.countryCode && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.countryCode}</span>
              </div>
            )}
            
            {/* Steam ID Snippet */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
              <Hash className="w-3 h-3" />
              <span>Steam ID: {profile.steamId}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {onViewFriends && (
            <motion.button
              onClick={onViewFriends}
              className="crypto-button px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-4 h-4" />
              View Friends
            </motion.button>
          )}

          {onViewRankings && (
            <motion.button
              onClick={onViewRankings}
              className="crypto-button px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="w-4 h-4" />
              Rankings
            </motion.button>
          )}
          
          <motion.a
            href={profile.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="crypto-button px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink className="w-4 h-4" />
            View Profile
          </motion.a>
        </div>
      </div>
    </motion.div>
  )
} 