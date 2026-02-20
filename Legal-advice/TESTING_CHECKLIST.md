# 🚀 Complete Testing Checklist

## ✅ Pre-Testing Setup

### 1. Database Migrations (Run in Supabase SQL Editor)

```sql
-- STEP 1: Add new workspace tables and columns
\i supabase/add_lawyer_workspace_fields.sql

-- STEP 2: Add RLS policies (FIXED version)
\i supabase/add_lawyer_workspace_rls.sql

-- STEP 3: Verify migrations succeeded
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('internal_notes', 'opinion_submissions');
-- Should return 2 rows

-- STEP 4: (Optional) Run seed data to create sample cases
\i supabase/seed.sql
```

### 2. Users Required

Ensure these accounts exist in your system:

- ✅ **Lawyer**: haridarsan18@gmail.com / 12345678
- ✅ **Client**: pixelfactory11@gmail.com / 12345678
- ✅ **Bank**: haridarsan01@gmail.com / 12345678
- ✅ **Admin**: voidbreaker404@gmail.com / 12345678

---

## 🧪 Test Scenarios

### Test 1: SLA Real-Time Countdown ⏱️

**Steps:**

1. Login as lawyer: `haridarsan18@gmail.com` / `12345678`
2. Navigate to `/lawyer/assigned`
3. Click on any assigned case (or create one via admin)
4. Observe header section

**Expected Results:**

- [ ] Timer shows hours:minutes format (e.g., "23h 45m remaining")
- [ ] Progress bar matches percentage
- [ ] Color is GREEN if >50% time remaining
- [ ] Color is AMBER if 10-50% time remaining
- [ ] Color is RED if <10% time remaining
- [ ] Timer updates every minute (wait 60 seconds to verify)
- [ ] If SLA paused, shows "PAUSED" badge

---

### Test 2: Risk Flags Toggle 🚩

**Steps:**

1. On lawyer review page, find "Legal Context & Risk Indicators" section
2. Click "+ Add Flag" button
3. Select "Pending Litigation"
   4 Click the flag to add it
4. Repeat for: Missing Documents, High Value Transaction, Time Sensitive

**Expected Results:**

- [ ] Each flag appears with correct icon and color
- [ ] Flags persist after page refresh
- [ ] Can remove flags by clicking X button
- [ ] Action logged in audit timeline
- [ ] Case health updates to show risk flags

---

### Test 3: Document Review Tracking 📄

**Steps:**

1. In "Documents Review" section, find an uploaded document (upload one if needed)
2. Click "Mark Reviewed" button
3. Refresh page

**Expected Results:**

- [ ] Document shows "Reviewed" badge with green checkmark
- [ ] Your name appears as reviewer
- [ ] Timestamp shows when reviewed
- [ ] Review progress bar updates (e.g., "3/5 documents reviewed")
- [ ] Can toggle back to unreviewed
- [ ] Required documents checklist shows checkmarks

---

### Test 4: Internal Notes (CRITICAL SECURITY TEST) 🔒

**Steps:**

1. As lawyer, click "Add Internal Note" in Control Panel (right side)
2. Select note type: "Strategy"
3. Enter text: "Hidden note - client should NEVER see this"
4. Click "Add Note"
5. **LOGOUT**
6. Login as client: `pixelfactory11@gmail.com` / `12345678`
7. Navigate to same case
8. Search entire page for internal notes section

**Expected Results:**

- [ ] As lawyer: Note appears in "Internal Notes" feed
- [ ] As lawyer: Badge shows "Never visible to client"
- [ ] As client: Internal notes section does NOT exist anywhere
- [ ] As client: Cannot see the note content at all
- [ ] **If client can see notes: CRITICAL SECURITY BUG!**

---

### Test 5: SLA Pause/Resume ⏸️▶️

**Steps:**

1. As lawyer, click "Pause SLA" in Control Panel
2. Enter reason: "Awaiting client response on clarification"
3. Click "Pause SLA"
4. Note current deadline time
5. Wait 2 minutes
6. Click "Resume SLA"
7. Check new deadline time

**Expected Results:**

