# Deployment Guide

## Vercel Deployment

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- Steam API key (get from: https://steamcommunity.com/dev/apikey)

### Environment Variables Required
```
STEAM_API_KEY=your_steam_api_key_here
```

### Deployment Steps

1. **Push to GitHub**
   - Ensure your code is in a GitHub repository
   - Make sure all changes are committed and pushed

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - In Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add: `STEAM_API_KEY` with your Steam API key

4. **Deploy**
   - Vercel will automatically build and deploy
   - You'll get a live URL immediately

### Automatic Deployments
- Every push to main branch triggers automatic deployment
- Preview deployments for pull requests
- Rollback capability if needed

### Performance Optimizations
- Edge functions for API routes
- Automatic CDN distribution
- Image optimization included
- Tree-shaking and code splitting

### Monitoring
- View deployment logs in Vercel dashboard
- Analytics available (free tier included)
- Error tracking and performance insights 