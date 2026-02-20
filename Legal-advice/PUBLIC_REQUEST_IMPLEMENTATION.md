# Public Request Marketplace System - Implementation Guide

## Overview

The Public Request Marketplace System allows clients to post legal requests publicly, enabling multiple lawyers to submit proposals. Clients can then review and select their preferred lawyer, who is automatically assigned to the case.

## 📋 Implementation Summary

### Database Changes

#### New Schema Files

- **`11_public_request_marketplace.sql`** - Core tables and functions
  - Adds `request_type` enum to distinguish 'direct' vs 'public' requests
  - Adds `public_status` enum tracking public request lifecycle
  - Creates `public_case_claims` table for lawyer interest tracking
  - Creates `public_request_notifications` table for marketplace notifications
  - Implements functions: `create_public_claim()`, `select_lawyer_for_public_request()`, `withdraw_public_claim()`, `expire_old_public_requests()`

- **`12_public_request_rls.sql`** - Row Level Security Policies
  - Restricts claims access to relevant parties (clients see all claims on their cases, lawyers see only their own)
  - Prevents lawyers from seeing other lawyers' claims before selection
  - Allows only clients to select lawyers
  - Secures notifications to intended recipients

#### Tables Modified

- **`legal_requests`**
  - Added `request_type` enum ('direct' | 'public') - defaults to 'direct'
  - Added `public_status` enum - tracks PUBLIC_OPEN → LAWYERS_INTERESTED → ASSIGNED → EXPIRED
  - Added `selected_lawyer_id` - references the lawyer chosen by client
  - Added `public_posted_at` - timestamp when case was posted
  - Added `public_expires_at` - auto-expire date for public requests

#### Tables Created

- **`public_case_claims`**
  - `id` - UUID primary key
  - `case_id` - Foreign key to legal_requests
  - `lawyer_id` - Foreign key to profiles
  - `interest_message` - Lawyer's proposal text
  - `timeline_estimate` - Estimated delivery time
  - `fee_estimate` - Proposed fee amount
  - `conflict_confirmed` - Boolean attestation
  - `status` - 'pending' | 'selected' | 'rejected' | 'withdrawn'
  - Unique constraint: One claim per lawyer per case
  - Check constraint: Only one selected claim per case

- **`public_request_notifications`**
  - `id` - UUID primary key
  - `user_id` - Recipient
  - `case_id` - Related case
  - `claim_id` - Related claim (nullable)
  - `type` - 'claim_interest' | 'lawyer_selected' | 'claim_rejected' | 'case_expired'
  - `is_read` - Boolean flag
  - Tracks all marketplace events

### Backend API Actions

**File: `app/actions/publicRequestActions.ts`**

#### Functions

1. **`getPublicOpenRequests(filters?)`**
   - Returns paginated list of PUBLIC_OPEN and LAWYERS_INTERESTED cases
   - Filters: departmentId, priority, search term
   - Access: Lawyers only
   - Returns claim counts for each case

2. **`getMyPublicClaims()`**
   - Returns all claims submitted by current lawyer
   - Includes associated case details and client info
   - Grouped by status for UI
   - Access: Lawyers only

3. **`getInterestedLawyers(caseId)`**
   - Returns all pending/selected claims on a public case
   - Includes lawyer profile info (name, experience, specialization, bio)
   - Access: Case client only
   - Omits other lawyers' proposals until lawyer is selected

4. **`createPublicClaim(formData)`**
   - Lawyer submits interest in public case
   - Creates public_case_claims record
   - Updates case status to LAWYERS_INTERESTED
   - Sends notification to client
   - Validates: Case is public and open, no duplicate claims, no conflicts

5. **`selectLawyerForPublicRequest(caseId, claimId)`**
   - Client selects preferred lawyer from claims
   - Transactional: Updates selected claim, rejects others, assigns case
   - Moves case to standard workflow (assigned_lawyer_id, status='assigned')
   - Notifies selected and rejected lawyers
   - Access: Case client only

6. **`withdrawPublicClaim(claimId)`**
   - Lawyer withdraws pending claim
   - Cannot withdraw selected claims
   - Access: Claim lawyer only

