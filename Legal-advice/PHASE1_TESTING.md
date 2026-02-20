# Phase 1 Testing Guide

## Overview

This guide provides step-by-step testing procedures for all Phase 1 features. Test each feature thoroughly to ensure everything works before moving to Phase 2.

---

## Prerequisites

1. ✅ All 5 database migrations applied
2. ✅ Development server running (`npm run dev`)
3. ✅ Browser refreshed to load latest code
4. ✅ Test users available (see `TEST_USERS.md`)

---

## Test 1: Document Verification Workflow

**Objective**: Verify document verification status and lawyer comments work correctly.

### Steps:

1. **Login as Client**
   - Navigate to an existing case or create new one
   - Go to "Documents" tab
   - Upload 3 test documents (any PDF/image files)
   - ✅ Verify: All show "Pending" badge (amber color)

2. **Login as Lawyer**
   - Open the same case
   - Go to "Documents" tab
   - ✅ Verify: All documents show "Pending" status

3. **Verify First Document**
   - Click verify button on first document
   - Add comment: "Title deed verified - all details correct"
   - Click "Verify"
   - ✅ Verify: Badge changes to "Verified" (green)
   - ✅ Verify: Comment appears below document

4. **Reject Second Document**
   - Click reject button on second document
   - Add comment: "Please upload clearer scan"
   - Click "Reject"
   - ✅ Verify: Badge changes to "Rejected" (red)
   - ✅ Verify: Comment appears

5. **Client View**
   - Login as client
   - Navigate to same case Documents tab
   - ✅ Verify: Can see verification statuses
   - ✅ Verify: Can see lawyer comments
   - ✅ Verify: Cannot verify/reject (lawyer-only)

---

## Test 2: Structured Clarifications

**Objective**: Test clarification workflow with document links and due dates.

### Steps:

1. **Lawyer Creates Clarification**
   - Login as lawyer
   - Open case with uploaded documents
   - Go to "Clarifications" tab
   - Click "Raise Clarification"
   - Fill form:
     - Question: "Please clarify the property boundary details"
     - Related document: Select a document from dropdown
     - Due date: Set to 3 days from today
   - Submit
   - ✅ Verify: Clarification appears with "○ Open" badge (amber)
   - ✅ Verify: Due date displays correctly

2. **Client Responds**
   - Login as client
   - Navigate to case Clarifications tab
   - ✅ Verify: Clarification visible with due date
   - Click "Respond"
   - Enter response: "The eastern boundary is 150 feet"
   - Submit
   - ✅ Verify: Status changes to "→ Responded" (blue)
   - ✅ Verify: Response appears below question

3. **Lawyer Resolves**
   - Login as lawyer
   - Go to Clarifications tab
   - ✅ Verify: Status shows "→ Responded"
   - Click "Mark as Resolved"
   - ✅ Verify: Status changes to "✓ Resolved" (green)
   - ✅ Verify: Shows resolved date and lawyer name

---

## Test 3: Case Status Flow & SLA

**Objective**: Verify visual status timeline and SLA indicators work.

### Steps:

1. **View Status Flow**
   - Login as lawyer or client
   - Open any case
   - Go to "Overview" tab
   - Scroll to "Case Progress" section
   - ✅ Verify: Timeline shows all stages
   - ✅ Verify: Current status is highlighted with "Current" badge
   - ✅ Verify: Completed steps have green checkmarks
   - ✅ Verify: Future steps are grayed out

2. **Check SLA Indicator**
   - Look at top of Case Progress section
   - If `sla_deadline` is set:
     - ✅ Verify: Shows days remaining/overdue
     - ✅ Verify: Color coded:
       - Green: >2 days remaining
       - Amber: ≤2 days remaining
       - Red: Overdue
   - If no deadline:
     - ✅ Verify: No SLA indicator shown

3. **Test Status Transitions**
   - As lawyer, try changing case status
   - ✅ Verify: Only valid transitions allowed
   - ✅ Verify: Timeline updates immediately
   - ✅ Verify: "Current" badge moves to new status

---

## Test 4: Lawyer Acceptance Workflow

**Objective**: Test lawyer accept/reject of case assignments.

### Steps:

