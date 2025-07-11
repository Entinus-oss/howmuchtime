import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Dynamically determine the base URL from the request
    const protocol = req.headers['x-forwarded-proto'] || (req.connection as any)?.encrypted ? 'https' : 'http'
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const baseUrl = `${protocol}://${host}`
    
    const returnUrl = `${baseUrl}/api/auth/steam/callback`
    
    // Steam OpenID 2.0 parameters
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnUrl,
      'openid.realm': baseUrl,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    })

    // Redirect to Steam's OpenID endpoint
    const steamAuthUrl = `https://steamcommunity.com/openid/login?${params.toString()}`
    res.redirect(steamAuthUrl)
  } catch (error) {
    console.error('Steam OAuth error:', error)
    res.status(500).json({ error: 'Failed to initiate Steam authentication' })
  }
} 