# HowMuchTime - Steam Gaming Analytics Dashboard

A modern, crypto-style dashboard for analyzing your Steam gaming statistics. Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

![HowMuchTime Dashboard](https://via.placeholder.com/800x400/0a0a0a/00ffff?text=HowMuchTime+Dashboard)

## Features

- 🎮 **Steam Integration** - Connect with Steam Web API to fetch your gaming data
- 🔍 **Smart Profile Search** - Enter usernames, profile URLs, or Steam IDs with intelligent suggestions
- 📊 **Beautiful Analytics** - View your gaming statistics with crypto-style visualizations
- 🎨 **Modern UI** - Dark theme with neon accents and smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Real-time Data** - Fetch live data from Steam API
- 🔥 **Top Games** - See your most played games ranked by playtime
- 📈 **Recent Activity** - Track your gaming activity from the last 2 weeks
- 🤖 **Profile Suggestions** - Get smart suggestions when exact username matches aren't found

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom crypto-style components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: Steam Web API integration

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- Steam Web API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/howmuchtime.git
   cd howmuchtime
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your Steam Web API Key**
   - Go to [Steam Web API Key](https://steamcommunity.com/dev/apikey)
   - Sign in with your Steam account
   - Enter a domain name (can be anything for development, e.g., "localhost")
   - Copy your API key

4. **Set up environment variables**
   ```bash
   # Create .env.local file
   echo "STEAM_API_KEY=your_steam_api_key_here" > .env.local
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Find your Steam profile**
   - **Steam Username**: Enter your custom Steam username directly (e.g., `gabelogannewell`)
   - **Profile URL**: Copy and paste your full Steam profile URL (e.g., `https://steamcommunity.com/id/gabelogannewell`)
   - **Steam ID**: Use the traditional 17-digit Steam ID (e.g., `76561198000000000`)

2. **Enter your Steam information**
   - Paste any of the above formats into the input field
   - The app will automatically detect and convert your input
   - Click "Analyze Gaming Time"

3. **View your analytics**
   - See your total games and playtime
   - Browse your most played games
   - Check recent gaming activity

## Profile Suggestions

If the app can't find an exact match for your username, it will automatically search for similar profiles and show you suggestions:

- **Smart Variations**: Tries common variations like adding/removing numbers, common suffixes (gaming, yt, tv)
- **Typo Correction**: Attempts to fix simple typos by trying usernames with one character removed
- **Visual Selection**: Shows up to 5 profile suggestions with avatars and usernames
- **Quick Actions**: Click a suggestion to load that profile, or use the external link to verify on Steam

**Example**: Searching for `gabelogan` might suggest `gabelogannewell`, `gabelogan1`, etc.

## Project Structure

```
howmuchtime/
├── app/
│   ├── api/steam/          # Steam API route
│   ├── globals.css         # Global styles and CSS variables
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main dashboard page
├── components/
│   ├── GameCard.tsx        # Individual game display card
│   ├── LoadingSpinner.tsx  # Loading animation component
│   ├── StatsCard.tsx       # Statistics display card
│   └── SteamIdInput.tsx    # Steam ID input form
├── public/                 # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## API Routes

### GET /api/steam

Fetches Steam gaming data for a given Steam input (username, profile URL, or Steam ID).

**Query Parameters:**
- `steamid` (required): Steam username, profile URL, or 64-bit Steam ID

**Response:**
```json
{
  "games": [
    {
      "appid": 123456,
      "name": "Game Name",
      "playtime_forever": 1200,
      "img_icon_url": "icon_hash",
      "img_logo_url": "logo_hash",
      "playtime_2weeks": 60
    }
  ],
  "totalGames": 100,
  "totalPlaytime": 50000,
  "steamId": "76561198000000000"
}
```

## Customization

### Crypto-Style Theme

The app uses CSS custom properties for easy theme customization. Edit `app/globals.css` to modify:

- Color scheme (primary, secondary, accent colors)
- Animation durations and effects
- Border radius and spacing
- Glow effects and shadows

### Components

All components are modular and can be easily customized:

- `GameCard`: Modify game display layout and animations
- `StatsCard`: Customize statistics presentation
- `SteamIdInput`: Update input styling and validation
- `LoadingSpinner`: Change loading animations

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STEAM_API_KEY` | Your Steam Web API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's URL (for production) | No |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `STEAM_API_KEY` environment variable in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

Make sure to set the `STEAM_API_KEY` environment variable on your chosen platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Steam Web API for providing gaming data
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Lucide React for beautiful icons

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/howmuchtime/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/your-invite) (if applicable)

---

**Note**: This project is not affiliated with Valve Corporation or Steam. Steam is a trademark of Valve Corporation. 