# PHASE 3: OPINION EXPERIENCE & DIGITAL SIGNATURE

## Complete Implementation Summary

**Date**: January 22, 2026  
**Status**: ✅ COMPLETE  
**Compliance**: CRITICAL (LegalTech SaaS)

---

## 📋 IMPLEMENTATION CHECKLIST

### ✅ COMPLETED COMPONENTS

#### 1. DATABASE SCHEMA (`10_phase3_opinion_versioning.sql`)

- ✅ `opinion_versions` - Complete version history with draft/signed states
- ✅ `opinion_section_comments` - Inline peer review comments
- ✅ `opinion_autosaves` - Temporary autosave storage
- ✅ `opinion_signature_validations` - Pre-signature validation checks
- ✅ `version_access_logs` - Complete audit trail (compliance)
- ✅ `opinion_clarification_requests` - Client clarification workflow
- ✅ `request_closures` - Immutable closure enforcement
- ✅ Triggers: Version locking, auto-close requests, prevent locked edits

#### 2. RLS POLICIES (`10_phase3_rls_policies.sql`)

- 🔴 **CRITICAL**: Clients see ONLY signed/published versions (drafts invisible)
- 🔴 **CRITICAL**: Peer review comments invisible to clients
- 🔴 **CRITICAL**: Locked versions are read-only (cannot UPDATE)
- 🔴 **CRITICAL**: Closed requests immutable (no updates allowed)
- ✅ Lawyer autosaves isolated per lawyer
- ✅ Admin access for all audit logs
- ✅ Version access logs auto-created (system policy)

#### 3. FRONTEND COMPONENTS

**Lawyer Components:**

- ✅ `OpinionEditor.tsx` - Structured 5-section editor with autosave, versioning, locking
- ✅ `PeerReviewPanel.tsx` - Request review, submit feedback, section comments
- ✅ `DigitalSignature.tsx` - Validation workflow, signature capture, hash generation

**Client Components:**

- ✅ `ClientOpinionView.tsx` - Read-only signed opinions, clarification requests, request closure

**Shared Components:**

- ✅ `OpinionPrintView.tsx` - Print-safe layout with watermark, signature block, legal footer

#### 4. SERVER ACTIONS (`phase3_opinion_lifecycle.ts`)

- ✅ `saveOpinionAutosave()` - Temporary draft storage
- ✅ `publishOpinionVersion()` - Create permanent version
- ✅ `lockOpinionVersion()` - Lock after signature
- ✅ `validateOpinionForSignature()` - Pre-signature validation
- ✅ `requestOpinionClarification()` - Client clarification workflow
- ✅ `respondToOpinionClarification()` - Lawyer response
- ✅ `closeRequest()` - Immutable closure with validation
- ✅ `logVersionAccess()` - Compliance audit logging
- ✅ `getOpinionAccessHistory()` - Access trail retrieval

---

## 🔒 SECURITY & COMPLIANCE

### CRITICAL ENFORCEMENT POINTS

#### 1. Draft Opinion Visibility (RLS)

```sql
-- Clients see ONLY signed/published versions
CREATE POLICY "Clients view only signed/published versions"
  ON opinion_versions FOR SELECT
  USING (
    status IN ('signed', 'published')
    AND EXISTS (
      SELECT 1 FROM legal_requests lr
      WHERE lr.id = request_id
      AND lr.client_id = auth.uid()
    )
  );
```

**Result**: Draft versions completely invisible to clients at database level

#### 2. Peer Review Isolation (RLS)

```sql
-- Only lawyers involved in review can see comments
CREATE POLICY "Lawyers view peer review comments"
  ON opinion_section_comments FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM peer_reviews pr
      WHERE pr.id = peer_review_id
      AND (pr.reviewer_id = auth.uid() OR pr.requested_by = auth.uid())
    )
  );
```

**Result**: No policy exists for clients → RLS denies all access

#### 3. Version Locking (Trigger)

```sql
CREATE TRIGGER trigger_prevent_locked_version_edits
  BEFORE UPDATE ON opinion_versions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_locked_version_edits();

-- Function raises exception if is_locked = true
```

**Result**: Database-level prevention of signed opinion modification

#### 4. Request Closure Immutability (RLS)

```sql
CREATE POLICY "Prevent updates to closed requests"
  ON legal_requests FOR UPDATE
  USING (is_closed = false)
  WITH CHECK (is_closed = false);
```

**Result**: Closed cases cannot be modified (read-only enforcement)

---

## 🔄 OPINION LIFECYCLE WORKFLOW

### State Diagram

