# Supabase Backend Setup Guide

This guide will walk you through setting up the complete Supabase backend for the Legal Opinion Portal.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Project URL and anon/service keys from Supabase dashboard

## Setup Steps

### 1. Database Schema Setup

Run the SQL files in order in your Supabase SQL Editor:

#### **Step 1.1: Create Schema** (`01_schema.sql`)

```bash
# Copy and paste the entire content of supabase/01_schema.sql into Supabase SQL Editor
# Click "Run" to execute
```

This creates:

- ✅ User roles enum (client, lawyer, firm, bank, admin)
- ✅ Request status enum
- ✅ All database tables (profiles, legal_requests, documents, etc.)
- ✅ Indexes for performance
- ✅ 6 seeded legal departments

**Expected Output:**

```
✅ Database schema created successfully!
📊 Created tables: profiles, departments, legal_requests, documents, ratings, notifications, audit_logs, clarifications
🌱 Seeded 6 legal departments
```

---

#### **Step 1.2: Enable RLS Policies** (`02_rls_policies.sql`)

```bash
# Copy and paste the entire content of supabase/02_rls_policies.sql
# Click "Run"
```

This creates:

- ✅ Row Level Security policies for all tables
- ✅ Role-based access control (RBAC)
- ✅ Secure data isolation between users

**Expected Output:**

```
✅ Row Level Security policies created successfully!
🔒 All tables are now protected with RLS
👥 Policies configured for: client, lawyer, firm, bank, admin
```

---

#### **Step 1.3: Auth Triggers** (`03_auth_trigger.sql`)

```bash
# Copy and paste the entire content of supabase/03_auth_trigger.sql
# Click "Run"
```

This creates:

- ✅ Auto-create profile on user signup
- ✅ Auto-create audit logs on status changes
- ✅ Auto-create notifications on status updates
- ✅ Auto-calculate SLA deadlines

**Expected Output:**

```
✅ Auth triggers and functions created successfully!
🔄 Auto-profile creation on signup enabled
📝 Auto-audit logging on status change enabled
🔔 Auto-notifications on status change enabled
```

---

### 2. Storage Bucket Setup

#### **Step 2.1: Create Bucket (Dashboard)**

1. Go to **Storage** in Supabase Dashboard
2. Click **"Create Bucket"**
3. Configure:
   - **Name:** `legal-documents`
   - **Public:** NO (private)
   - **File size limit:** 10 MB
   - **Allowed MIME types:**
     - `application/pdf`
     - `image/png`
     - `image/jpeg`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

#### **Step 2.2: Storage Policies** (`04_storage_setup.sql`)

```bash
# Copy and paste the entire content of supabase/04_storage_setup.sql
# Click "Run"
```

This creates:

- ✅ Upload policy for authenticated users
- ✅ View policy for request participants
- ✅ Delete policy for file owners

---

### 3. Realtime Configuration

#### **Step 3.1: Enable Realtime** (`05_realtime_setup.sql`)

```bash
# Copy and paste the entire content of supabase/05_realtime_setup.sql
# Click "Run"
```

This enables Realtime for:

- ✅ `legal_requests` - Live status updates
- ✅ `documents` - New file uploads
- ✅ `notifications` - Instant notifications
- ✅ `audit_logs` - Activity tracking
- ✅ `clarifications` - Q&A updates

---

### 4. Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To find these values:**

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

### 5. Verification

#### **Test Database Connection**

```bash
npm run dev
```

Navigate to: `http://localhost:3000/dashboard/client`

You should see the dashboard with no errors in the console.

#### **Test Authentication**

1. Go to `/signup`
2. Create a test account with role "client"
3. Verify:
   - ✅ User created in `auth.users`
   - ✅ Profile auto-created in `profiles` table
   - ✅ Can login and access dashboard

#### **Test Storage**

1. Go to any file upload page
2. Upload a test document
3. Verify:
   - ✅ File appears in `legal-documents` bucket
   - ✅ Metadata saved in `documents` table
   - ✅ Can download the file

---

## Common Issues

### Issue: "relation does not exist"

**Solution:** Make sure you ran `01_schema.sql` first

### Issue: "permission denied"

**Solution:** Check that RLS policies are enabled (`02_rls_policies.sql`)

### Issue: "Storage bucket not found"

**Solution:** Create the `legal-documents` bucket in the Dashboard

### Issue: "Realtime not working"

**Solution:**

1. Verify you ran `05_realtime_setup.sql`
2. Check that tables are added to `supabase_realtime` publication

---

## Next Steps

After setup is complete:

1. ✅ **Test user flows** - Create requests, upload documents, assign lawyers
2. ✅ **Test Realtime** - Verify status updates appear live
3. ✅ **Test RLS** - Verify users can only see their own data
4. ✅ **Production Deploy** - Deploy to Vercel/Netlify with production Supabase instance

---

## Support

If you encounter issues:

1. Check Supabase logs (Logs & Logs Explorer)
2. Verify RLS policies in Database → Policies
3. Check API logs in Logs → API Logs

---

**🎉 Setup Complete!** Your Legal Opinion Portal is now fully connected to Supabase.
