# Keystatic Cloud Setup Guide

Your posts are not showing because Keystatic Cloud requires authentication to access your data. Here's how to fix it:

## 🔧 **Step 1: Create GitHub OAuth App**

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Luka Portfolio Keystatic`
   - **Homepage URL**: `https://your-vercel-domain.vercel.app` (or `http://localhost:3000` for development)
   - **Authorization callback URL**: `https://your-vercel-domain.vercel.app/keystatic/cloud/oauth/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

## 🔧 **Step 2: Generate Secret Key**

Run this command to generate a secret key:
```bash
openssl rand -base64 32
```

## 🔧 **Step 3: Set Environment Variables**

### For Local Development:
Create a `.env.local` file in your project root:

```bash
KEYSTATIC_SECRET=your-generated-secret-key
KEYSTATIC_GITHUB_CLIENT_ID=your-github-client-id
KEYSTATIC_GITHUB_CLIENT_SECRET=your-github-client-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### For Vercel Production:
Add these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Add each variable:
   - `KEYSTATIC_SECRET` = your-generated-secret-key
   - `KEYSTATIC_GITHUB_CLIENT_ID` = your-github-client-id  
   - `KEYSTATIC_GITHUB_CLIENT_SECRET` = your-github-client-secret
   - `NEXT_PUBLIC_BASE_URL` = https://your-vercel-domain.vercel.app

## 🔧 **Step 4: Update OAuth Callback URL**

Make sure your GitHub OAuth app callback URL matches your production domain:
- Development: `http://localhost:3000/keystatic/cloud/oauth/callback`
- Production: `https://your-vercel-domain.vercel.app/keystatic/cloud/oauth/callback`

## 🔧 **Step 5: Redeploy**

After setting up the environment variables:
1. Commit any changes: `git add . && git commit -m "Add Keystatic setup guide"`
2. Push to main: `git push origin main`
3. Deploy to Vercel: `vercel --prod`

## ✅ **Expected Result**

Once configured, your posts should appear on the `/journals` page with:
- ✅ All your posts from Keystatic Cloud
- ✅ Featured images displaying properly
- ✅ Working post links (no more 404s)
- ✅ Proper content rendering

## 🐛 **Troubleshooting**

If posts still don't show:
1. Check Vercel function logs for authentication errors
2. Verify OAuth callback URL matches exactly
3. Ensure all environment variables are set correctly
4. Try accessing `/keystatic` to test authentication

## 📝 **Why This Was Needed**

Keystatic Cloud stores your content in GitHub and requires OAuth authentication to access it programmatically. Without these credentials, the `createReader` function cannot authenticate with GitHub to fetch your posts.
