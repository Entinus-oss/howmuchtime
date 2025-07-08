import type { NextApiRequest, NextApiResponse } from 'next'

const STEAM_API_KEY = process.env.STEAM_API_KEY

interface Achievement {
  apiname: string
  achieved: number
  unlocktime: number
  name?: string
  description?: string
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

interface AchievementSchema {
  name: string
  displayName: string
  description: string
  icon: string
  icongray: string
  hidden: number
}

interface GameSchema {
  gameName: string
  gameVersion: string
  availableGameStats: {
    achievements: AchievementSchema[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { steamId, gameIds } = req.query
  
  console.log('Achievements API called with:', { steamId, gameIds, hasApiKey: !!STEAM_API_KEY })

  if (!steamId || !STEAM_API_KEY) {
    console.error('Missing steamId or API key')
    return res.status(400).json({ message: 'Steam ID and API key are required' })
  }

  try {
    const gameIdsArray = typeof gameIds === 'string' ? gameIds.split(',') : []
    
    if (gameIdsArray.length === 0) {
      console.error('No game IDs provided')
      return res.status(400).json({ message: 'At least one game ID is required' })
    }

    // Check if profile is public first
    const playerUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}&format=json`
    const playerResponse = await fetch(playerUrl)
    
    if (!playerResponse.ok) {
      return res.status(400).json({ message: 'Failed to verify Steam profile' })
    }
    
    const playerData = await playerResponse.json()
    const player = playerData.response?.players?.[0]
    
    if (!player) {
      return res.status(404).json({ message: 'Steam profile not found' })
    }
    
    const isPublicProfile = player.communityvisibilitystate === 3
    console.log(`Profile visibility for ${player.personaname}: ${player.communityvisibilitystate} (${isPublicProfile ? 'Public' : 'Private/Friends Only'})`)
    
    if (!isPublicProfile) {
      // For private profiles, we can still get game schema but not player achievements
      console.log('Profile is private, showing schema data only')
      const achievementsData: GameAchievements[] = []
      
      for (const gameId of gameIdsArray.slice(0, 10)) {
        try {
          const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?appid=${gameId}&key=${STEAM_API_KEY}&format=json`
          const schemaResponse = await fetch(schemaUrl)
          
          if (schemaResponse.ok) {
            const schemaResult = await schemaResponse.json()
            const gameName = schemaResult.game?.gameName || `Game ${gameId}`
            const hasAchievements = schemaResult.game?.availableGameStats?.achievements?.length > 0
            
            achievementsData.push({
              appid: parseInt(gameId),
              gameName,
              achievements: [],
              totalAchievements: hasAchievements ? schemaResult.game.availableGameStats.achievements.length : 0,
              unlockedAchievements: 0,
              completionPercentage: 0,
              isPrivateProfile: true
            })
          }
        } catch (error) {
          console.error(`Error fetching schema for game ${gameId}:`, error)
        }
      }
      
      return res.status(200).json({
        steamId,
        games: achievementsData,
        totalGames: achievementsData.length,
        isPrivateProfile: true,
        message: 'Profile is private. Achievement progress cannot be displayed.'
      })
    }

    console.log('Processing games for public profile:', gameIdsArray)
    const achievementsData: GameAchievements[] = []

