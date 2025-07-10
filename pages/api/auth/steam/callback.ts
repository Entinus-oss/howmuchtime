import type { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'

// Simple in-memory session store (in production, use Redis or database)
const sessions = new Map<string, { steamId: string; timestamp: number }>()

// Clean up expired sessions (24 hours)
const SESSION_EXPIRY = 24 * 60 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  sessions.forEach((session, sessionId) => {
    if (now - session.timestamp > SESSION_EXPIRY) {
      sessions.delete(sessionId)
    }
  })
}, 60 * 60 * 1000) // Clean up every hour

// Verify Steam OpenID response
async function verifyOpenIDResponse(params: URLSearchParams): Promise<boolean> {
  try {
    // Create verification request
    const verifyParams = new URLSearchParams(params)
    verifyParams.set('openid.mode', 'check_authentication')
    
    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verifyParams.toString(),
    })
    
    const responseText = await response.text()
    return responseText.includes('is_valid:true')
  } catch (error) {
    console.error('OpenID verification error:', error)
    return false
  }
}

// Extract Steam ID from OpenID identity URL
function extractSteamId(identity: string): string | null {
  const match = identity.match(/https:\/\/steamcommunity\.com\/openid\/id\/(\d+)/)
  return match ? match[1] : null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const params = new URLSearchParams(req.url?.split('?')[1] || '')
    
    // Check if user cancelled
    if (params.get('openid.mode') === 'cancel') {
      return res.redirect('/?auth=cancelled')
    }
    
    // Verify the OpenID response
    const isValid = await verifyOpenIDResponse(params)
    
    if (!isValid) {
      return res.redirect('/?auth=error&message=invalid_response')
    }
    
    // Extract Steam ID from the identity URL
    const identity = params.get('openid.identity')
    if (!identity) {
      return res.redirect('/?auth=error&message=no_identity')
    }
    
    const steamId = extractSteamId(identity)
    if (!steamId) {
      return res.redirect('/?auth=error&message=invalid_steam_id')
    }
    
    // Create session
    const sessionId = uuidv4()
    sessions.set(sessionId, {
      steamId,
      timestamp: Date.now()
    })
    
    // Set session cookie
    res.setHeader('Set-Cookie', `steam_session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_EXPIRY / 1000}`)
    
    // Redirect to home page with success
    res.redirect(`/?auth=success&steamid=${steamId}`)
  } catch (error) {
    console.error('Steam callback error:', error)
    res.redirect('/?auth=error&message=callback_error')
  }
}

// Export session management functions
export { sessions } 