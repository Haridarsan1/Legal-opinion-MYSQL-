# SPRINT 2 TECHNICAL DESIGN SUMMARY

**Phase: Discovery Only (No Implementation)**  
**Date:** January 10, 2026  
**Status:** Ready for Approval

---

## 1. SPRINT 2 OBJECTIVE

**Complete the post-assignment workflows enabling lawyers to resolve cases through clarifications and opinions, and clients to rate completed work.**

In measurable terms:

- Lawyer can request clarifications from client (blocking case progression)
- Client can respond to clarifications (unblock case)
- Lawyer can submit opinion (after clarifications resolved)
- Firm can review and submit stamped opinion to client (if applicable)
- Client can rate lawyer/firm and close case

**Core principle:** Enable full case lifecycle from assignment → completion → delivery → rating.

---

## 2. SPRINT 2 WORKFLOWS

### **Workflow A: Clarifications (Lawyer ↔ Client)**

```
Lawyer views assigned case
  ↓
Lawyer identifies missing information
  ↓
[requestClarification] → Creates clarification, status="clarification_requested", notifies client
  ↓
Client receives notification
  ↓
Client provides response via [respondToClarification]
  ↓
Clarification status="resolved", notifies lawyer
  ↓
Lawyer reviews response
  ↓
Loop: Request more OR Proceed to opinion
```

**Participants:** Lawyer (requester), Client (responder)  
**Blocking:** Case cannot move to "in_review" until all clarifications resolved  
**Notifications:** DB-only (no email in Sprint 2)

---

### **Workflow B: Opinion Submission (Lawyer → Firm → Client)**

```
Lawyer reviews case + clarifications
  ↓
Lawyer drafts opinion in UI (read-only for now, no persistence)
  ↓
[submitOpinion] → Uploads opinion file, status="opinion_ready", notifies firm
  ↓
[FIRM ONLY] Firm senior review (if configured)
  ↓
[submitStampedOpinion] → Status="delivered", notifies client
  ↓
Client notified: "Your opinion is ready"
```

**Participants:** Lawyer (submitter), Firm (senior review if needed), Client (recipient)  
**Guards:**

- Only assigned lawyer can submit opinion
- Opinion can only be submitted if all clarifications resolved
- Firm can only stamp if assigned to firm
- No self-stamping (lawyer ≠ firm)

**Status transitions:**

- `in_review` → `opinion_ready` (lawyer submits)
- `opinion_ready` → `delivered` (firm stamps or auto-transition if no firm)

---

### **Workflow C: Ratings (Client → Analytics)**

```
Client receives opinion (request status="delivered")
  ↓
Client views completed request
  ↓
Client fills rating form:
  - Overall rating (1-5 stars)
  - Optional feedback text
  ↓
[submitRating] → Creates rating record, status="completed", marked completed_at
  ↓
Rating visible to lawyer/firm analytics
  ↓
Request removed from client's active list
```

**Participants:** Client (rater), Lawyer (rated), Firm (rated)  
**Guard:** Rating only available after status="delivered"  
**Uniqueness:** One rating per request (UNIQUE constraint on `ratings(request_id)`)

---

## 3. EXACT STATUS TRANSITIONS

### **Current (Sprint 1) States:**

- `submitted` – Client created, unassigned
- `assigned` – Assigned to lawyer/firm
- `in_review` – Lawyer actively reviewing

### **New (Sprint 2) States & Transitions:**

```
assigned
  ↓
[requestClarification] → clarification_requested
  ↓
[respondToClarification + mark resolved] → in_review (back to assigned?)
  ↓
[submitOpinion] → opinion_ready
  ↓
[submitStampedOpinion OR auto-transition] → delivered
  ↓
[submitRating] → completed (+ completed_at timestamp)

Alternative paths:
- in_review (no clarification needed) → [submitOpinion] → opinion_ready
- opinion_ready (no firm senior review) → auto-transition to delivered after 24h? OR manual submit?
```

**Decision needed:** Does lawyer/firm transition automatically from opinion_ready → delivered, or is it manual?  
_Assumption for design:_ Manual submit required (submitStampedOpinion for firm, or auto-transition if no firm assigned).

---

## 4. SERVER ACTIONS REQUIRED

### **Clarification Management**

| Action                      | Responsibility                   | Guard                                        | Mutation                                                                              |
| --------------------------- | -------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `requestClarification`      | Lawyer creates clarification     | assigned_lawyer_id=auth.uid()                | INSERT clarifications, UPDATE status="clarification_requested", notify client         |
| `respondToClarification`    | Client responds to clarification | requester_id=assigned_lawyer OR (firm rule?) | UPDATE clarifications (response, responded_at), notify lawyer, possibly revert status |
| `markClarificationResolved` | Lawyer marks as resolved         | assigned_lawyer_id=auth.uid()                | UPDATE clarifications (is_resolved=true), possibly revert case status to in_review    |
| `listClarifications`        | Fetch clarifications for case    | Lawyer OR Client (of case)                   | SELECT from clarifications for request_id                                             |

