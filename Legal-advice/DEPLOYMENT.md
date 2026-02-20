# Deployment Guide - Legal Opinion Portal

Complete guide to deploying the Legal Opinion Portal to production with Vercel and Supabase.

## Prerequisites

- [x] Completed Supabase backend setup (all SQL files run)
- [x] All frontend pages built and tested locally
- [x] `.env.local` configured with development Supabase credentials

## Production Deployment

### 1. Create Production Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project for production
2. **Name:** `legalopinion-prod`
3. **Region:** Choose closest to your users (e.g., `ap-south-1` for India)
4. **Database Password:** Generate a strong password and save it securely

### 2. Setup Production Database

Run all SQL files in your production Supabase SQL Editor in order:

```bash
# 1. Schema
Run: supabase/01_schema.sql

# 2. RLS Policies
Run: supabase/02_rls_policies.sql

# 3. Auth Triggers
Run: supabase/03_auth_trigger.sql

# 4. Storage Setup
Run: supabase/04_storage_setup.sql
Then manually create "legal-documents" bucket in Storage dashboard

# 5. Realtime
Run: supabase/05_realtime_setup.sql
```

### 3. Configure Supabase Settings

#### **Auth Settings**

Go to **Authentication** → **Settings**:

- ✅ Enable Email auth provider
- ✅ Disable email confirmations (or configure SMTP)
- ✅ Set Site URL: `https://your-domain.vercel.app`
- ✅ Add Redirect URLs:
  - `https://your-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

#### **Storage Settings**

Go to **Storage** → **Policies**:

- ✅ Verify all policies from `04_storage_setup.sql` are active
- ✅ Test file upload/download

### 4. Deploy to Vercel

#### **Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd "c:\PROJ\Legal Advice\stitch_legal_opinion_portal_homepage"
vercel --prod
```

#### **Option B: GitHub + Vercel Dashboard**

1. **Push to GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit - Legal Opinion Portal"
   git branch -M main
   git remote add origin https://github.com/yourusername/legalopinion-portal.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure as follows:

3. **Environment Variables in Vercel:**

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PRODUCTION_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-5 mins)
   - Visit your production URL

### 5. Post-Deployment Verification

#### **Test Authentication**

1. Go to `https://your-domain.vercel.app/signup`
2. Create a test user with role "client"
3. Verify:
   - ✅ User created in Supabase `auth.users`
   - ✅ Profile auto-created in `profiles` table
   - ✅ Can login and access dashboard

#### **Test File Upload**

1. Navigate to Client → New Request → Details & Upload
2. Upload a test document
3. Verify:
   - ✅ File appears in Supabase Storage
   - ✅ Metadata saved in `documents` table
   - ✅ Can download the file

#### **Test Realtime**

1. Open two browser windows (or use incognito)
2. Login as different users in each
3. Create a request in one window
4. Assign it to the other user
5. Verify:
   - ✅ Notification appears instantly for assigned user
   - ✅ Status updates reflect live

### 6. Domain Setup (Optional)

#### **Add Custom Domain in Vercel**

1. Go to Project Settings → Domains
2. Add your domain (e.g., `legalopinion.com`)
3. Configure DNS records as shown by Vercel
4. Wait for DNS propagation (~10 mins - 24 hours)

#### **Update Supabase Redirect URLs**

Add your custom domain to Supabase Auth settings:

- `https://legalopinion.com/auth/callback`

---

## Preview Deployments (Optional)

### Enable Preview Branches

For development workflow with preview deployments:

1. **Create Supabase Preview Project:**
   - Create a separate Supabase project for staging
   - Name: `legalopinion-preview`
   - Run all SQL setup files

2. **Create `.env.preview` in your repo:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://preview-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=preview_anon_key
   SUPABASE_SERVICE_ROLE_KEY=preview_service_role_key
   ```

3. **Configure Vercel Preview Settings:**
   - Go to Project Settings → Environment Variables
   - Add preview variables for `Preview` environment only

4. **Workflow:**

   ```bash
   # Create feature branch
   git checkout -b feature/new-feature

   # Make changes
   git add .
   git commit -m "Add new feature"

   # Push to GitHub
   git push origin feature/new-feature

   # Vercel auto-creates preview deployment
   # Test at: https://legalopinion-portal-git-feature-new-feature.vercel.app

   # Merge to main when ready
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```

---

## Monitoring & Maintenance

### Vercel Analytics

Enable Vercel Analytics for insights:

1. Go to Project → Analytics
2. Click "Enable Analytics"
3. Monitor:
   - Page views
   - Core Web Vitals
   - User geography

### Supabase Monitoring

Monitor your database health:

1. **Dashboard** → View active connections, database size
2. **Logs** → API logs, Database logs
3. **Storage** → Monitor storage usage

### Backup Strategy

**Automated Backups:**

- Supabase automatically backs up your database daily
- Backups retained for 7 days (free plan) / 30 days (pro plan)

**Manual Backup:**

```bash
# Use Supabase CLI
supabase db dump > backup_$(date +%Y%m%d).sql
```

---

## Performance Optimization

### Image Optimization

Already configured via `next/image` - no action needed.

### Code Splitting

Already optimized via Next.js App Router - automatic code splitting per route.

### Caching

Vercel automatically caches static assets. For dynamic data:

```tsx
// In your page.tsx files
export const revalidate = 60; // Revalidate every 60 seconds
```

---

## Security Checklist

- ✅ All Supabase RLS policies enabled
- ✅ Service role key stored securely (Vercel environment variables only)
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Auth redirect URLs whitelisted in Supabase
- ✅ CORS configured (handled by Supabase)
- ✅ File upload size limits enforced (10MB)

---

## Troubleshooting

### Build Fails on Vercel

**Error:** "Module not found"
**Solution:** Make sure all dependencies are in `package.json`:

```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Database Connection Errors

**Error:** "connection refused"
**Solution:** Verify environment variables in Vercel match your Supabase project

### Authentication Not Working

**Error:** "Invalid redirect URL"
**Solution:** Add your Vercel URL to Supabase Auth → Settings → Redirect URLs

---

## Support & Resources

- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)

---

## 🎉 Congratulations!

Your Legal Opinion Portal is now **LIVE** and ready to serve real users!

**Production URL:** `https://your-domain.vercel.app`
