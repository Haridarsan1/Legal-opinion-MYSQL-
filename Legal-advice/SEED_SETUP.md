# Seed Data Setup Guide

## ⚠️ Important: Read This First!

The seed data **cannot be run before creating auth users** because:

- `auth.users` table is managed by Supabase Auth (not direct SQL)
- `profiles` table has a foreign key to `auth.users`
- The auth trigger (`03_auth_trigger.sql`) creates profile entries automatically when users sign up

## 📋 Correct Setup Order

### Step 1: Start Your Development Server

```bash
npm run dev
```

Your app should now be running at `http://localhost:3000`

### Step 2: Sign Up Test Users

Go to `http://localhost:3000/auth/signup` and create these test accounts:

**Primary Test Users** (Create these first):

1. **Client User**:
   - Full Name: `Hari Darsan`
   - Email: `haridarsan01@gmail.com`
   - Password: `Haridarsan01!`
   - Role: Client

2. **Lawyer User**:
   - Full Name: `Mathew Fed`
   - Email: `haridarsan18@gmail.com`
   - Password: `Haridarsan18!`
   - Role: Lawyer
   - Bar Council ID: `BAR/MH/2015/12345` (optional)

**Optional Additional Users**:

3. **Firm User**:
   - Full Name: `Sharma & Associates Law Firm`
   - Email: `firm@sharmalaw.com`
   - Password: `FirmSecure123!`
   - Role: Firm
   - Organization: `Sharma & Associates`

4. **Bank User**:
   - Full Name: `HDFC Bank Legal`
   - Email: `legal@hdfcbank.com`
   - Password: `BankSecure123!`
   - Role: Bank
   - Organization: `HDFC Bank Ltd`

### Step 3: Verify Users Created

1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Users**
3. Confirm you see the users you just created

### Step 4: Run Seed Data

Now you can safely run the seed SQL:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste `supabase/seed.sql`
4. Click **Run**

The seed data will:

- Find existing users by email
- Create 8 legal requests
- Add 5 notifications
- Insert 2 ratings
- Add 1 clarification
- Create 2 audit log entries

---

## Alternative: Using Supabase CLI

If you want to use Supabase CLI for local development:

### Install Supabase CLI

```bash
# Windows (via npm)
npm install -g supabase

# Or via Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Initialize Local Supabase

```bash
cd "c:\PROJ\Legal Advice\stitch_legal_opinion_portal_homepage"

# Initialize Supabase
supabase init

# Start local Supabase (Docker required)
supabase start

# This will output:
# - API URL
# - GraphQL URL
# - DB URL
# - Studio URL (local dashboard)
# - anon key
# - service_role key
```

### Update .env.local

Replace your `.env.local` with local Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_supabase_start>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key_from_supabase_start>
```

### Run Migrations Locally

```bash
# Create migration from your SQL files
supabase migration new initial_schema

# Copy your SQL content to the generated migration file
# Then apply migrations
supabase db reset

# Seed data (after creating test users via UI)
supabase db execute --file supabase/seed.sql
```

---

## Troubleshooting

### Error: "violates foreign key constraint profiles_id_fkey"

**Cause**: Trying to insert profiles before auth users exist

**Solution**: Sign up users via the app first (Step 2 above)

### Error: "No users found"

**Cause**: Email addresses in seed.sql don't match actual users

**Solution**:

1. Check actual user emails in Supabase Dashboard → Authentication
2. Update emails in `seed.sql` line 36-39 to match your users

### Profiles Not Created After Signup

**Cause**: Auth trigger not working

**Solution**:

```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, re-run 03_auth_trigger.sql
```

---

## Quick Reference

| Step | Action           | Location                            |
| ---- | ---------------- | ----------------------------------- |
| 1    | Start dev server | `npm run dev`                       |
| 2    | Signup users     | `http://localhost:3000/auth/signup` |
| 3    | Verify users     | Supabase Dashboard → Auth → Users   |
| 4    | Run seed data    | Supabase Dashboard → SQL Editor     |

---

## What Gets Created

After successfully running seed data:

- ✅ 8 Legal Requests (various states)
- ✅ 5 Notifications (client + lawyer)
- ✅ 2 Ratings/Reviews
- ✅ 1 Clarification
- ✅ 2 Audit Log Entries

All linked to your actual test user accounts!
