import { useState, useEffect } from 'react'

interface GameData {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  playtime_2weeks?: number
}

const HIDDEN_GAMES_KEY = 'howmuchtime_hidden_games'

export class HiddenGamesManager {
  private hiddenGames: Set<number>

  constructor() {
    this.hiddenGames = new Set()
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    try {
      // Check if we're in the browser
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(HIDDEN_GAMES_KEY)
        if (stored) {
          const hiddenArray = JSON.parse(stored) as number[]
          this.hiddenGames = new Set(hiddenArray)
        }
      }
    } catch (error) {
      console.warn('Failed to load hidden games from localStorage:', error)
    }
  }

  private saveToStorage(): void {
    try {
      // Check if we're in the browser
      if (typeof window !== 'undefined' && window.localStorage) {
        const hiddenArray = Array.from(this.hiddenGames)
        localStorage.setItem(HIDDEN_GAMES_KEY, JSON.stringify(hiddenArray))
      }
    } catch (error) {
      console.warn('Failed to save hidden games to localStorage:', error)
    }
  }

  isHidden(appid: number): boolean {
    return this.hiddenGames.has(appid)
  }

  toggleHidden(appid: number): void {
    if (this.hiddenGames.has(appid)) {
      this.hiddenGames.delete(appid)
    } else {
      this.hiddenGames.add(appid)
    }
    this.saveToStorage()
  }

  getHiddenGames(): Set<number> {
    return new Set(this.hiddenGames)
  }

  getVisibleGames(games: GameData[]): GameData[] {
    return games.filter(game => !this.hiddenGames.has(game.appid))
  }

  getHiddenCount(): number {
    return this.hiddenGames.size
  }

  clearAll(): void {
    this.hiddenGames.clear()
    this.saveToStorage()
  }

  hideMultiple(appids: number[]): void {
    appids.forEach(appid => this.hiddenGames.add(appid))
    this.saveToStorage()
  }

  showMultiple(appids: number[]): void {
    appids.forEach(appid => this.hiddenGames.delete(appid))
    this.saveToStorage()
  }
}

// Custom hook for React components
export function useHiddenGames() {
  const [hiddenGamesManager] = useState(() => new HiddenGamesManager())
  const [hiddenGames, setHiddenGames] = useState<Set<number>>(new Set())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setHiddenGames(hiddenGamesManager.getHiddenGames())
  }, [hiddenGamesManager])

  const toggleHidden = (appid: number) => {
    if (isClient) {
      hiddenGamesManager.toggleHidden(appid)
      setHiddenGames(hiddenGamesManager.getHiddenGames())
    }
  }

  const getVisibleGames = (games: GameData[]) => {
    return hiddenGamesManager.getVisibleGames(games)
  }

  const getHiddenCount = () => {
    return hiddenGamesManager.getHiddenCount()
  }

  return {
    hiddenGames,
    toggleHidden,
    getVisibleGames,
    getHiddenCount,
    isClient,
    clearAll: () => {
      if (isClient) {
        hiddenGamesManager.clearAll()
        setHiddenGames(hiddenGamesManager.getHiddenGames())
      }
    }
  }
}

// Utility functions for calculating stats excluding hidden games
export function calculateVisibleStats(games: GameData[], hiddenGames: Set<number>) {
  const visibleGames = games.filter(game => !hiddenGames.has(game.appid))
  
  const totalGames = visibleGames.length
  const totalPlaytime = visibleGames.reduce((total, game) => total + game.playtime_forever, 0)
  
  const topGames = visibleGames
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 10)
  
  const recentGames = visibleGames
    .filter(game => game.playtime_2weeks && game.playtime_2weeks > 0)
    .sort((a, b) => (b.playtime_2weeks || 0) - (a.playtime_2weeks || 0))
    .slice(0, 5)

  return {
    totalGames,
    totalPlaytime,
    topGames,
    recentGames,
    visibleGames
  }
} 