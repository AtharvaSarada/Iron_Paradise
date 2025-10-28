# Iron Paradise - Deployment Guide

## Architecture Overview

- **Backend**: Supabase (Database + Auth + Real-time + Storage)
- **Frontend**: Vercel (React + TypeScript + Vite)
- **CI/CD**: GitHub Actions

## Current Status

### ✅ Backend (Supabase) - LIVE
- **Project URL**: https://uwhlnukpfubpnqbxnnni.supabase.co
- **Database**: PostgreSQL with complete schema deployed
- **Authentication**: Supabase Auth configured
- **Real-time**: Enabled for notifications and updates
- **Storage**: Available for member photos and documents

### 🚀 Frontend Deployment Setup

## Quick Deploy to Vercel

### 1. Prerequisites
- GitHub repository with your code
- Vercel account (free tier sufficient)

### 2. Deploy Steps

#### Option A: Vercel Dashboard (Recommended for first deployment)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `Iron_Paradise` repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://uwhlnukpfubpnqbxnnni.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aGxudWtwZnVicG5xYnhubm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzU1OTAsImV4cCI6MjA3NTY1MTU5MH0.ORq0h-0Rg5ZYgKszAliVkMZzt8EkUYqot4-IyS1H_zU`
6. Click "Deploy"

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: iron-paradise
# - Directory: ./frontend
# - Override settings? Yes
# - Build command: npm run build
# - Output directory: dist
```

### 3. Custom Domain (Optional)
1. In Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

## Environment Variables

### Production (.env.production)
```env
VITE_SUPABASE_URL=https://uwhlnukpfubpnqbxnnni.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aGxudWtwZnVicG5xYnhubm5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzU1OTAsImV4cCI6MjA3NTY1MTU5MH0.ORq0h-0Rg5ZYgKszAliVkMZzt8EkUYqot4-IyS1H_zU
VITE_APP_ENV=production
```

## CI/CD Pipeline

### GitHub Actions (Automatic Deployment)
The `.github/workflows/deploy.yml` file is configured for:
- **Trigger**: Push to `main` or `002-develop-iron-paradise` branches
- **Steps**: Install → Test → Build → Deploy
- **Secrets Required** (Add in GitHub repo settings):
  - `VERCEL_TOKEN`: Get from Vercel → Settings → Tokens
  - `VERCEL_ORG_ID`: Get from Vercel CLI or dashboard
  - `VERCEL_PROJECT_ID`: Get from Vercel CLI or dashboard
  - `VITE_SUPABASE_URL`: Your Supabase URL
  - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Database Management

### Supabase Dashboard
- **URL**: https://supabase.com/dashboard/project/uwhlnukpfubpnqbxnnni
- **SQL Editor**: For schema updates
- **Table Editor**: For data management
- **Auth**: User management
- **Storage**: File uploads

### Schema Updates
1. Test changes in Supabase SQL Editor
2. Update `supabase-schema.sql` in repository
3. Document changes in migration notes

## Monitoring & Maintenance

### Vercel Analytics
- Automatic performance monitoring
- Real user metrics
- Core Web Vitals tracking

### Supabase Monitoring
- Database performance
- API usage
- Authentication metrics
- Real-time connections

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (18+ required)
   - Verify all dependencies installed
   - Check TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Check Vercel dashboard environment settings
   - Redeploy after adding variables

3. **Supabase Connection Issues**
   - Verify URL and key are correct
   - Check RLS policies
   - Ensure user has proper permissions

### Support
- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

## Next Steps After Deployment

1. **Test all functionality** in production
2. **Set up monitoring** and alerts
3. **Configure custom domain** if needed
4. **Set up backup strategy** for database
5. **Document user onboarding** process