    // Process games in batches to avoid overwhelming the API
    for (const gameId of gameIdsArray.slice(0, 10)) { // Limit to 10 games at a time
      try {
        console.log(`Processing game ${gameId}`)
        
        // Get player achievements for this game
        const achievementsUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameId}&key=${STEAM_API_KEY}&steamid=${steamId}&format=json`
        console.log('Fetching achievements:', achievementsUrl.replace(STEAM_API_KEY, '[API_KEY]'))
        const achievementsResponse = await fetch(achievementsUrl)
        
        if (!achievementsResponse.ok) {
          console.warn(`Failed to fetch achievements for game ${gameId}: ${achievementsResponse.status}`)
          
          // Try to get the error details
          let isGameStatsPrivate = false
          try {
            const errorData = await achievementsResponse.json()
            console.log(`Error details for game ${gameId}:`, errorData)
            // Check if error is specifically about private profile/game stats
            if (errorData.playerstats?.error === 'Profile is not public' || 
                achievementsResponse.status === 403) {
              isGameStatsPrivate = true
            }
            // Note: 'Requested app has no stats' means game has no achievements, not private
          } catch (e) {
            console.log(`Could not parse error response for game ${gameId}`)
          }
          
          // Try to get game schema to see if game has achievements at all
          const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?appid=${gameId}&key=${STEAM_API_KEY}&format=json`
          console.log('Fetching schema:', schemaUrl.replace(STEAM_API_KEY, '[API_KEY]'))
          const schemaResponse = await fetch(schemaUrl)
          
          if (schemaResponse.ok) {
            const schemaResult = await schemaResponse.json()
            console.log(`Schema for game ${gameId}:`, schemaResult.game ? 'Found' : 'Not found')
            
            const gameName = schemaResult.game?.gameName || `Game ${gameId}`
            const hasAchievements = schemaResult.game?.availableGameStats?.achievements?.length > 0
            
            console.log(`Game ${gameId} (${gameName}): hasAchievements=${hasAchievements}`)
            
            if (hasAchievements) {
              // Game has achievements but player data is private or unavailable
              achievementsData.push({
                appid: parseInt(gameId),
                gameName,
                achievements: [],
                totalAchievements: schemaResult.game.availableGameStats.achievements.length,
                unlockedAchievements: 0,
                completionPercentage: 0,
                isPrivateProfile: isGameStatsPrivate
              })
            } else {
              // Game has no achievements - never mark as private
              achievementsData.push({
                appid: parseInt(gameId),
                gameName,
                achievements: [],
                totalAchievements: 0,
                unlockedAchievements: 0,
                completionPercentage: 0,
                isPrivateProfile: false
              })
            }
          } else {
            console.warn(`Failed to fetch schema for game ${gameId}: ${schemaResponse.status}`)
            // Add game with unknown achievement status
            achievementsData.push({
              appid: parseInt(gameId),
              gameName: `Game ${gameId}`,
              achievements: [],
              totalAchievements: 0,
              unlockedAchievements: 0,
              completionPercentage: 0,
              isPrivateProfile: isGameStatsPrivate
            })
          }
          continue
        }

        const achievementsResult = await achievementsResponse.json()
        
        if (!achievementsResult.playerstats) {
          console.warn(`No playerstats for game ${gameId}`)
          continue
        }

        // Check if the game has achievements
        if (!achievementsResult.playerstats.achievements) {
          // Game might not have achievements, add it with 0 achievements
          achievementsData.push({
            appid: parseInt(gameId),
            gameName: achievementsResult.playerstats.gameName || `Game ${gameId}`,
            achievements: [],
            totalAchievements: 0,
            unlockedAchievements: 0,
            completionPercentage: 0
          })
          continue
        }

        // Get achievement schema for this game to get names and descriptions
        const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?appid=${gameId}&key=${STEAM_API_KEY}&format=json`
        const schemaResponse = await fetch(schemaUrl)
        
        let achievementSchemas: AchievementSchema[] = []
        if (schemaResponse.ok) {
          const schemaResult = await schemaResponse.json()
          if (schemaResult.game?.availableGameStats?.achievements) {
            achievementSchemas = schemaResult.game.availableGameStats.achievements
          }
        }

        const achievements = achievementsResult.playerstats.achievements
        const totalAchievements = achievements.length
        const unlockedAchievements = achievements.filter((a: Achievement) => a.achieved === 1).length
        const completionPercentage = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0

        console.log(`Game ${gameId} achievements:`, {
          total: totalAchievements,
          unlocked: unlockedAchievements,
          percentage: completionPercentage
        })

        // Merge achievement data with schema data
        const enrichedAchievements = achievements.map((achievement: Achievement) => {
          const schema = achievementSchemas.find(s => s.name === achievement.apiname)
          return {
            ...achievement,
            name: schema?.displayName || achievement.apiname,
            description: schema?.description || '',
            icon: schema?.icon || '',
            icongray: schema?.icongray || ''
          }
        })

        achievementsData.push({
          appid: parseInt(gameId),
          gameName: achievementsResult.playerstats.gameName || `Game ${gameId}`,
          achievements: enrichedAchievements,
          totalAchievements,
          unlockedAchievements,
          completionPercentage
        })

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error fetching achievements for game ${gameId}:`, error)
        continue
      }
    }

    console.log(`Successfully processed ${achievementsData.length} games with achievements`)
    
    // Check if most games have private stats (indicating game details are private)
    const gamesWithPrivateStats = achievementsData.filter(game => game.isPrivateProfile).length
    const hasPrivateGameStats = gamesWithPrivateStats > 0 && gamesWithPrivateStats >= achievementsData.length * 0.5
    
    res.status(200).json({
      steamId,
      games: achievementsData,
      totalGames: achievementsData.length,
      isPrivateProfile: hasPrivateGameStats,
      message: hasPrivateGameStats ? 'Game statistics are private. Achievement progress cannot be displayed.' : undefined
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 