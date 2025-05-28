# 🔧 Environment Variables Setup

## Step 1: Find Your Supabase Values

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to**: Settings → API

## Step 2: Copy These Values

You'll see these sections in your Supabase API settings:

### **Project URL**
- Copy the URL that looks like: `https://abcdefghijklmnop.supabase.co`
- This is your `NEXT_PUBLIC_SUPABASE_URL`

### **API Keys**
- **anon/public**: Copy this key (starts with `eyJ...`)
  - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role**: Copy this key (starts with `eyJ...`)
  - This is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Create .env.local File

In your project root directory, create a file called `.env.local` with this content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace the values with your actual Supabase values!**

## Step 4: Restart Your Development Server

After creating the `.env.local` file:

```bash
npm run dev
```

## ✅ Verification

Once set up correctly:
1. Go to "Link Codebase" tab
2. Enter a project name
3. Upload some files
4. You should see the project created and files analyzed
5. The project will appear in the dropdown for future use

## 🚨 Important Notes

- **Never commit `.env.local`** to version control
- The `.env.local` file should be in your project root (same level as `package.json`)
- Make sure there are no spaces around the `=` signs
- Restart your dev server after creating the file

## 🔍 Troubleshooting

**If you get connection errors:**
- Double-check your URL and keys
- Make sure you're using the correct project
- Verify the database schema was created successfully

**If environment variables aren't loading:**
- Restart your development server
- Check the file is named exactly `.env.local`
- Ensure it's in the project root directory 