7. **`getPublicRequestNotifications()`**
   - Retrieves all notifications for current user
   - Includes case and claim details
   - Access: Authenticated users

8. **`markNotificationAsRead(notificationId)`**
   - Updates notification read status
   - Access: Notification owner only

### Updated API Actions

**File: `app/actions/requests.ts`**

Modified `createLegalRequest()` to support public requests:

- Detects visibility='public' vs 'private'
- Sets `request_type` field appropriately
- For public requests: Sets `public_status='PUBLIC_OPEN'`, `public_posted_at`, `public_expires_at`
- For public requests: Skips lawyer assignment
- For direct requests: Maintains existing behavior
- Updates notifications accordingly

### Frontend Components

#### Lawyer Portal - Public Requests Section

**File: `app/(dashboard)/lawyer/public-requests/page.tsx`**

- Browse all PUBLIC_OPEN and LAWYERS_INTERESTED cases
- Filter by department, priority, search
- Shows number of existing proposals per case
- Display: case title, description, priority, posted date, claim count
- Click to view details and submit proposal

**File: `app/(dashboard)/lawyer/public-requests/[id]/page.tsx`**

- Detail view of single public request
- Form to submit proposal:
  - Interest message (required)
  - Timeline estimate (optional)
  - Fee estimate (optional)
  - Conflict of interest confirmation (required)
- Validation: Form ensures all required fields before submission
- Success state: Redirects to My Claims with success message

#### Lawyer Portal - My Claims Section

**File: `app/(dashboard)/lawyer/my-claims/page.tsx`**

- Displays all claims organized by status:
  - Pending: Awaiting client selection (can withdraw)
  - Selected: You were chosen! (shows case link, can work on it)
  - Rejected: Client chose another lawyer
  - Withdrawn: You withdrew your proposal
- Shows proposal message, timeline, and fee for each claim
- Withdraw button for pending claims only
- Quick access to assigned cases for selected claims

#### Client Portal - Track Case with Public Requests

**File: `app/(dashboard)/client/track/[id]/InterestedLawyersTab.tsx`**

- New tab in case tracking: "Interested Lawyers"
- Shows all pending proposals in a grid
- For each proposal displays:
  - Lawyer avatar, name, experience, specialization
  - Proposal message (first 3 lines)
  - Timeline estimate and fee estimate
  - "Select This Lawyer" button
- When lawyer is selected:
  - Shows selected lawyer prominently with green highlight
  - Other proposals shown as grayed out
  - Client can message/start working with selected lawyer
- Empty state: "No lawyers yet, check back soon"

### Client Request Creation

Modified **`app/(dashboard)/client/new-request/NewRequestForm.tsx`**:

- Already had visibility toggle for public vs private
- Form continues to work as-is
- When visibility='public': Creates public case, lawyers can claim
- When visibility='private': Creates direct case, lawyer auto-assigned

## 🔐 Security Model

### RLS Policies Enforced

**Public Case Claims**:

- Clients see all claims on their own public cases
- Lawyers see only their own claims
- Admins see all claims
- Lawyers can only create claims for open public cases
- Lawyers can only withdraw pending claims (not selected)

**Public Request Notifications**:

- Users see only their own notifications
- System (via functions) can create notifications
- Users can update their own notifications (mark read)

**Legal Requests**:

- Lawyers can view PUBLIC_OPEN and LAWYERS_INTERESTED cases
- Lawyers can view cases where they have a claim
- Lawyers cannot see other lawyers' claims
- Lawyers cannot see full client details until selected
- Clients see their own cases (existing policy)

### Data Isolation

- Lawyer cannot see competing lawyers' proposals
- Lawyer cannot contact client until selected
- Lawyer cannot access case details until selected
- Client can control the entire selection process
- Case automatically transitions to assigned workflow after selection

## 🔄 Workflow Flows

### Public Request Lifecycle

