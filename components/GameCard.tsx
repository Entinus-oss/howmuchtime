import { motion } from 'framer-motion'
import { Clock, Calendar, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface GameData {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  playtime_2weeks?: number
}

interface GameCardProps {
  game: GameData
  rank: number
  formatPlaytime: (minutes: number) => string
  showRecentPlaytime?: boolean
  isHidden?: boolean
  onToggleHidden?: (appid: number) => void
  onShowAnalytics?: (appid: number) => void
}

export function GameCard({ game, rank, formatPlaytime, showRecentPlaytime, isHidden, onToggleHidden, onShowAnalytics }: GameCardProps) {
  const iconUrl = game.img_icon_url 
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
    : `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1a1a1a"/><rect x="8" y="8" width="48" height="48" fill="#333" rx="8"/><circle cx="32" cy="24" r="6" fill="#00ffff"/><rect x="20" y="36" width="24" height="4" fill="#00ffff" rx="2"/><rect x="24" y="44" width="16" height="4" fill="#666" rx="2"/></svg>')}`

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleHidden) {
      onToggleHidden(game.appid)
    }
  }

  const handleCardClick = () => {
    if (onShowAnalytics) {
      onShowAnalytics(game.appid)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      transition={{ 
        default: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.3, delay: rank * 0.1 },
        y: { duration: 0.3, delay: rank * 0.1 }
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={onShowAnalytics ? { scale: 0.95 } : undefined}
      className={`crypto-card group relative overflow-hidden ${onShowAnalytics ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        contain: 'layout style paint'
      }}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-bold neon-border">
          #{rank}
        </div>
      </div>

      {/* Hide/Show Button */}
      {onToggleHidden && (
        <button
          className="absolute bottom-4 right-4 z-10 cursor-pointer"
          onClick={handleToggleClick}
          title={isHidden ? "Click to show in stats" : "Click to hide from stats"}
        >
          <div className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
            isHidden 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          } backdrop-blur-sm border border-border/20`}>
            {isHidden ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </div>
        </button>
      )}

      {/* Game Icon */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden neon-border">
          <Image
            src={iconUrl}
            alt={game.name}
            width={64}
            height={64}
            className="object-cover"
            priority={rank <= 5}
            loading={rank <= 5 ? "eager" : "lazy"}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1a1a1a"/><rect x="8" y="8" width="48" height="48" fill="#333" rx="8"/><circle cx="32" cy="24" r="6" fill="#00ffff"/><rect x="20" y="36" width="24" height="4" fill="#00ffff" rx="2"/><rect x="24" y="44" width="16" height="4" fill="#666" rx="2"/></svg>')}`
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors duration-200">
            {game.name}
          </h3>
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatPlaytime(game.playtime_forever)}</span>
          </div>
        </div>
      </div>

      {/* Recent Playtime */}
      {showRecentPlaytime && game.playtime_2weeks && (
        <div className="flex items-center space-x-2 text-accent text-sm">
          <Calendar className="w-4 h-4" />
          <span>{formatPlaytime(game.playtime_2weeks)} (2 weeks)</span>
        </div>
      )}

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      
      {/* Border Animation */}
      <div className="absolute inset-0 border border-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </motion.div>
  )
} 