- [ ] Header shows "PAUSED" badge immediately
- [ ] Countdown stops (doesn't decrease)
- [ ] After resume, deadline extends by paused duration
- [ ] Example: If paused for 5 minutes, deadline should be 5 minutes later
- [ ] All actions logged in audit timeline
- [ ] Pause reason saved and visible

---

### Test 6: Case Health Dashboard 💚💛❤️

**Steps:**

1. In Control Panel, observe "Case Health" section
2. Mark some (but not all) documents as reviewed
3. Refresh and check health
4. Mark ALL documents as reviewed
5. Add a risk flag
6. Remove all risk flags

**Expected Results:**

- [ ] Shows 4 health factors: Documents, Clarifications, SLA, Risk Flags
- [ ] Each factor shows status icon (green ✓, amber ⚠️, or red ✗)
- [ ] Overall health badge: "Healthy" (green), "At Risk" (amber), or "Blocked" (red)
- [ ] Updates dynamically as you change things
- [ ] Accurate counts (e.g., "3/5" documents reviewed)

---

### Test 7: Audit Timeline 📋

**Steps:**

1. Scroll to "Complete Audit Trail" section
2. Perform various actions: add note, toggle risk flag, mark document reviewed
3. Refresh page
4. Check timeline

**Expected Results:**

- [ ] Events grouped by date
- [ ] Each event shows: action icon, title, actor name, role badge, timestamp
- [ ] SLA impact badges show for pause/resume actions ("SLA: Paused", "SLA: Resumed")
- [ ] Color-coded by action type (blue=document, green=complete, amber=warning, red=escalation)
- [ ] Events in reverse chronological order (newest first)

---

### Test 8: Professional Opinion Submission 📝

**Steps:**

1. Scroll to "Professional Opinion Submission" section
2. Select "Opinion Type": Preliminary
3. Fill "Assumptions" field
4. Fill "Limitations" field
5. Set "Validity Period": 6 months
6. Check all 5 self-review checklist items
7. Upload a PDF file
8. Toggle "Mark as Final" (optional)
9. Click "Submit Professional Opinion"

**Expected Results:**

- [ ] Cannot submit until all 5 checklist items checked
- [ ] Cannot submit without file upload
- [ ] Success message appears after submission
- [ ] Opinion appears in case records
- [ ] Version number increments (v1, v2, v3...)
- [ ] If "Mark as Final", cannot submit another final opinion
- [ ] Action logged in audit timeline

---

### Test 9: Escalate to Firm 🆙

**Steps:**

1. Click "Escalate to Firm" in Control Panel
2. Enter note: "Complex case requiring senior partner review"
3. Click "Escalate"

**Expected Results:**

- [ ] Escalation recorded
- [ ] Internal note created automatically
- [ ] Escalation owner field updated
- [ ] Action logged in audit
- [ ] Firm admin (if exists) receives notification

---

### Test 10: Complete Workflow End-to-End 🔄

**Steps:**

1. **As Client**: Create new legal request with 3 documents
2. **As Admin**: Assign to lawyer (haridarsan18@gmail.com)
3. **As Lawyer**:
   - Add risk flag: "Missing Documents"
   - Mark 2/3 documents reviewed
   - Add internal note: "Need to verify jurisdiction"
   - Pause SLA with reason
   - Resume SLA
   - Mark all documents reviewed
   - Remove risk flag
   - Submit preliminary opinion with checklist
4. **As Client**: View case and verify cannot see internal notes
5. **As Admin**: Review audit trail

**Expected Results:**

- [ ] Complete flow works without errors
- [ ] All actions logged in audit timeline
- [ ] Client sees opinion but NOT internal notes
- [ ] Case health updates throughout
- [ ] SLA management works correctly

---

## 🐛 Known Issues to Watch For

- [ ] TypeScript errors in browser console
- [ ] 404 errors when navigating to review page
- [ ] RLS policy errors (403 Forbidden)
- [ ] Internal notes visible to clients (CRITICAL!)
- [ ] SLA countdown showing NaN or undefined
- [ ] Document review not persisting
- [ ] Risk flags not saving

---

## ✅ Sign-Off

After completing all tests, check this list:

- [ ] All 10 test scenarios passed
- [ ] No TypeScript errors in console
- [ ] No security issues found
- [ ] Internal notes confirmed secure
- [ ] SLA calculations accurate
- [ ] Audit trail complete
- [ ] Database migrations successful
- [ ] RLS policies working correctly

**Tested By**: ********\_********  
**Date**: ********\_********  
**Status**: ⬜ All Pass ⬜ Issues Found

**Notes**:
