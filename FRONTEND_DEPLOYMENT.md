# Frontend Deployment Guide

## 🚀 Deploy Frontend Separately

This guide helps you deploy only the frontend (`swift-supply-link`) to Vercel.

### Prerequisites
- Node.js 18+ installed
- Vercel CLI installed: `npm install -g vercel`
- Backend already deployed (to get the API URL)

### Step 1: Prepare Frontend

```bash
# Navigate to frontend directory
cd swift-supply-link

# Install dependencies
npm install

# Test local build
npm run build
```

### Step 2: Deploy to Vercel

```bash
# Login to Vercel (if not already logged in)
vercel login

# Deploy frontend
vercel --prod
```

### Step 3: Set Environment Variables

After deployment, go to your frontend project in Vercel Dashboard:

1. **Go to Settings → Environment Variables**
2. **Add these variables:**

```
VITE_API_BASE_URL = https://your-backend-domain.vercel.app/api
VITE_APP_ENV = production
```

### Step 4: Redeploy

After setting environment variables:

```bash
# Redeploy to apply environment variables
vercel --prod
```

### Step 5: Test Deployment

1. **Visit your frontend URL**
2. **Check browser console** for any errors
3. **Test API connection** using the connection test component

## 🔧 Environment Configuration

### Local Development
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENV=development
```

### Production
```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_APP_ENV=production
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:prod   # Build for production with env
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔍 Troubleshooting

### Common Issues:

**1. API Connection Failed:**
- Check `VITE_API_BASE_URL` is correct
- Ensure backend URL includes `/api` at the end
- Verify backend is running

**2. Build Errors:**
- Check Node.js version (18+)
- Clear node_modules and reinstall
- Check for TypeScript errors

**3. Environment Variables Not Working:**
- Redeploy after setting variables
- Check variable names are correct
- Ensure no typos in URLs

### Debug Commands:

```bash
# Check build locally
npm run build

# Preview production build
npm run preview

# Check Vercel deployment
vercel ls
```

## ✅ Deployment Checklist

- [ ] Frontend dependencies installed
- [ ] Local build successful
- [ ] Vercel CLI installed and logged in
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Frontend redeployed with new variables
- [ ] Backend URL obtained and configured
- [ ] Frontend tested and working

Your frontend is now deployed separately! 🎉