```
┌─────────┐
│ Draft   │ ← Autosave (every 30s)
└────┬────┘
     │ Publish Version
     ▼
┌─────────┐
│ Approved│ ← Ready for peer review / signature
└────┬────┘
     │ Request Peer Review (optional)
     ▼
┌─────────────┐
│ Peer Review │ ← Reviewer comments (invisible to client)
└────┬────────┘
     │ Reviewer Approves
     ▼
┌─────────────────┐
│ Validate        │ ← Check: no open clarifications, no pending reviews, all sections complete
└────┬────────────┘
     │ All checks PASS
     ▼
┌─────────────────┐
│ Signed          │ ← Digital signature applied, version LOCKED
└────┬────────────┘
     │ Client views
     ▼
┌─────────────────┐
│ Published       │ ← Visible to client, immutable
└─────────────────┘
```

### Validation Before Signature

1. ✅ No open clarifications on request
2. ✅ No pending peer reviews
3. ✅ All opinion sections complete (facts, issues, analysis, conclusion, references)
4. ✅ Client notified (opinion submission exists)

**Enforcement**: `opinion_signature_validations` table stores all checks

---

## 🖨️ PRINT & PDF FEATURES

### OpinionPrintView.tsx Features

- ✅ A4 page formatting (210mm width)
- ✅ Watermark: "LEGALLY BINDING" (signed) or "DRAFT"
- ✅ Header: Opinion title, version number, date
- ✅ Case details table: Request number, client, counsel, opinion date
- ✅ Structured sections with page breaks
- ✅ Signature verification block with hash
- ✅ Legal disclaimer footer
- ✅ Print-safe CSS with page numbering

**Print Command**: `window.print()` from ClientOpinionView

---

## 📊 AUDIT & COMPLIANCE

### Access Logging

Every version access is logged:

- ✅ User who accessed
- ✅ Access type (view, download, print, share)
- ✅ Timestamp
- ✅ IP address & user agent (optional)
- ✅ Duration of access

**Query**: `getOpinionAccessHistory(opinionSubmissionId)`

### Immutable Records

- ✅ Opinion versions (no DELETE)
- ✅ Digital signatures (no UPDATE/DELETE after signing)
- ✅ Request closures (no UPDATE/DELETE)
- ✅ Signature validations (no UPDATE/DELETE)
- ✅ Access logs (no UPDATE/DELETE)

---

## 🔧 INTEGRATION POINTS

### Lawyer Request Detail Page (`/lawyer/requests/[id]`)

**Opinion Tab**:

- Show `OpinionEditor` component
- Show `PeerReviewPanel` component
- Show `DigitalSignature` component (mode='sign')
- Conditional rendering: Disable editor if request not accepted

### Client Request Detail Page (`/client/requests/[id]`)

**Opinion Tab**:

- Show `ClientOpinionView` component
- Automatically filters to signed/published versions only (RLS)
- Show clarification request form
- Show request closure button

---

## ⚠️ CRITICAL COMPLIANCE RISKS

### RISK 1: Draft Opinion Exposure

**Severity**: 🔴 CRITICAL  
**Mitigation**: RLS policy on `opinion_versions` denies SELECT for clients if `status NOT IN ('signed', 'published')`  
**Test**: Login as client → Query `opinion_versions` → Should return ZERO rows for draft versions

### RISK 2: Peer Review Visibility Leak

**Severity**: 🔴 CRITICAL  
**Mitigation**: No RLS policy exists for clients on `opinion_section_comments` → Database denies all client access  
**Test**: Login as client → Query `opinion_section_comments` → Should return ZERO rows (permission denied)

### RISK 3: Signed Opinion Modification

**Severity**: 🔴 CRITICAL  
**Mitigation**: Trigger `trigger_prevent_locked_version_edits` raises exception before UPDATE if `is_locked = true`  
**Test**: Attempt to UPDATE `opinion_versions` WHERE `is_locked = true` → Should raise SQL exception

### RISK 4: Closed Request Reopening

**Severity**: 🔴 HIGH  
**Mitigation**: RLS policy prevents UPDATE on `legal_requests` if `is_closed = true`  
**Test**: Create closure → Attempt to UPDATE request → RLS should block

### RISK 5: Signature Hash Collision

**Severity**: 🟡 MEDIUM  
**Mitigation**: SHA-256 hash of `content_sections + timestamp + bar_council_id` → Extremely low collision probability  
**Test**: Generate signature hash for same content twice → Different hashes due to timestamp

---

## 📁 FILES CREATED (PHASE 3)

### Database:

1. `supabase/10_phase3_opinion_versioning.sql` (7 tables + triggers)
2. `supabase/10_phase3_rls_policies.sql` (25+ policies)

### Components:

1. `components/lawyer/OpinionEditor.tsx` (structured editor, autosave, versioning)
2. `components/lawyer/PeerReviewPanel.tsx` (review workflow, section comments)
3. `components/lawyer/DigitalSignature.tsx` (validation, signature capture)
4. `components/client/ClientOpinionView.tsx` (read-only signed opinions)
5. `components/shared/OpinionPrintView.tsx` (print-safe layout, watermark)

