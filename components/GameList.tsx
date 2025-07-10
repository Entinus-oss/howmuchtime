import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Eye, EyeOff, SortAsc, SortDesc } from 'lucide-react'
import { GameCard } from './GameCard'
import { GameAnalytics } from './GameAnalytics'

interface GameData {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  playtime_2weeks?: number
}

interface GameListProps {
  games: GameData[]
  formatPlaytime: (minutes: number) => string
  hiddenGames: Set<number>
  onToggleHidden: (appid: number) => void
  onClose: () => void
  steamId: string
}

export function GameList({ games, formatPlaytime, hiddenGames, onToggleHidden, onClose, steamId }: GameListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'playtime'>('playtime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const filteredAndSortedGames = useMemo(() => {
    let filtered = games.filter(game => 
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else {
        comparison = a.playtime_forever - b.playtime_forever
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [games, searchQuery, sortBy, sortOrder])

  const handleSortChange = (newSortBy: 'name' | 'playtime') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder(newSortBy === 'name' ? 'asc' : 'desc')
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

  const hiddenCount = Array.from(hiddenGames).length
  const visibleCount = filteredAndSortedGames.filter(game => !hiddenGames.has(game.appid)).length

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background/95 backdrop-blur-md border border-border/20 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden will-change-transform"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold glow-text">All Games Library</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/20 rounded-lg transition-colors duration-150"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/20 rounded-lg
                         text-foreground placeholder-muted-foreground backdrop-blur-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                         transition-all duration-150"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('name')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  sortBy === 'name' 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-card/50 text-muted-foreground hover:bg-muted/20'
                }`}
              >
                Name
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleSortChange('playtime')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  sortBy === 'playtime' 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'bg-card/50 text-muted-foreground hover:bg-muted/20'
                }`}
              >
                Playtime
                {sortBy === 'playtime' && (
                  sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <span>Total: {games.length} games</span>
            <span>Visible: {visibleCount} games</span>
            {hiddenCount > 0 && <span>Hidden: {hiddenCount} games</span>}
            <span>Filtered: {filteredAndSortedGames.length} games</span>
          </div>
        </div>

        {/* Game List */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 scroll-smooth overscroll-contain">
          {filteredAndSortedGames.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No games found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedGames.map((game, index) => (
                <motion.div
                  key={game.appid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                >
                  <GameCard
                    game={game}
                    rank={index + 1}
                    formatPlaytime={formatPlaytime}
                    isHidden={hiddenGames.has(game.appid)}
                    onToggleHidden={onToggleHidden}
                    onShowAnalytics={handleShowAnalytics}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <GameAnalytics
          steamId={steamId}
          gameIds={selectedGameIds}
          onClose={handleCloseAnalytics}
        />
      )}
    </>
  )
} 