import type { NextApiRequest, NextApiResponse } from 'next'

// You'll need to get a Steam Web API key from: https://steamcommunity.com/dev/apikey
const STEAM_API_KEY = process.env.STEAM_API_KEY

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

interface SteamGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  playtime_2weeks?: number
}

interface SteamGamesResponse {
  response: {
    game_count: number
    games: SteamGame[]
  }
}

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

// This function is no longer needed since we're only doing friends rankings

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { steamid } = req.query

  if (!steamid || typeof steamid !== 'string') {
    return res.status(400).json({ error: 'Steam ID is required' })
  }

  if (!STEAM_API_KEY) {
    return res.status(500).json({
      error: 'Steam API key not configured. Please add STEAM_API_KEY to your environment variables.'
    })
  }

  try {
    // Get user's profile first
    const userProfileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamid}&format=json`
    const userProfileResponse = await fetch(userProfileUrl)
    
    if (!userProfileResponse.ok) {
      throw new Error(`Failed to fetch user profile: ${userProfileResponse.status}`)
    }

    const userProfileData: SteamPlayerSummariesResponse = await userProfileResponse.json()
    const userProfile = userProfileData.response.players[0]

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' })
    }

    // Get user's total playtime
    const userGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamid}&format=json&include_appinfo=true&include_played_free_games=true`
    const userGamesResponse = await fetch(userGamesUrl)
    
    let userTotalPlaytime = 0
    let userTotalGames = 0
    
    if (userGamesResponse.ok) {
      const userGamesData: SteamGamesResponse = await userGamesResponse.json()
      if (userGamesData.response && userGamesData.response.games) {
        userTotalPlaytime = userGamesData.response.games.reduce((total, game) => total + game.playtime_forever, 0)
        userTotalGames = userGamesData.response.game_count
      }
    }

    // Fetch friends rankings
    const friendsApiUrl = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamid}&relationship=friend&format=json`
    const friendsResponse = await fetch(friendsApiUrl)

    let friendsRankings: RankedPlayer[] = []
    
    if (friendsResponse.ok) {
      const friendsData: SteamFriendsResponse = await friendsResponse.json()
      
      if (friendsData.friendslist && friendsData.friendslist.friends) {
        const friends = friendsData.friendslist.friends // Remove arbitrary limit
        
        // Get friend profiles in batches to avoid URL length limits
        const batchSize = 100
        let allFriendProfiles: SteamPlayerSummary[] = []
        
        for (let i = 0; i < friends.length; i += batchSize) {
          const batch = friends.slice(i, i + batchSize)
          const friendIds = batch.map(f => f.steamid)
          const friendProfilesUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${friendIds.join(',')}&format=json`
          
          try {
            const friendProfilesResponse = await fetch(friendProfilesUrl)
            if (friendProfilesResponse.ok) {
              const friendProfilesData: SteamPlayerSummariesResponse = await friendProfilesResponse.json()
              allFriendProfiles = [...allFriendProfiles, ...friendProfilesData.response.players]
            }
          } catch (error) {
            console.error('Error fetching friend profiles batch:', error)
          }
        }
        
        // Get playtime for each friend with better error handling
        const friendsWithPlaytime = await Promise.all(
          allFriendProfiles.map(async (profile) => {
            try {
              const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${profile.steamid}&format=json&include_appinfo=true&include_played_free_games=true`
              const gamesResponse = await fetch(gamesUrl)
              
              let totalPlaytime = 0
              let totalGames = 0
              
              if (gamesResponse.ok) {
                const gamesData: SteamGamesResponse = await gamesResponse.json()
                if (gamesData.response && gamesData.response.games) {
                  totalPlaytime = gamesData.response.games.reduce((total, game) => total + game.playtime_forever, 0)
                  totalGames = gamesData.response.game_count
                }
              }
              // If games response is not OK, it's likely a private account, still include with 0 playtime
              
              return {
                steamId: profile.steamid,
                personaName: profile.personaname,
                avatar: profile.avatar,
                avatarMedium: profile.avatarmedium,
                avatarFull: profile.avatarfull,
                profileUrl: profile.profileurl,
                personaState: profile.personastate,
                totalPlaytime,
                totalGames,
                rank: 0, // Will be set after sorting
                countryCode: profile.loccountrycode,
                realName: profile.realname
              }
            } catch (error) {
              console.error(`Error fetching games for ${profile.personaname}:`, error)
              // Still include friend with 0 playtime if API call fails
              return {
                steamId: profile.steamid,
                personaName: profile.personaname,
                avatar: profile.avatar,
                avatarMedium: profile.avatarmedium,
                avatarFull: profile.avatarfull,
                profileUrl: profile.profileurl,
                personaState: profile.personastate,
                totalPlaytime: 0,
                totalGames: 0,
                rank: 0,
                countryCode: profile.loccountrycode,
                realName: profile.realname
              }
            }
          })
        )

        // Add user to friends list for ranking
        const userAsPlayer: RankedPlayer = {
          steamId: userProfile.steamid,
          personaName: userProfile.personaname + ' (You)',
          avatar: userProfile.avatar,
          avatarMedium: userProfile.avatarmedium,
          avatarFull: userProfile.avatarfull,
          profileUrl: userProfile.profileurl,
          personaState: userProfile.personastate,
          totalPlaytime: userTotalPlaytime,
          totalGames: userTotalGames,
          rank: 0,
          countryCode: userProfile.loccountrycode,
          realName: userProfile.realname
        }

        // Sort by total playtime and assign ranks (include ALL friends and user)
        const allPlayers = [...friendsWithPlaytime, userAsPlayer]
        allPlayers.sort((a, b) => b.totalPlaytime - a.totalPlaytime)
        
        // Assign ranks properly - players with same playtime get same rank
        let currentRank = 1
        allPlayers.forEach((player, index) => {
          if (index > 0 && player.totalPlaytime < allPlayers[index - 1].totalPlaytime) {
            currentRank = index + 1
          }
          player.rank = currentRank
        })

        friendsRankings = allPlayers
      }
    }

    // Calculate user rank among friends
    const userFriendsRank = friendsRankings.findIndex(p => p.steamId === userProfile.steamid) + 1

    const rankingsData: RankingsData = {
      friends: friendsRankings,
      userRank: userFriendsRank,
      totalPlayers: friendsRankings.length
    }

    return res.status(200).json(rankingsData)

  } catch (error) {
    console.error('Rankings API Error:', error)
    
    return res.status(500).json({
      error: error instanceof Error 
        ? error.message
        : 'Failed to fetch rankings data. Please try again.'
    })
  }
} 