```
Client creates public request
    ↓
Case status: PUBLIC_OPEN, request_type: public
    ↓
Lawyer 1 submits claim → Case status: LAWYERS_INTERESTED
Lawyer 2 submits claim
Lawyer 3 submits claim
    ↓
Client reviews proposals
    ↓
Client clicks "Select" on Lawyer 2
    ↓
System executes transaction:
  - Lawyer 2 claim → status: selected
  - Lawyer 1, 3 claims → status: rejected
  - Case → assigned_lawyer_id: Lawyer2, status: assigned, public_status: ASSIGNED
  - Notifications sent to all involved
    ↓
Case moves to standard assigned workflow
    ↓
Lawyer 2 and Client work together normally
```

### Direct Request Lifecycle (Unchanged)

```
Client creates direct request with lawyer selection
    ↓
Case status: assigned, request_type: direct
    ↓
Lawyer immediately assigned
    ↓
Normal case workflow continues
```

## 📱 UI Integration Points

### Lawyer Dashboard Navigation

Add to lawyer sidebar:

```
Dashboard
├── Assigned Cases
├── Public Requests [NEW]
├── My Public Claims [NEW]
├── Messages
├── Notifications
└── Profile
```

### Client Dashboard Navigation

No changes needed - existing UI supports public cases via type detection

## 🔔 Notifications System

### Public Request Notifications Table

Separate from general notifications to keep marketplace events isolated:

**Events and Triggers**:

1. **Lawyer Submits Interest**
   - Type: 'claim_interest'
   - Recipient: Client
   - Message: "New lawyer expressed interest in your case"

2. **Client Selects Lawyer**
   - Type: 'lawyer_selected'
   - Recipient: Selected lawyer
   - Message: "You have been selected for a case!"

3. **Client Rejects Lawyer**
   - Type: 'claim_rejected'
   - Recipient: Non-selected lawyers
   - Message: "Client selected another lawyer"

4. **Case Expires**
   - Type: 'case_expired'
   - Recipient: Remaining lawyers with pending claims
   - Message: "This public request is no longer available"

### Notification Reading

Implement in `app/(dashboard)/*/notifications/` pages:

- List all notifications including public request ones
- Mark as read when viewed
- Filter by type if desired

## ⚙️ Database Functions

### `create_public_claim()`

- Validates case is public and open
- Checks no duplicate claims from same lawyer
- Creates claim record
- Updates case status if first claim
- Sends notification to client
- Returns success/error

### `select_lawyer_for_public_request()`

- Validates case belongs to client
- Validates claim exists and is pending
- Transactional:
  - Sets selected claim status to 'selected'
  - Sets all other pending claims to 'rejected'
  - Updates case: assigned_lawyer_id, status='assigned', public_status='ASSIGNED'
- Sends notifications:
  - Selected lawyer: "You have been selected"
  - Rejected lawyers: "Client selected another"
- Can be called multiple times (idempotent for selected claim)

### `withdraw_public_claim()`

- Validates claim belongs to lawyer
- Prevents withdrawal if claim already selected
- Sets claim status to 'withdrawn'
- Lawyer can resubmit later if needed

### `expire_old_public_requests()`

- Mark public requests as EXPIRED if:
  - Still PUBLIC_OPEN or LAWYERS_INTERESTED
  - Posted > 7 days ago
- Notify remaining lawyers
- Can be called via cron job or manually

## 📊 Dashboard Updates

### Lawyer Dashboard

Add new stats:

- "Public Requests Available" - count of PUBLIC_OPEN | LAWYERS_INTERESTED
- "My Pending Claims" - count of pending status
- "Selected Cases" - count of selected status

### Client Dashboard

Add new stat:

- "Cases Awaiting Lawyer Selection" - count of public cases with LAWYERS_INTERESTED status

## 🧪 Testing Checklist

### Core Functionality

- [ ] Client can create public request (visibility='public')
- [ ] Request appears in lawyer's public requests list
- [ ] Lawyer can submit claim with proposal
- [ ] Client can view all interested lawyers
- [ ] Client can select a lawyer
- [ ] Selected lawyer assigned to case
- [ ] Rejected lawyers notified
- [ ] Case transitions to assigned workflow
- [ ] Client and lawyer can message immediately after selection

