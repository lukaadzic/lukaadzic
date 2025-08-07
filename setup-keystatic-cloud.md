# 🔧 Keystatic Cloud Setup - Fix Internal Error

Your Keystatic Cloud is showing internal errors because it's missing authentication credentials. Here's the complete fix:

## 🚨 **The Problem**
Keystatic Cloud requires GitHub OAuth authentication to access your content. Without proper credentials, you get internal errors in the admin panel.

## ✅ **Step-by-Step Solution**

### 1. Create GitHub OAuth App
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Click "New OAuth App"
3. Fill in these details:
   - **Application name**: `Luka Portfolio Keystatic`
   - **Homepage URL**: `https://your-vercel-domain.vercel.app`
   - **Authorization callback URL**: `https://your-vercel-domain.vercel.app/api/keystatic/cloud/oauth/callback`
4. Click "Register application"
5. **Copy the Client ID** and **generate a Client Secret**

### 2. Generate Secret Key
Run this command in your terminal:
```bash
openssl rand -base64 32
```
Copy the generated key.

### 3. Update Local Environment Variables
I've created a `.env.local` file for you. Update it with your actual values:

```bash
# Replace these with your actual values:
KEYSTATIC_SECRET=your-generated-secret-key-from-step-2
KEYSTATIC_GITHUB_CLIENT_ID=your-github-client-id-from-step-1
KEYSTATIC_GITHUB_CLIENT_SECRET=your-github-client-secret-from-step-1
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set Production Environment Variables in Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:
   - `KEYSTATIC_SECRET` = your-generated-secret-key
   - `KEYSTATIC_GITHUB_CLIENT_ID` = your-github-client-id
   - `KEYSTATIC_GITHUB_CLIENT_SECRET` = your-github-client-secret
   - `NEXT_PUBLIC_BASE_URL` = https://your-vercel-domain.vercel.app

### 5. Update GitHub OAuth Callback URLs
Make sure your GitHub OAuth app has these callback URLs:
- **Development**: `http://localhost:3000/api/keystatic/cloud/oauth/callback`
- **Production**: `https://your-vercel-domain.vercel.app/api/keystatic/cloud/oauth/callback`

### 6. Deploy Changes
```bash
git add .
git commit -m "Fix Keystatic Cloud authentication"
git push origin main
```

## 🧪 **Testing the Fix**

### Local Testing:
1. Run `npm run dev` or `bun dev`
2. Go to `http://localhost:3000/keystatic`
3. You should see a GitHub login button instead of internal error
4. After logging in, you should be able to edit posts

### Production Testing:
1. After deploying, go to `https://your-domain.vercel.app/keystatic`
2. Login with GitHub
3. Edit posts should work without internal errors

## 🔍 **Common Issues & Solutions**

### Issue: "OAuth callback URL mismatch"
**Solution**: Make sure your GitHub OAuth app callback URL exactly matches:
- `https://your-domain.vercel.app/api/keystatic/cloud/oauth/callback`

### Issue: Still getting internal errors
**Solution**: 
1. Check Vercel function logs for specific error messages
2. Verify all environment variables are set correctly
3. Make sure the GitHub OAuth app is active

### Issue: Posts not showing on `/journals`
**Solution**: This should be fixed once authentication works. The `createReader` function needs authentication to fetch posts from GitHub.

## 📋 **Verification Checklist**
- [ ] GitHub OAuth App created
- [ ] Client ID and Secret copied
- [ ] Secret key generated
- [ ] Local `.env.local` updated with real values
- [ ] Vercel environment variables set
- [ ] OAuth callback URLs match exactly
- [ ] Code committed and deployed
- [ ] `/keystatic` shows login instead of error
- [ ] Can edit posts after login
- [ ] Posts show on `/journals` page

## 🎯 **Expected Result**
After completing these steps:
- ✅ Keystatic admin panel works without internal errors
- ✅ You can login with GitHub
- ✅ You can edit posts in the admin
- ✅ Posts display properly on your `/journals` page
- ✅ All content is synced between local and cloud

The internal error occurs because Keystatic Cloud needs to authenticate with GitHub to access your repository where the content is stored. Once authentication is properly configured, everything should work seamlessly.