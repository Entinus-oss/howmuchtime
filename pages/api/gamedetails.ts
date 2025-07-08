import type { NextApiRequest, NextApiResponse } from 'next'

const STEAM_API_KEY = process.env.STEAM_API_KEY

interface GameDetails {
  appid: number
  name: string
  type: string
  required_age: number
  is_free: boolean
  detailed_description: string
  short_description: string
  supported_languages: string
  reviews: string
  header_image: string
  website: string
  developers: string[]
  publishers: string[]
  price_overview?: {
    currency: string
    initial: number
    final: number
    discount_percent: number
    initial_formatted: string
    final_formatted: string
  }
  platforms: {
    windows: boolean
    mac: boolean
    linux: boolean
  }
  metacritic?: {
    score: number
    url: string
  }
  categories: Array<{
    id: number
    description: string
  }>
  genres: Array<{
    id: string
    description: string
  }>
  screenshots: Array<{
    id: number
    path_thumbnail: string
    path_full: string
  }>
  movies?: Array<{
    id: number
    name: string
    thumbnail: string
    webm: {
      480: string
      max: string
    }
    mp4: {
      480: string
      max: string
    }
    highlight: boolean
  }>
  recommendations?: {
    total: number
  }
  achievements?: {
    total: number
    highlighted: Array<{
      name: string
      path: string
    }>
  }
  release_date: {
    coming_soon: boolean
    date: string
  }
  support_info: {
    url: string
    email: string
  }
  background: string
  content_descriptors: {
    ids: number[]
    notes: string
  }
}

interface GameDetailsResponse {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { gameIds } = req.query

  if (!gameIds) {
    return res.status(400).json({ message: 'Game IDs are required' })
  }

  try {
    const gameIdsArray = typeof gameIds === 'string' ? gameIds.split(',') : []
    
    if (gameIdsArray.length === 0) {
      return res.status(400).json({ message: 'At least one game ID is required' })
    }

    const gameDetailsData: GameDetailsResponse[] = []

    // Process games in batches to avoid overwhelming the API
    for (const gameId of gameIdsArray.slice(0, 20)) { // Limit to 20 games at a time
      try {
        // Get game details from Steam store API
        const storeUrl = `https://store.steampowered.com/api/appdetails?appids=${gameId}&format=json`
        const storeResponse = await fetch(storeUrl)
        
        if (!storeResponse.ok) {
          console.warn(`Failed to fetch store details for game ${gameId}`)
          continue
        }

        const storeResult = await storeResponse.json()
        
        if (!storeResult[gameId] || !storeResult[gameId].success || !storeResult[gameId].data) {
          continue
        }

        const gameData: GameDetails = storeResult[gameId].data

        // Parse and format the data
        const gameDetails: GameDetailsResponse = {
          appid: parseInt(gameId),
          name: gameData.name,
          releaseDate: gameData.release_date.date,
          isFree: gameData.is_free,
          price: gameData.price_overview ? {
            currency: gameData.price_overview.currency,
            current: gameData.price_overview.final_formatted,
            original: gameData.price_overview.initial_formatted,
            discount: gameData.price_overview.discount_percent
          } : undefined,
          developers: gameData.developers || [],
          publishers: gameData.publishers || [],
          platforms: gameData.platforms,
          categories: gameData.categories?.map(cat => cat.description) || [],
          genres: gameData.genres?.map(genre => genre.description) || [],
          metacriticScore: gameData.metacritic?.score,
          totalAchievements: gameData.achievements?.total,
          totalRecommendations: gameData.recommendations?.total,
          headerImage: gameData.header_image,
          description: gameData.short_description,
          website: gameData.website
        }

        gameDetailsData.push(gameDetails)

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Error fetching details for game ${gameId}:`, error)
        continue
      }
    }

    res.status(200).json({
      games: gameDetailsData,
      totalGames: gameDetailsData.length
    })
  } catch (error) {
    console.error('Error fetching game details:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 