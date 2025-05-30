# 🔐 Supabase Auth Setup Guide

## 📋 **Prerequisites**
- Supabase project already created
- Environment variables already configured in `.env.local`

## 🚀 **Step 1: Enable Email Authentication**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. **Email** should already be enabled by default
5. Configure email settings:
   - ✅ **Enable email confirmations** (recommended)
   - ✅ **Enable secure email change** (recommended)
   - Set **Site URL** to: `http://localhost:3000` (development) or your production URL

## 🐙 **Step 2: Setup GitHub OAuth**

### A. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: Vibe Assistant
   Homepage URL: http://localhost:3000
   Authorization callback URL: https://YOUR_SUPABASE_URL/auth/v1/callback
   ```
4. Click **"Register application"**
5. Copy the **Client ID** and **Client Secret**

### B. Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and click **Configure**
3. Toggle **Enable GitHub provider** to ON
4. Enter your GitHub credentials:
   - **GitHub Client ID**: `your_github_client_id`
   - **GitHub Client Secret**: `your_github_client_secret`
5. Click **Save**

## 🔍 **Step 3: Setup Google OAuth**

### A. Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **"Create Credentials"** → **"OAuth client ID"**
   - Choose **"Web application"**
   - Add authorized redirect URIs:
     ```
     https://YOUR_SUPABASE_URL/auth/v1/callback
     ```
5. Copy the **Client ID** and **Client Secret**

### B. Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click **Configure**
3. Toggle **Enable Google provider** to ON
4. Enter your Google credentials:
   - **Google Client ID**: `your_google_client_id`
   - **Google Client Secret**: `your_google_client_secret`
5. Click **Save**

## 🔧 **Step 4: Update Site URLs**

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set the following URLs:
   ```
   Site URL: http://localhost:3000
   Additional Redirect URLs: 
   - http://localhost:3000/auth/callback
   - http://localhost:3000/code-analyzer
   ```

## 🌐 **Step 5: Production Setup**

When deploying to production, update:

1. **Site URL** to your production domain
2. **OAuth App URLs** in GitHub/Google to your production domain
3. **Additional Redirect URLs** to include production URLs

## ✅ **Verification Steps**

1. Test email signup/signin
2. Test Google OAuth flow
3. Test GitHub OAuth flow
4. Verify user data appears in Supabase Auth dashboard

## 🚨 **Common Issues & Solutions**

### Issue: "Invalid redirect URL"
**Solution**: Make sure the callback URL matches exactly:
- Supabase: `https://YOUR_SUPABASE_URL/auth/v1/callback`
- Code: `${window.location.origin}/auth/callback`

### Issue: "OAuth app not approved"
**Solution**: For development, you can test with your own Google/GitHub account. For production, submit your app for review.

### Issue: "Email confirmations not working"
**Solution**: Check email templates in Authentication → Templates and configure SMTP settings.

## 📝 **Environment Variables Checklist**

Make sure these are set in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎉 **You're Ready!**

Once completed, your app will support:
- ✅ Email/Password authentication
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Real-time auth state management
- ✅ Automatic session handling 