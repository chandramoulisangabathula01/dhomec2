# Netlify Deployment Guide

## ✅ Pre-Deployment Checklist

Your project is now **Netlify-ready**! Here's what has been configured:

### Fixed Issues:
- ✅ **Tailwind CSS v3** - Downgraded from v4 (beta) to stable v3.4.17
- ✅ **TypeScript Errors** - Fixed server action return types in ticket forms
- ✅ **Middleware Deprecation** - Renamed `middleware.ts` to `proxy.ts` (Next.js 16 convention)
- ✅ **Build Success** - Project builds without errors

### Current Configuration:

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🚀 Deployment Steps

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize your site**:
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Choose a site name (or use auto-generated)
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Set environment variables**:
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://pngkszpazvhxnuprhalv.supabase.co"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key-here"
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. **Push to Git** (GitHub, GitLab, or Bitbucket):
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and repository
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
     - **Node version**: 20.x (recommended)

3. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add the following:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://pngkszpazvhxnuprhalv.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

---

## 📋 Environment Variables

Make sure these are set in Netlify (Site settings → Environment variables):

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pngkszpazvhxnuprhalv.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Your Supabase anonymous key |

**Note**: These are already in your `.env.local` file, which is gitignored for security.

---

## 🔍 Post-Deployment Verification

After deployment, verify:

1. **Site loads correctly** - Check your Netlify URL
2. **Authentication works** - Test login/signup
3. **Database connections** - Verify Supabase integration
4. **Images load** - Check product images and assets
5. **Forms work** - Test ticket creation and other forms

---

## 🛠️ Troubleshooting

### Build Fails on Netlify

1. **Check Node version**: Ensure Netlify uses Node 20.x
   - Add to `netlify.toml`:
     ```toml
     [build.environment]
       NODE_VERSION = "20"
     ```

2. **Clear cache and redeploy**:
   - In Netlify dashboard: Deploys → Trigger deploy → Clear cache and deploy site

3. **Check build logs**: Look for specific error messages in the deploy log

### Environment Variables Not Working

- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables
- Check for typos in variable names

### Supabase Connection Issues

- Verify Supabase project is active
- Check RLS (Row Level Security) policies
- Ensure CORS is configured for your Netlify domain

---

## 📝 Additional Configuration (Optional)

### Custom Domain

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### Redirects & Headers

Create a `_redirects` file in the `public` folder:
```
# SPA fallback
/*    /index.html   200
```

### Performance Optimization

- Enable Netlify's Asset Optimization
- Configure caching headers in `netlify.toml`
- Use Netlify Image CDN for images

---

## 🎉 You're Ready!

Your project is fully configured for Netlify deployment. Simply push your code or run `netlify deploy --prod` to go live!

For more information, visit: https://docs.netlify.com/integrations/frameworks/next-js/
