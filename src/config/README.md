# API Configuration

This directory contains centralized API configuration for the application.

## Files

- `api.ts` - Main API configuration file

## How to Use

### Environment Variables Only

The configuration uses environment variables only - no hardcoded URLs in the code.

### Environment Priority

1. **Vercel Environment Variable** - `VITE_API_BASE_URL` (for production deployment)
2. **Fallback** - `http://localhost:5000/api` (for local development)

### Local Development

- No configuration needed
- Backend should run on `http://localhost:5000`
- Uses fallback URL automatically

### Production Deployment

- Set `VITE_API_BASE_URL` in Vercel environment variables
- Example: `VITE_API_BASE_URL = https://your-backend.vercel.app/api`
- No code changes needed

## Benefits

- ✅ **No Hardcoded URLs** - All URLs come from environment variables
- ✅ **Environment Agnostic** - Same code works everywhere
- ✅ **Easy Deployment** - Just set environment variable in Vercel
- ✅ **Centralized Management** - All API endpoints in one place
- ✅ **Type Safety** - TypeScript support for all endpoints
