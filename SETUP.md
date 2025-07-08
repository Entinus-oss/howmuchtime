# Quick Setup Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Steam API Key
1. Visit [Steam Web API Key](https://steamcommunity.com/dev/apikey)
2. Sign in with your Steam account
3. Enter a domain name (use "localhost" for development)
4. Copy your API key

### 3. Configure Environment
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your Steam API key
STEAM_API_KEY=your_actual_steam_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

1. **Find Your Steam ID:**
   - Go to your Steam profile
   - Copy the URL
   - If it's `steamcommunity.com/profiles/76561198000000000`, use the number part
   - If it's `steamcommunity.com/id/username`, use a Steam ID converter

2. **Enter Your Steam ID:**
   - Paste the 17-digit Steam ID (starting with 7656)
   - Click "Analyze Gaming Time"

3. **View Your Analytics:**
   - See total games and playtime
   - Browse most played games
   - Check recent activity

## ⚠️ Troubleshooting

### Common Issues:

**"Steam API key not configured"**
- Make sure you created `.env.local` with your Steam API key

**"No games found"**
- Your Steam profile might be private
- Check your Steam ID format (17 digits starting with 7656)

**"Invalid Steam ID format"**
- Use the 64-bit Steam ID (not the custom URL)
- Use a Steam ID converter if needed

### Node.js Version
This project is configured for Node.js 14+ with Next.js 12. If you have a newer Node.js version, you might want to upgrade to Next.js 15 for better performance.

## 🎨 Customization

The crypto-style theme can be customized in `styles/globals.css`:
- Change colors in the CSS custom properties
- Modify animations and effects
- Adjust the grid pattern and glow effects

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add `STEAM_API_KEY` environment variable
4. Deploy!

### Other Platforms
Make sure to set the `STEAM_API_KEY` environment variable on your chosen platform.

---

**Enjoy tracking your gaming time! 🎮✨** 