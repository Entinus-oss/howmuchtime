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

interface FriendWithProfile {
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
    // Fetch friends list from Steam API
    const friendsApiUrl = `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${STEAM_API_KEY}&steamid=${steamid}&relationship=friend&format=json`
    const friendsResponse = await fetch(friendsApiUrl)

    if (!friendsResponse.ok) {
      if (friendsResponse.status === 401) {
        return res.status(401).json({
          error: 'Friends list is private or Steam ID is invalid.'
        })
      }
      throw new Error(`Steam API request failed: ${friendsResponse.status}`)
    }

    const friendsData: SteamFriendsResponse = await friendsResponse.json()

    if (!friendsData.friendslist || !friendsData.friendslist.friends) {
      return res.status(404).json({
        error: 'No friends found or friends list is private.'
      })
    }

    const friends = friendsData.friendslist.friends
    
    // If there are no friends, return empty array
    if (friends.length === 0) {
      return res.status(200).json({
        friends: [],
        totalFriends: 0
      })
    }

    // Get profile information for friends (Steam API allows up to 100 steamids at once)
    const steamIds = friends.map(friend => friend.steamid).slice(0, 100) // Limit to 100 for API constraints
    const profileApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamIds.join(',')}&format=json`
    const profileResponse = await fetch(profileApiUrl)

    if (!profileResponse.ok) {
      throw new Error(`Steam API request failed: ${profileResponse.status}`)
    }

    const profileData: SteamPlayerSummariesResponse = await profileResponse.json()

    if (!profileData.response || !profileData.response.players) {
      return res.status(404).json({
        error: 'Failed to fetch friend profile information.'
      })
    }

    // Combine friends data with profile data
    const friendsWithProfiles: FriendWithProfile[] = friends.map(friend => {
      const profile = profileData.response.players.find(p => p.steamid === friend.steamid)
      
      if (!profile) {
        // Return minimal data if profile not found
        return {
          steamId: friend.steamid,
          personaName: 'Unknown User',
          avatar: '',
          avatarMedium: '',
          avatarFull: '',
          profileUrl: `https://steamcommunity.com/profiles/${friend.steamid}`,
          personaState: 0,
          communityVisibilityState: 1,
          friendSince: friend.friend_since
        }
      }

      return {
        steamId: profile.steamid,
        personaName: profile.personaname,
        avatar: profile.avatar,
        avatarMedium: profile.avatarmedium,
        avatarFull: profile.avatarfull,
        profileUrl: profile.profileurl,
        personaState: profile.personastate,
        communityVisibilityState: profile.communityvisibilitystate,
        friendSince: friend.friend_since,
        realName: profile.realname,
        timeCreated: profile.timecreated,
        countryCode: profile.loccountrycode
      }
    })

    // Sort friends by online status (online first), then by name
    friendsWithProfiles.sort((a, b) => {
      // Online users first
      if (a.personaState > 0 && b.personaState === 0) return -1
      if (a.personaState === 0 && b.personaState > 0) return 1
      
      // Then sort by name
      return a.personaName.localeCompare(b.personaName)
    })

    return res.status(200).json({
      friends: friendsWithProfiles,
      totalFriends: friends.length
    })

  } catch (error) {
    console.error('Steam Friends API Error:', error)
    
    return res.status(500).json({
      error: error instanceof Error 
        ? error.message
        : 'Failed to fetch Steam friends data. Please try again.'
    })
  }
} 