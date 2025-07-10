import { motion } from 'framer-motion'
import { User, ExternalLink } from 'lucide-react'
import { recentAccountsStorage } from '@/lib/recentAccounts'

interface ProfileSuggestion {
  personaName: string
  avatar: string
  profileUrl: string
  steamId: string
}

interface ProfileSuggestionsProps {
  suggestions: ProfileSuggestion[]
  onSelectProfile: (steamId: string, personaName: string) => void
  onClose: () => void
}

export function ProfileSuggestions({ suggestions, onSelectProfile, onClose }: ProfileSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="crypto-card p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Suggestions
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        We couldn't find an exact match, but here are some similar profiles:
      </p>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.steamId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-card/30 border border-border/20 rounded-lg hover:bg-card/50 hover:border-primary/30 transition-all duration-150 cursor-pointer group"
            onClick={() => {
              // Track this as a visited account
              recentAccountsStorage.addVisitedAccount({
                steamId: suggestion.steamId,
                personaName: suggestion.personaName,
                avatar: suggestion.avatar,
                totalPlaytime: 0 // We don't have playtime data for suggestions
              })
              onSelectProfile(suggestion.steamId, suggestion.personaName)
            }}
          >
            <div className="flex items-center gap-3">
              <img
                src={suggestion.avatar}
                alt={`${suggestion.personaName}'s avatar`}
                className="w-10 h-10 rounded-lg border border-border/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <div className="w-10 h-10 rounded-lg border border-border/20 bg-card/50 flex items-center justify-center hidden">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {suggestion.personaName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Steam ID: {suggestion.steamId.slice(-8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={suggestion.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded"
                title="View Steam Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 text-xs crypto-button rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  // Track this as a visited account
                  recentAccountsStorage.addVisitedAccount({
                    steamId: suggestion.steamId,
                    personaName: suggestion.personaName,
                    avatar: suggestion.avatar,
                    totalPlaytime: 0 // We don't have playtime data for suggestions
                  })
                  onSelectProfile(suggestion.steamId, suggestion.personaName)
                }}
              >
                Select
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-card/20 border border-border/10 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Click on a profile to load their gaming data, or use the external link to verify it's the right person.
        </p>
      </div>
    </motion.div>
  )
} 