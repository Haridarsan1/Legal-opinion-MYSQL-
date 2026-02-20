# Database Migration Guide - Phase 1

## Overview

This guide explains how to apply the Phase 1 database migrations for the Legal Opinion Portal upgrade.

## Prerequisites

- Supabase CLI installed, OR
- Access to Supabase Dashboard SQL Editor

## Migration Files Created

1. **`20260203_case_enhancements.sql`** - Adds case type classification and enhanced status tracking
2. **`20260203_enhance_clarifications_structured.sql`** - Adds structured fields to clarifications (related documents, due dates, resolution status)
3. **`20260203_enhance_documents_verification.sql`** - Adds document verification workflow with status and comments

## Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to project root
cd "c:\PROJ\Pixel Projects\Legal Advice\stitch_legal_opinion_portal_homepage"

# Link to your Supabase project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to Supabase
npx supabase db push
```

## Option 2: Using Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Run each migration file in order:

### Step 1: Run `20260203_case_enhancements.sql`

- Click "New Query"
- Copy and paste the entire contents of `supabase/migrations/20260203_case_enhancements.sql`
- Click "Run" or press `Ctrl+Enter`
- Verify: No errors appear

### Step 2: Run `20260203_enhance_clarifications_structured.sql`

- Click "New Query"
- Copy and paste the entire contents of `supabase/migrations/20260203_enhance_clarifications_structured.sql`
- Click "Run"
- Verify: No errors appear

### Step 3: Run `20260203_enhance_documents_verification.sql`

- Click "New Query"
- Copy and paste the entire contents of `supabase/migrations/20260203_enhance_documents_verification.sql`
- Click "Run"
- Verify: No errors appear

## Verify Migrations Applied Successfully

Run this query in SQL Editor to verify the new columns exist:

```sql
-- Check legal_requests table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'legal_requests'
AND column_name IN ('case_type', 'lawyer_accepted_at', 'lawyer_rejected_at');

-- Check clarifications table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clarifications'
AND column_name IN ('related_document_id', 'due_date', 'resolution_status');

-- Check documents table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'documents'
AND column_name IN ('verification_status', 'verified_by', 'verified_at', 'lawyer_comment');
```

Expected result: You should see rows for each column listed above.

## Features Enabled After Migration

### 1. Case Type Classification

- Legal requests can now be categorized by type: Property, Corporate, Banking, Tax, Employment, Intellectual Property
- Enables specialized document requirements per case type

### 2. Structured Clarifications

- **Related Document**: Link clarifications to specific documents
- **Due Date**: Set expected response dates
- **Resolution Status**: Track lifecycle (Open → Responded → Resolved)
- **Lawyer Acknowledgment**: Lawyers can mark clarifications as resolved after client responds

### 3. Document Verification Workflow

- **Verification Status**: Pending, Verified, or Rejected
- **Lawyer Comments**: Add verification notes or rejection reasons
- **Auto-timestamps**: Automatically records when documents are verified/rejected
- **Client Visibility**: Clients can see verification status and comments

## Rollback (If Needed)

All migrations are designed to be **additive only** - they don't modify existing data. If you need to rollback:

```sql
-- Rollback case enhancements
ALTER TABLE legal_requests
    DROP COLUMN IF EXISTS case_type,
    DROP COLUMN IF EXISTS lawyer_accepted_at,
    DROP COLUMN IF EXISTS lawyer_rejected_at;
DROP TYPE IF EXISTS case_type;

-- Rollback clarifications enhancements
ALTER TABLE clarifications
    DROP COLUMN IF EXISTS related_document_id,
    DROP COLUMN IF EXISTS due_date,
    DROP COLUMN IF EXISTS resolution_status,
    DROP COLUMN IF EXISTS resolved_by,
    DROP COLUMN IF EXISTS resolved_at;

-- Rollback documents verification
ALTER TABLE documents
    DROP COLUMN IF EXISTS verification_status,
    DROP COLUMN IF EXISTS verified_by,
    DROP COLUMN IF EXISTS verified_at,
    DROP COLUMN IF EXISTS lawyer_comment;
DROP TRIGGER IF EXISTS trigger_set_document_verified_at ON documents;
DROP FUNCTION IF EXISTS set_document_verified_at();
```

## Next Steps

After applying migrations:

1. **Restart Dev Server**: `npm run dev` (if running)
2. **Test New Features**: Follow the verification plan in `implementation_plan.md`
3. **Check for Errors**: Monitor browser console and server logs

## Troubleshooting

### Error: "type already exists"

- Safe to ignore - migration uses `DO $$ BEGIN ... EXCEPTION ... END $$;` to handle this

### Error: "column already exists"

- Safe to ignore - migrations use `ADD COLUMN IF NOT EXISTS`

### Error: "permission denied"

- Ensure you're running migrations as the database owner or with sufficient privileges

## Support

If you encounter issues:

1. Check the error message in Supabase SQL Editor
2. Verify you're connected to the correct project
3. Ensure no typos in manual SQL execution
   4.Review migration file syntax
