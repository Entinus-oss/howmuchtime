import type { NextApiRequest, NextApiResponse } from 'next'

// You'll need to get a Steam Web API key from: https://steamcommunity.com/dev/apikey
const STEAM_API_KEY = process.env.STEAM_API_KEY

interface SteamGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  playtime_2weeks?: number
}

interface SteamApiResponse {
  response: {
    game_count: number
    games: SteamGame[]
  }
}

interface SteamPlayerSummary {
  steamid: string
  communityvisibilitystate: number
  profilestate: number
  personaname: string
  avatar: string
  avatarmedium: string
  avatarfull: string
  profileurl: string
  personastate: number
  realname?: string
  primaryclanid?: string
  timecreated?: number
  personastateflags?: number
  loccountrycode?: string
  locstatecode?: string
  loccityid?: number
}

interface SteamPlayerSummariesResponse {
  response: {
    players: SteamPlayerSummary[]
  }
}

interface SteamFriend {
  steamid: string
  relationship: string
  friend_since: number
}

interface SteamFriendsResponse {
  friendslist: {
    friends: SteamFriend[]
  }
}

interface ProfileSuggestion {
  personaName: string
  avatar: string
  profileUrl: string
  steamId: string
}

// Helper function to generate username variations for suggestions
function generateUsernameVariations(input: string): string[] {
  const variations = new Set<string>()
  const original = input.toLowerCase().trim()
  
  // Add original
  variations.add(original)
  
  // Handle special characters by removing them
  const cleanedInput = original.replace(/[®©™℠°•·‚„""''‹›«»]/g, '')
  if (cleanedInput !== original && cleanedInput.length > 2) {
    variations.add(cleanedInput)
  }
  
  // Handle common replacements
  const commonReplacements = [
    { from: /®/g, to: '' },
    { from: /©/g, to: '' },
    { from: /™/g, to: '' },
    { from: /[°•·]/g, to: '' },
    { from: /['']/g, to: '' },
    { from: /[""]/g, to: '' },
    { from: /\s+/g, to: '' }, // Remove spaces
    { from: /[_-]/g, to: '' }, // Remove underscores and dashes
  ]
  
  let workingInput = original
  for (const replacement of commonReplacements) {
    const replaced = workingInput.replace(replacement.from, replacement.to)
    if (replaced !== workingInput && replaced.length > 2) {
      variations.add(replaced)
      workingInput = replaced
    }
  }
  
  // Remove numbers
  const noNumbers = original.replace(/\d+/g, '')
  if (noNumbers !== original && noNumbers.length > 2) {
    variations.add(noNumbers)
  }
  
  // Add common variations
  if (original.length > 3) {
    // Add with common suffixes/prefixes
    variations.add(original + '1')
    variations.add(original + '2')
    variations.add(original + '123')
    variations.add('the' + original)
    variations.add(original + 'gaming')
    variations.add(original + 'yt')
    variations.add(original + 'tv')
    
    // Try without last character (typo correction)
    variations.add(original.slice(0, -1))
    
    // Try without first character
    if (original.length > 4) {
      variations.add(original.slice(1))
    }
    
    // Try partial matches for longer usernames
    if (original.length > 6) {
      variations.add(original.slice(0, -2)) // Remove last 2 chars
      variations.add(original.slice(1, -1)) // Remove first and last char
    }
  }
  
  return Array.from(variations).filter(v => v.length > 2).slice(0, 12) // Limit to 12 variations, minimum 3 chars
}

// Helper function to search for profile suggestions
async function searchProfileSuggestions(input: string): Promise<ProfileSuggestion[]> {
  const suggestions: ProfileSuggestion[] = []
  const variations = generateUsernameVariations(input)
  
  // Try each variation
  for (const variation of variations) {
    try {
      const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(variation)}&format=json`
      const response = await fetch(resolveUrl)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.response && data.response.success === 1 && data.response.steamid) {
          // Get profile info for this steamid
          const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${data.response.steamid}&format=json`
          const profileResponse = await fetch(profileUrl)
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            if (profileData.response?.players?.[0]) {
              const player = profileData.response.players[0]
              suggestions.push({
                personaName: player.personaname,
                avatar: player.avatar,
                profileUrl: player.profileurl,
                steamId: player.steamid
              })
            }
          }
        }
      }
    } catch (error) {
      // Ignore individual errors, continue with other variations
      continue
    }
    
    // Limit to 8 suggestions and add delay to avoid rate limiting
    if (suggestions.length >= 8) break
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return suggestions
}