1. **Assign Case to Lawyer**
   - Create new case and assign to a lawyer
   - Set `lawyer_acceptance_status = 'pending'` in database:
     ```sql
     UPDATE legal_requests
     SET lawyer_acceptance_status = 'pending'
     WHERE id = 'YOUR_CASE_ID';
     ```

2. **Lawyer Views Assignment**
   - Login as assigned lawyer
   - Navigate to case
   - ✅ Verify: Blue "Case Assignment" card appears at top
   - ✅ Verify: Shows case details and Accept/Decline buttons

3. **Accept Case**
   - Click "Accept Case" button
   - ✅ Verify: Card disappears
   - ✅ Verify: Status updates to `in_review`
   - ✅ Verify: `lawyer_accepted_at` timestamp recorded
   - Refresh page
   - ✅ Verify: Changes persist

4. **Decline Case (Alternative)**
   - Reset case to pending
   - Click "Decline Case"
   - ✅ Verify: Modal appears
   - Enter reason: "Outside my area of expertise"
   - Click "Confirm Decline"
   - ✅ Verify: Status returns to `submitted`
   - ✅ Verify: `lawyer_rejected_at` recorded
   - ✅ Verify: Case available for reassignment

---

## Test 5: Document Checklist Widget

**Objective**: Verify case-type based document checklists work.

### Steps:

1. **Set Case Type**
   - Login as lawyer
   - Open a case
   - In database, set case type:
     ```sql
     UPDATE legal_requests
     SET case_type = 'property'
     WHERE id = 'YOUR_CASE_ID';
     ```
   - Refresh browser

2. **View Checklist**
   - Go to Overview tab
   - Scroll to "Document Checklist" section
   - ✅ Verify: Shows required documents for property case:
     - Title Deed \* (mandatory)
     - Sale Agreement \* (mandatory)
     - Property Tax Receipt \* (mandatory)
     - Encumbrance Certificate \* (mandatory)
     - Building Approval Plan (optional)
     - NOC from Society (optional)

3. **Check Progress Bar**
   - ✅ Verify: Progress bar shows 0/6 complete initially
   - ✅ Verify: Shows "6 mandatory documents required"

4. **Upload Matching Document**
   - Go to Documents tab
   - Upload file named "Title Deed.pdf"
   - Return to Overview tab
   - ✅ Verify: Checklist item for "Title Deed" shows "Submitted" status
   - ✅ Verify: Progress updates to 1/6

5. **Lawyer Verifies Document**
   - As lawyer, verify the uploaded document
   - Return to Overview tab
   - ✅ Verify: Checklist item shows "Verified" (green background)
   - ✅ Verify: Progress updates

6. **Mark Optional as Not Required**
   - As lawyer, find "Building Approval Plan" (optional)
   - Click "Mark as Not Required"
   - ✅ Verify: Status changes to "Not Required"
   - ✅ Verify: Progress count includes it

---

## Test 6: Clause Library

**Objective**: Test clause library search, preview, and insertion.

### Steps:

1. **Add Test Clause**
   - In Supabase, insert sample clause:
     ```sql
     INSERT INTO legal_clauses (title, content, category, department, is_approved, tags)
     VALUES (
       'Standard Liability Disclaimer',
       'The seller hereby disclaims all liability for any defects, damages, or issues that may arise after the transfer of ownership. The buyer accepts the property in its current condition.',
       'liability',
       'property',
       true,
       ARRAY['disclaimer', 'liability', 'property_sale']
     );
     ```

2. **Open Clause Library**
   - Login as lawyer
   - Open any case
   - Go to "Opinion" tab
   - Click "Insert from Library" button in editor toolbar
   - ✅ Verify: Clause library modal opens

3. **Search Clauses**
   - Type "liability" in search box
   - ✅ Verify: Clause appears in results
   - ✅ Verify: Shows title, preview, category, and usage count

4. **Filter by Category**
   - Click "liability" category filter
   - ✅ Verify: Only liability clauses shown
   - Click "All" to clear filter

5. **Preview Clause**
   - Click on the clause card
   - ✅ Verify: Modal shows full clause text
   - ✅ Verify: Shows category, department, tags
   - ✅ Verify: Shows usage count

6. **Insert Clause**
   - In preview modal, click "Insert into Opinion"
   - ✅ Verify: Modal closes
   - ✅ Verify: Clause text appears in editor
   - ✅ Verify: Toast notification shows "Inserted: [clause title]"