### Data Isolation (Security)

- [ ] Lawyer can only see their own claims
- [ ] Lawyer cannot see other lawyers' proposals
- [ ] Lawyer cannot view client details before selection
- [ ] Lawyer cannot contact client before selection
- [ ] Client can see all claims on their public cases
- [ ] Notifications only visible to intended users

### Edge Cases

- [ ] Lawyer withdraws claim (others unaffected)
- [ ] Lawyer withdraws after selection attempt (blocked)
- [ ] Multiple lawyers claim simultaneously (handled correctly)
- [ ] Client tries to select rejected claim (blocked)
- [ ] Duplicate claim attempts (blocked with error)
- [ ] Public request expires correctly
- [ ] Expired request hidden from lawyer list

### UI/UX

- [ ] Public requests list filters work
- [ ] Search works across title/description
- [ ] Pagination works
- [ ] Claim forms validate required fields
- [ ] Success/error messages display correctly
- [ ] Redirect after selection works
- [ ] Lawyer can find My Claims page easily
- [ ] Client can find Interested Lawyers tab easily

### Performance

- [ ] Public requests list loads quickly
- [ ] Filtering doesn't lag
- [ ] Selection transaction completes within SLA
- [ ] Notifications deliver reliably

## 📝 Migration Guide

### For Existing Deployments

1. **Run migration scripts in order**:

   ```sql
   -- Run 11_public_request_marketplace.sql
   -- Then run 12_public_request_rls.sql
   ```

2. **Existing cases remain unchanged**:
   - All existing cases automatically get `request_type='direct'`
   - No changes to existing workflow
   - Backward compatible

3. **Deploy new components**:
   - Add new page routes
   - Update navigation
   - Deploy client code

4. **Enable feature for users**:
   - Lawyers can immediately browse public requests
   - Clients can create public requests in new request form
   - Monitor adoption and feedback

### Deployment Steps

1. Deploy database migrations
2. Verify migrations succeeded
3. Deploy updated `requests.ts` backend
4. Deploy new `publicRequestActions.ts` backend
5. Deploy new lawyer pages (public-requests, my-claims)
6. Deploy client component (InterestedLawyersTab)
7. Update navigation/sidebar
8. Announce feature to users

## 🚀 Future Enhancements

1. **AI-Powered Matching**: Suggest best lawyers to clients based on specialization
2. **Bidding System**: Lawyers set their own price, competition drives down costs
3. **Time-Based Expiry**: Auto-expire cases after 3 days with no claims
4. **Review System**: Rate and review lawyers after case completion
5. **Analytics**: Track marketplace metrics, success rates, average fees
6. **Bulk Operations**: Clients post multiple similar cases at once
7. **Negotiation**: Back-and-forth on timeline/fee before selection
8. **Auctions**: Limit-time auctions for popular cases

## 📞 Support & Debugging

### Common Issues

**Issue**: Lawyer cannot see public requests

- Check RLS policies are applied
- Verify lawyer role is correctly set
- Ensure case has request_type='public' and public_status='PUBLIC_OPEN'

**Issue**: Client cannot select lawyer

- Verify function `select_lawyer_for_public_request()` exists
- Check client has permission on case
- Verify claim exists and is pending

**Issue**: Notifications not appearing

- Check public_request_notifications table has records
- Verify user_id matches current user
- Check is_read field logic in UI

### Debug Queries

```sql
-- Find all public cases
SELECT * FROM legal_requests WHERE request_type = 'public';

-- Find all claims on a case
SELECT * FROM public_case_claims WHERE case_id = '<case_id>';

-- Find all notifications for user
SELECT * FROM public_request_notifications WHERE user_id = '<user_id>';

-- Find pending claims
SELECT * FROM public_case_claims WHERE status = 'pending';
```

## 📖 Documentation

- See inline comments in all files
- Database functions have COMMENT statements
- Component props are typed with JSDoc comments
- Action functions include detailed docstrings

---

**Implementation Date**: February 5, 2026
**Version**: 1.0
**Status**: Complete and Ready for Deployment