// Helper function to resolve various Steam input formats to Steam ID
async function resolveToSteamId(input: string): Promise<{ steamId: string; suggestions?: ProfileSuggestion[] }> {
  // First check if it's already a valid Steam ID
  const steamIdRegex = /^7656\d{13}$/
  if (steamIdRegex.test(input)) {
    return { steamId: input }
  }

  // Check if it's a Steam profile URL and extract the relevant part
  let vanityUrl = input
  
  // Handle full profile URLs
  if (input.includes('steamcommunity.com/id/')) {
    const match = input.match(/steamcommunity\.com\/id\/([^\/\?]+)/)
    if (match) {
      vanityUrl = match[1]
    }
  }
  
  // Handle direct Steam ID URLs
  if (input.includes('steamcommunity.com/profiles/')) {
    const match = input.match(/steamcommunity\.com\/profiles\/(\d+)/)
    if (match && steamIdRegex.test(match[1])) {
      return { steamId: match[1] }
    }
  }

  // Try to resolve vanity URL to Steam ID
  try {
    const resolveUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(vanityUrl)}&format=json`
    const response = await fetch(resolveUrl)
    
    if (!response.ok) {
      throw new Error(`ResolveVanityURL API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.response && data.response.success === 1 && data.response.steamid) {
      return { steamId: data.response.steamid }
    }
    
    // If exact resolution failed, try to find suggestions
    console.log('Exact match failed, searching for suggestions...')
    const suggestions = await searchProfileSuggestions(vanityUrl)
    
    if (suggestions.length > 0) {
      throw new Error('PROFILE_SUGGESTIONS_AVAILABLE')
    }
    
    // If no suggestions found either
    throw new Error('Steam profile not found')
  } catch (error) {
    if (error instanceof Error && error.message === 'PROFILE_SUGGESTIONS_AVAILABLE') {
      const suggestions = await searchProfileSuggestions(vanityUrl)
      throw new Error(JSON.stringify({ type: 'suggestions', suggestions }))
    }
    throw new Error(`Failed to resolve Steam profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { steamid: steamInput } = req.query

  if (!steamInput || typeof steamInput !== 'string') {
    return res.status(400).json({ error: 'Steam ID, username, or profile URL is required' })
  }

  if (!STEAM_API_KEY) {
    return res.status(500).json({
      error: 'Steam API key not configured. Please add STEAM_API_KEY to your environment variables.'
    })
  }

  try {
    // Resolve the input to a Steam ID
    const { steamId } = await resolveToSteamId(steamInput.trim())

    // Fetch profile information, owned games, and Steam level from Steam API
    const profileApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}&format=json`
    const steamApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`
    const steamLevelUrl = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json`
    
    const [profileResponse, gamesResponse, levelResponse] = await Promise.all([
      fetch(profileApiUrl),
      fetch(steamApiUrl),
      fetch(steamLevelUrl)
    ])
    
    if (!profileResponse.ok || !gamesResponse.ok) {
      throw new Error(`Steam API request failed: ${profileResponse.status} / ${gamesResponse.status}`)
    }

    const profileData: SteamPlayerSummariesResponse = await profileResponse.json()
    const gamesData: SteamApiResponse = await gamesResponse.json()
    
    // Steam level might fail for some accounts, so we handle it separately
    let steamLevel = 0
    if (levelResponse.ok) {
      try {
        const levelData = await levelResponse.json()
        steamLevel = levelData.response?.player_level || 0
      } catch (error) {
        console.warn('Failed to fetch Steam level:', error)
      }
    }

    if (!profileData.response || !profileData.response.players || profileData.response.players.length === 0) {
      return res.status(404).json({
        error: 'Profile not found for this Steam ID.'
      })
    }

    if (!gamesData.response || !gamesData.response.games) {
      return res.status(404).json({
        error: 'No games found for this Steam ID. The profile might be private.'
      })
    }

    const profile = profileData.response.players[0]
    const games = gamesData.response.games
    const totalPlaytime = games.reduce((total, game) => total + game.playtime_forever, 0)

    // Filter out games with 0 playtime for better display
    const playedGames = games.filter(game => game.playtime_forever > 0)
    const totalGames = playedGames.length // Use actual played games count instead of Steam API count

    return res.status(200).json({
      games: playedGames,
      totalGames,
      totalPlaytime,
      steamId: steamId,
      profile: {
        steamId: profile.steamid,
        personaName: profile.personaname,
        realName: profile.realname,
        avatar: profile.avatar,
        avatarMedium: profile.avatarmedium,
        avatarFull: profile.avatarfull,
        profileUrl: profile.profileurl,
        personaState: profile.personastate,
        communityVisibilityState: profile.communityvisibilitystate,
        timeCreated: profile.timecreated,
        countryCode: profile.loccountrycode,
        steamLevel: steamLevel
      }
    })

  } catch (error) {
    console.error('Steam API Error:', error)
    
    // Check if error contains suggestions
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message)
        if (parsed.type === 'suggestions') {
          return res.status(404).json({
            error: 'Profile not found, but here are some suggestions:',
            suggestions: parsed.suggestions,
            type: 'suggestions'
          })
        }
      } catch {
        // Not a JSON error, handle normally
      }
    }
    
    return res.status(500).json({
      error: error instanceof Error 
        ? error.message
        : 'Failed to fetch Steam data. Please try again.'
    })
  }
} 