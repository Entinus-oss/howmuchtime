import type { NextApiRequest, NextApiResponse } from 'next'
import { sessions } from './steam/callback'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Check current session
    const sessionId = req.cookies.steam_session
    
    if (!sessionId) {
      return res.status(401).json({ authenticated: false, message: 'No session found' })
    }
    
    const session = sessions.get(sessionId)
    
    if (!session) {
      return res.status(401).json({ authenticated: false, message: 'Invalid session' })
    }
    
    // Check if session is expired
    const now = Date.now()
    const SESSION_EXPIRY = 24 * 60 * 60 * 1000
    
    if (now - session.timestamp > SESSION_EXPIRY) {
      sessions.delete(sessionId)
      return res.status(401).json({ authenticated: false, message: 'Session expired' })
    }
    
    return res.json({
      authenticated: true,
      steamId: session.steamId,
      timestamp: session.timestamp
    })
  } else if (req.method === 'DELETE') {
    // Logout - clear session
    const sessionId = req.cookies.steam_session
    
    if (sessionId) {
      sessions.delete(sessionId)
    }
    
    res.setHeader('Set-Cookie', 'steam_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0')
    return res.json({ message: 'Logged out successfully' })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
} 