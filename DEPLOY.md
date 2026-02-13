# Deployment Guide for Netlify + Supabase

## 1. Prerequisites
- A [Netlify](https://www.netlify.com/) account.
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket).
- Your Supabase project URL and Anon Key.

## 2. Netlify Setup

1. **Log in to Netlify** and click **"Add new site"** > **"Import from Git"**.
2. **Connect to your Git provider** and select your repository (`dhomec`).
3. **Configure the Build Settings**:
   - **Base directory**: `(leave empty)`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Netlify config**: It should automatically detect the `netlify.toml` file we created.

## 3. Environment Variables (Supabase Connection)

This is the most critical step to connect your deployed site to Supabase.

1. Go to **Site Configuration** > **Environment variables**.
2. Click **"Add a variable"**.
3. Add the following keys (copy them from your local `.env.local` file):

   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_project_url` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` |

   > **Note:** You can find these values in your Supabase Dashboard under **Project Settings** > **API**.

   ### Additional Required Variables (New)
   
   | Key | Description | Example |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_APP_URL` | Your deployed site URL (for emails) | `https://dhomec.netlify.app` |
   | `SMTP_HOST` | Email Provider Host (e.g., Gmail) | `smtp.gmail.com` |
   | `SMTP_PORT` | Email Provider Port | `587` |
   | `SMTP_USER` | Email Address used for sending | `support@dhomec.com` |
   | `SMTP_PASS` | Email App Password | `xxxx-xxxx-xxxx-xxxx` |
   | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_...` |
   | `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `abc123xyz...` |

## 4. Deploy
1. Click **"Deploy site"**.
2. Netlify will run the build process. You can view the deployment logs to monitor progress.

## 5. Troubleshooting
- **Build Fails on Linting**: If the build fails due to ESLint errors, you can temporarily disable strict linting during production builds by modifying `next.config.ts`:
  ```typescript
  const nextConfig: NextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    // ... other config
  };
  ```
- **Supabase Connection Failed**: Double-check that your Environment Variables in Netlify exactly match those in yourSupabase project. Ensure there are no extra spaces.