### **Opinion Submission**

| Action                 | Responsibility                     | Guard                                                                          | Mutation                                                                          |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `submitOpinion`        | Lawyer submits opinion text + file | assigned_lawyer_id=auth.uid(), status="in_review", all clarifications resolved | INSERT/UPDATE documents, UPDATE status="opinion_ready", audit, notify firm/client |
| `submitStampedOpinion` | Firm submits stamped opinion       | assigned_firm_id=auth.uid(), status="opinion_ready"                            | UPDATE status="delivered", audit, notify client                                   |
| `getOpinionDetails`    | Fetch opinion for review           | Lawyer OR Firm OR Client (depending on stage)                                  | SELECT documents + metadata                                                       |

### **Ratings**

| Action              | Responsibility                 | Guard                                    | Mutation                                                                            |
| ------------------- | ------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| `submitRating`      | Client rates completed case    | client_id=auth.uid(), status="delivered" | INSERT ratings, UPDATE status="completed" + completed_at, audit, notify lawyer/firm |
| `getRatingBySender` | Lawyer/Firm view their ratings | role check                               | SELECT ratings WHERE lawyer_id OR firm_id                                           |
| `updateRating`      | Client update own rating       | client_id=auth.uid() + request_id owner  | UPDATE ratings                                                                      |

### **Summary: 9 New Server Actions**

1. `requestClarification`
2. `respondToClarification`
3. `markClarificationResolved`
4. `listClarifications`
5. `submitOpinion`
6. `submitStampedOpinion`
7. `getOpinionDetails`
8. `submitRating`
9. `getRatingBySender` or similar for analytics

---

## 5. UI ROUTES & COMPONENTS TO BE TOUCHED

### **Lawyer Dashboard Routes**

| Route                              | Component                  | Purpose                                                     | New/Modified |
| ---------------------------------- | -------------------------- | ----------------------------------------------------------- | ------------ |
| `/dashboard/lawyer/assigned`       | AssignedRequestsContent    | **Add** "Request Clarification" button on each case         | Modified     |
| `/dashboard/lawyer/review/[id]`    | ReviewCasePage             | **Add** Clarifications panel + "Request Clarification" form | Modified     |
| `/dashboard/lawyer/review/[id]`    | ReviewCasePage             | **Add** Opinion form + "Submit Opinion" button              | Modified     |
| `/dashboard/lawyer/clarification`  | (NEW) ClarificationPage    | List all pending clarifications, respond inline             | New          |
| `/dashboard/lawyer/submit-opinion` | (EXISTS) SubmitOpinionPage | Wire `submitOpinion` action + file upload                   | Modify       |

### **Client Dashboard Routes**

| Route                          | Component                  | Purpose                                                                   | New/Modified |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------- | ------------ |
| `/dashboard/client/track`      | (EXISTS) TrackStatusPage   | **Add** Clarification response form when status="clarification_requested" | Modified     |
| `/dashboard/client/track/[id]` | (NEW) ClientRequestDetail  | Display opinion, clarifications, rating form when delivered               | New          |
| `/dashboard/client/ratings`    | (EXISTS) ClientRatingsPage | Wire `submitRating` action + form                                         | Modify       |

### **Firm Dashboard Routes**

| Route                            | Component                  | Purpose                                             | New/Modified |
| -------------------------------- | -------------------------- | --------------------------------------------------- | ------------ |
| `/dashboard/firm/assign`         | FirmAssignContent          | **Add** "View Opinion" link for opinion_ready cases | Modified     |
| `/dashboard/firm/submit-opinion` | (EXISTS) SubmitOpinionPage | Wire `submitStampedOpinion` action                  | Modify       |
| `/dashboard/firm/analytics`      | (EXISTS) FirmAnalyticsPage | Wire ratings fetch (getRatingBySender)              | Modify       |

### **Component Breakdown (No new layouts)**

- **Clarification Form Component:** Subject + Message + Priority dropdown
- **Clarification Response Form Component:** Response textarea
- **Opinion Form Component:** Text editor + File upload
- **Rating Form Component:** Star picker + Feedback textarea (reusable)
- **Timeline Expansion:** Add clarifications + opinion stages to case timeline

---

## 6. EXPLICIT NON-GOALS (Sprint 2)

### **Will NOT Do:**

- ❌ Email notifications (DB-only notifications)
- ❌ Real-time updates (WebSocket/polling) – page refresh required
- ❌ Lawyer opinion persistence (draft saving) – only on final submit
- ❌ Bulk clarification requests (single-threaded per case)
- ❌ Clarification attachments (text-based only)
- ❌ Senior review workflow customization (binary: submit or not)
- ❌ Rating moderation/review by admins
- ❌ Lawyer/Firm performance analytics (computed in separate sprint)
- ❌ Client-side document preview (links only, no inline viewer)
- ❌ Auto-expiry of outstanding clarifications
- ❌ Escalation workflow (no manager review layer yet)