7. **Copy to Clipboard**
   - Open clause preview again
   - Click "Copy to Clipboard"
   - ✅ Verify: Shows "Copied!" confirmation
   - ✅ Verify: Can paste clause text elsewhere

---

## Test 7: Integration Check

**Objective**: Verify no console errors and all features work together.

### Steps:

1. **Check Browser Console**
   - Open DevTools → Console tab
   - Perform actions from Tests 1-6
   - ✅ Verify: No JavaScript errors
   - ✅ Verify: No 404 network errors
   - ✅ Verify: No database query failures

2. **Check Database**
   - In Supabase Dashboard → Table Editor
   - ✅ Verify: `document_checklist_items` table has entries
   - ✅ Verify: `legal_clauses` table accessible
   - ✅ Verify: Updated columns exist:
     - `legal_requests.case_type`
     - `documents.verification_status`
     - `clarifications.resolution_status`

3. **Test Mobile Responsiveness**
   - Open browser DevTools
   - Switch to mobile view (375px width)
   - Test each feature:
     - ✅ Verify: Document checklist readable
     - ✅ Verify: Status flow readable
     - ✅ Verify: Clause library searchable
     - ✅ Verify: Buttons accessible

---

## Test 8: End-to-End User Flow

**Objective**: Test complete case lifecycle with all new features.

### Steps:

1. **Client Creates Case**
   - Login as client
   - Create new property case
   - Upload 4 documents
   - ✅ Verify: Case created successfully

2. **Admin Assigns Lawyer**
   - Assign lawyer to case
   - Set `lawyer_acceptance_status = 'pending'`

3. **Lawyer Accepts Case**
   - Login as lawyer
   - Accept case assignment
   - ✅ Verify: Status changes to `in_review`
   - ✅ Verify: Document checklist appears

4. **Lawyer Reviews Documents**
   - Verify 3 documents
   - Reject 1 document with comment
   - ✅ Verify: Checklist updates

5. **Lawyer Raises Clarification**
   - Create clarification linked to rejected document
   - Set due date 2 days out
   - ✅ Verify: Clarification created with due date

6. **Client Responds**
   - Login as client
   - Upload corrected document
   - Respond to clarification
   - ✅ Verify: Status changes to Responded

7. **Lawyer Drafts Opinion**
   - Login as lawyer
   - Mark clarification as resolved
   - Go to Opinion tab
   - Open clause library
   - Insert 2 clauses
   - Type additional content
   - Save draft
   - ✅ Verify: Draft saved successfully

8. **Lawyer Sends Opinion**
   - Click "Send to Client"
   - ✅ Verify: Status updates to `opinion_ready`

9. **Client Views Opinion**
   - Login as client
   - Navigate to Opinion tab
   - ✅ Verify: Can view opinion (read-only)
   - ✅ Verify: Cannot edit

---

## Success Criteria

**Phase 1 is ready to deploy if:**

- ✅ All 8 tests pass without errors
- ✅ No console errors in browser
- ✅ No database query failures
- ✅ Mobile responsive on 375px width
- ✅ Existing core flow (client → lawyer → opinion) still works
- ✅ All new features accessible to appropriate roles

---

## Troubleshooting

### Document Checklist Not Appearing

1. Check if `case_type` is set:
   ```sql
   SELECT id, case_type FROM legal_requests WHERE id = 'YOUR_CASE_ID';
   ```
2. Check if checklist items were created:
   ```sql
   SELECT * FROM document_checklist_items WHERE request_id = 'YOUR_CASE_ID';
   ```
3. If empty, run:
   ```sql
   UPDATE legal_requests SET case_type = 'property' WHERE id = 'YOUR_CASE_ID';
   ```

### Clause Library Empty

1. Check if clauses exist:
   ```sql
   SELECT * FROM legal_clauses WHERE is_approved = true;
   ```
2. If empty, insert sample clauses from Test 6

### Status Flow Not Updating

1. Refresh browser (hard refresh: Ctrl+Shift+R)
2. Check `legal_requests.status` in database
3. Verify RLS policies allow updates

---

## Reporting Issues

If you find bugs:

1. Note which test failed
2. Copy browser console errors
3. Copy database error message (if any)
4. Take screenshot of UI issue
5. Note user role (client/lawyer)

Let me know findings and I'll fix before Phase 2!