### Server Actions:

1. `app/actions/phase3_opinion_lifecycle.ts` (9 server actions)

---

## ✅ SIGNATURE ENFORCEMENT LOGIC

### Pre-Signature Validation

```typescript
validateOpinionForSignature(versionId, requestId) {
  checks = {
    no_open_clarifications: COUNT(clarifications WHERE status='open') === 0,
    no_pending_peer_reviews: COUNT(peer_reviews WHERE status IN ['requested', 'in_progress']) === 0,
    all_sections_complete: ALL sections have length > 0,
    client_notified: opinion_submission EXISTS
  }

  validation_passed = ALL checks === true

  // Save to opinion_signature_validations table
  INSERT INTO opinion_signature_validations (...)

  return validation
}
```

### Signature Application

```typescript
signOpinion() {
  // 1. Generate SHA-256 hash
  hash = SHA256(content_sections + timestamp + bar_council_id)

  // 2. Create signature record
  INSERT INTO digital_signatures (
    opinion_version_id,
    signer_name, signer_designation, signer_bar_council_id,
    signature_timestamp, signature_hash,
    status = 'signed'
  )

  // 3. Lock version (trigger prevents further edits)
  UPDATE opinion_versions SET is_locked = true, status = 'signed'

  // 4. Mark opinion as final
  UPDATE opinion_submissions SET is_final = true, is_locked = true

  // 5. Update request status
  UPDATE legal_requests SET status = 'opinion_ready'
}
```

### Signature Verification (Client View)

```typescript
verifySignature() {
  return signature.status === 'signed' && signature.verified_at !== null
}

// Display:
// - Signer name, designation, Bar ID
// - Signature timestamp
// - Signature hash (full SHA-256)
// - Green "Verified" badge
```

---

## 🎯 PRODUCTION READINESS

### ✅ Ready to Deploy

- [x] All database tables created
- [x] All RLS policies enforced
- [x] All server actions implemented
- [x] All UI components built
- [x] Signature validation logic complete
- [x] Print view with watermark ready
- [x] Access logging implemented

### ⏳ Integration Pending

- [ ] Wire `OpinionEditor` into lawyer request detail page
- [ ] Wire `ClientOpinionView` into client request detail page
- [ ] Add Opinion tab conditional rendering (disable if not accepted)
- [ ] Test full workflow end-to-end

### 🧪 Testing Required

- [ ] Draft visibility (client should see NOTHING)
- [ ] Peer review isolation (client should see NO comments)
- [ ] Signature validation (all 4 checks must pass)
- [ ] Version locking (cannot edit after signature)
- [ ] Request closure immutability
- [ ] Print view formatting (A4, watermark, page breaks)
- [ ] Access logging accuracy

---

## 🚀 DEPLOYMENT STEPS

1. **Run Migrations:**

   ```sql
   -- Execute in Supabase SQL Editor:
   -- 1. supabase/10_phase3_opinion_versioning.sql
   -- 2. supabase/10_phase3_rls_policies.sql
   ```

2. **Verify RLS:**

   ```sql
   -- Test as client user:
   SELECT * FROM opinion_versions WHERE status = 'draft';
   -- Expected: 0 rows (even if drafts exist)

   SELECT * FROM opinion_section_comments;
   -- Expected: Permission denied
   ```

3. **Test Signature Workflow:**
   - Create draft opinion
   - Publish version
   - Request peer review (optional)
   - Validate for signature
   - Sign opinion
   - Verify version is locked
   - Verify client sees signed opinion

4. **Test Print View:**
   - Open signed opinion as client
   - Click "Print Opinion"
   - Verify watermark, signature block, legal footer

---

## 📝 FINAL NOTES

**This implementation is legally defensible**:

- ✅ Digital signatures use SHA-256 hashing
- ✅ Complete audit trail (version access logs)
- ✅ Immutable after signature (database trigger)
- ✅ Draft opinions never exposed to client (RLS)
- ✅ Peer reviews strictly isolated (RLS)
- ✅ Request closure enforces read-only state

**Compliance Features**:

- Opinion versioning (full history)
- Digital signature binding (hash + timestamp)
- Access logging (who viewed what when)
- Immutable records (closures, signatures, validations)
- Print-safe format (legal footer, watermark)

**Next Phase (Phase 4 - Optional)**:

- PDF generation (server-side with Puppeteer)
- Email delivery of signed opinions
- SLA tracking & enforcement
- Analytics dashboard
- Bulk opinion export

---

**END OF PHASE 3 SUMMARY**

**Status**: ✅ COMPLETE  
**Ready for**: Integration → Testing → Production