### **Deferred to Future Sprints:**

- Sprint 3+: Email/SMS notifications
- Sprint 3+: Real-time WebSocket
- Sprint 4+: Performance analytics
- Sprint 5+: Advanced SLA tracking & alerts

---

## 7. RISKS & RLS CONSIDERATIONS

### **Risk 1: Clarification Access Control**

**Risk:** Client can be locked viewing their own clarification request from lawyer.  
**Mitigation:** RLS policy allows clients to view clarifications on their requests + lawyers to view clarifications they created.

**RLS Policy Needed:**

```sql
-- Clients can view clarifications on their requests
CREATE POLICY "Clients can view own request clarifications"
  ON clarifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_requests
      WHERE legal_requests.id = clarifications.request_id
      AND legal_requests.client_id = auth.uid()
    )
  );

-- Lawyers can view + update clarifications they created
CREATE POLICY "Lawyers can manage own clarifications"
  ON clarifications
  FOR ALL
  USING (requester_id = auth.uid());
```

### **Risk 2: Opinion Visibility by Stage**

**Risk:** Lawyer submits opinion → firm/client shouldn't see it until firm stamps.  
**Mitigation:** Opinion document belongs to "legal_opinion" document_type; visibility depends on request status + role.

**RLS Policy Needed:**

```sql
-- Lawyers can view own opinion documents
-- Firms can view opinion_ready requests assigned to them
-- Clients can view only after status="delivered"
CREATE POLICY "Visibility controlled by request status"
  ON documents
  FOR SELECT
  USING (
    document_type != 'legal_opinion'
    OR (
      -- Lawyer who created it
      created_by_id = auth.uid()
    )
    OR (
      -- Firm can view if assigned + status >= opinion_ready
      EXISTS (
        SELECT 1 FROM legal_requests
        WHERE legal_requests.id = documents.request_id
        AND legal_requests.assigned_firm_id = auth.uid()
        AND legal_requests.status IN ('opinion_ready', 'delivered', 'completed')
      )
    )
    OR (
      -- Client can view after delivered
      EXISTS (
        SELECT 1 FROM legal_requests
        WHERE legal_requests.id = documents.request_id
        AND legal_requests.client_id = auth.uid()
        AND legal_requests.status IN ('delivered', 'completed')
      )
    )
  );
```

### **Risk 3: Rating Spam / Duplicate Submissions**

**Risk:** Client submits rating twice; violates UNIQUE constraint.  
**Mitigation:** UNIQUE(request_id) constraint in DB + UI disable button after success + check before INSERT in action.

**Server-side safeguard in action:**

```
1. Fetch existing rating for request_id
2. If exists: return error "Already rated"
3. Else: INSERT
```

### **Risk 4: Status Transition Guards**

**Risk:** Lawyer submits opinion while clarifications pending.  
**Mitigation:** `submitOpinion` must check `is_resolved=true` for all clarifications OR status != "clarification_requested".

**Guard Logic:**

```
SELECT COUNT(*) FROM clarifications
WHERE request_id = $1 AND is_resolved = false
IF count > 0: return error "Unresolved clarifications"
```

### **Risk 5: Firm Stamping Without Lawyer Opinion**

**Risk:** Firm tries to stamp non-existent opinion (race condition).  
**Mitigation:** Guard on `submitStampedOpinion` requires status="opinion_ready" (enforced by DB constraint or server check).

---

## 8. DATA MODEL Additions (No schema changes required – already in schema)

### **Clarifications Table (Already Exists)**

```sql
CREATE TABLE clarifications (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL,
  requester_id UUID NOT NULL (lawyer),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

### **Ratings Table (Already Exists)**

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY,
  request_id UUID UNIQUE NOT NULL,
  client_id UUID NOT NULL,
  lawyer_id UUID,
  firm_id UUID,
  overall_rating INTEGER (1-5),
  feedback TEXT,
  created_at TIMESTAMPTZ
);
```

**No schema migrations required for Sprint 2.**

---

## 9. APPROVAL CHECKPOINT

**Before Sprint 2 Implementation, confirm:**

- [ ] Workflow diagrams accurate (A, B, C)?
- [ ] Status transitions match business logic (clarification_requested → in_review → opinion_ready → delivered → completed)?
- [ ] Server action list complete (9 actions sufficient)?
- [ ] RLS policies acceptable (clarifications, opinions, ratings)?
- [ ] UI routes realistic for team capacity?
- [ ] Non-goals list acceptable (no surprises)?
- [ ] Risk mitigations sufficient?

**If all approved:** Proceed to Sprint 2 Implementation Phase.

---

**End of Discovery Document**
