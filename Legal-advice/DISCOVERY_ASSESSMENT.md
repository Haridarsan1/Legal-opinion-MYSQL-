# LEGAL DESK PROJECT – COMPREHENSIVE DISCOVERY ASSESSMENT

**Date:** January 10, 2026  
**Status:** ✅ DISCOVERY COMPLETE | Ready for Implementation Planning

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Section 1: Project Overview](#section-1-project-overview)
3. [Section 2: Tech Stack](#section-2-tech-stack)
4. [Section 3: Repository Structure](#section-3-repository-structure)
5. [Section 4: Application Flow](#section-4-application-flow)
6. [Section 5: Database & Data Flow](#section-5-database--data-flow)
7. [Section 6: Roles & Permissions](#section-6-roles--permissions)
8. [Section 7: Current Features](#section-7-current-features)
9. [Section 8: Known Issues & Constraints](#section-8-known-issues--constraints)
10. [Section 9: Change Expectations](#section-9-change-expectations)
11. [Implementation Roadmap](#implementation-roadmap)
12. [Phased Task List](#phased-task-list)

---

## EXECUTIVE SUMMARY

### Project Identity

**Legal Desk** is a multi-sided marketplace platform for legal opinion procurement in India, connecting clients, independent lawyers, law firms, banks, and platform administrators through a unified, SLA-driven workflow.

### Current State

- **Maturity:** Alpha / Early MVP (~35-40% feature-complete)
- **Development Time:** ~2-3 months
- **Deployment Status:** Local development only (localhost:3000); Supabase Cloud backend production-capable
- **Team:** Single primary developer
- **Code Quality:** High; well-architected foundations with low technical debt

### Market Readiness

- **Production Readiness:** ~25-30%
- **Required Timeline:** 3-5 additional months to full market readiness
- **Target Launch:** MVP with core workflows (Phases 1-2) in ~2 months; Phase 3 features can follow

### Critical Blockers (Preventing Market Launch)

1. ❌ No lawyer assignment workflow
2. ❌ No firm case distribution workflow
3. ❌ No bank upload/assignment/tracking workflow
4. ❌ No email notifications
5. ❌ No server-side validation (security gap)
6. ❌ No file upload security validation

### Strategic Positioning

- **Value Proposition:** Multi-sided marketplace, SLA-driven, transparent, audit-compliant
- **Competitive Advantages:** Modern tech stack, end-to-end role support, comprehensive audit logging
- **Market Gap:** Digital legal services for institutional clients (banks) in India

---

## SECTION 1: PROJECT OVERVIEW

### Purpose & Problem Statement

Legal Desk solves the fragmented, opaque, time-consuming legal opinion procurement process by creating a transparent, efficiency-driven, SLA-compliant digital marketplace.

**Problem Solved:**

- Clients: Difficulty finding qualified lawyers, lack of progress visibility, unclear timelines/costs
- Lawyers: Inconsistent case flow, administrative overhead, isolated practice
- Law Firms: Manual case management, lack of scalability, difficulty handling institutional contracts
- Banks: Slow property verification, inconsistent quality, no audit trails
- Platform: Absence of transparent, efficient legal services infrastructure

### Target Users (5 Distinct Roles)

1. **Clients** (individuals & corporate) – Submit requests, upload documents, track status, rate lawyers
2. **Lawyers** (independent practitioners) – Accept assignments, review documents, submit opinions, clarify with clients
3. **Law Firms** (organizations) – Distribute cases, enforce quality control, manage teams, handle bulk contracts
4. **Banks** (institutional clients) – Upload property documents, set SLAs, assign to firms, track compliance
5. **Platform Admins** – Manage marketplace, verify users, resolve disputes, configure settings, monitor analytics

### Deployment Status

- **Current:** Local development (localhost:3000)
- **Infrastructure:** Supabase Cloud (production-capable) with PostgreSQL, auth, storage, realtime
- **Future:** Vercel for frontend; Supabase Cloud for backend; requires dev/staging/prod environment separation

---

## SECTION 2: TECH STACK

### Frontend

| Component              | Status                | Details                                               |
| ---------------------- | --------------------- | ----------------------------------------------------- |
| **Framework**          | ✅ Next.js 15.1.0     | App Router, Server Components, TypeScript strict mode |
| **Styling**            | ✅ Tailwind CSS 3.4.x | Custom primary color (#003366), Manrope font          |
| **Icons**              | ✅ Lucide React       | Consistent iconography                                |
| **Notifications**      | ✅ Sonner             | Toast notifications only                              |
| **Routing Protection** | ✅ middleware.ts      | Auth + role-based access control                      |
| **State Management**   | ✅ Vanilla React      | useState, useReducer only; no global state            |
| **Forms**              | ⚠️ Vanilla HTML       | No form library; **Zod validation needed**            |
| **Real-time**          | ⚙️ Configured, unused | Supabase Realtime enabled; no active subscriptions    |

### Backend & Database

| Component                | Status            | Details                                                           |
| ------------------------ | ----------------- | ----------------------------------------------------------------- |
| **Backend-as-a-Service** | ✅ Supabase Cloud | PostgreSQL, JWT auth, storage, RLS                                |
| **Database**             | ✅ PostgreSQL     | 8 tables with FK relationships, enums, RLS policies               |
| **Storage**              | ✅ 3 buckets      | request-documents, legal-opinions, profile-pictures (signed URLs) |
| **Authentication**       | ✅ Supabase Auth  | Email/password; no OAuth                                          |
| **Business Logic**       | ✅ Server Actions | 100% in `app/actions/` folder                                     |

### Integrations & APIs

| Service              | Status             | Details                       |
| -------------------- | ------------------ | ----------------------------- |
| **Email**            | ❌ Not implemented | No SendGrid, Resend, AWS SES  |
| **SMS**              | ❌ Not implemented | No Twilio, AWS SNS            |
| **Payments**         | ❌ Not implemented | No Stripe, Razorpay           |
| **Analytics**        | ❌ Not implemented | No Google Analytics, Mixpanel |
| **Error Monitoring** | ❌ Not implemented | No Sentry, Rollbar            |
| **Bank APIs**        | ❌ Not implemented | No REST/GraphQL endpoints     |

### DevOps & Deployment

| Component           | Status             | Details                                            |
| ------------------- | ------------------ | -------------------------------------------------- |
| **Testing**         | ❌ Zero coverage   | No Jest, Vitest, Playwright, Cypress               |
| **Linting**         | ✅ ESLint          | Next.js defaults only                              |
| **Code Formatting** | ❌ Not configured  | No Prettier; formatting inconsistent               |
| **CI/CD**           | ❌ Not implemented | No GitHub Actions, CircleCI; manual deployments    |
| **Deployment**      | ❌ Not deployed    | Localhost only; Vercel intended but not configured |
| **Monitoring**      | ❌ Not implemented | No error tracking, performance monitoring          |

### Security & Performance

| Aspect                   | Status              | Details                           |
| ------------------------ | ------------------- | --------------------------------- |
| **Rate Limiting**        | ❌ Not implemented  | Vulnerable to abuse               |
| **CORS Policies**        | ❌ Not configured   | Explicit config missing           |
| **Security Headers**     | ❌ Not implemented  | No CSP, HSTS, X-Frame-Options     |
| **File Validation**      | ⚠️ Client-side only | **Server-side validation needed** |
| **RLS (Data Isolation)** | ✅ Implemented      | Primary security layer; enforced  |
| **Bundle Analysis**      | ❌ Not implemented  | No size awareness                 |

**Critical Tech Debt:**

- Zod validation not implemented
- No form validation library
- No error monitoring
- No CI/CD pipeline
- File upload validation server-side missing
- CSRF protection missing
- Rate limiting missing

---

## SECTION 3: REPOSITORY STRUCTURE

### Production Code Locations (Only These Matter)

| Folder           | Purpose                                                                        | Status                    |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------- |
| **/app**         | Next.js App Router; auth, dashboard routes, server actions                     | ✅ Primary codebase       |
| **/components**  | Shared + layout components; 12 reusable components                             | ✅ UI layer               |
| **/lib**         | Utilities, Supabase clients, types, hooks                                      | ✅ Backend integration    |
| **/supabase**    | Database schema, RLS policies, migrations, seed data                           | ✅ Infrastructure as code |
| **Root configs** | middleware.ts, next.config.js, tsconfig.json, tailwind.config.ts, package.json | ✅ Configuration          |

### Non-Production (Design Artifacts Only)

| Item                                 | Note                                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **24+ root-level dashboard folders** | Figma exports (bank*dashboard*_, client*dashboard*_, etc.); NOT part of app; contain HTML mockups + PNG screenshots |
| **homepage_backup.html**             | Old design backup; not active                                                                                       |

### App Router Structure

```
/app
├── (auth) – Login, signup, forgot-password, reset-password, role selection
├── (dashboard) – Protected routes by role:
│   ├── client/ (80% functional) – create request, track, browse lawyers, ratings, audit logs
│   ├── lawyer/ (50% functional) – assigned cases, clarifications, submit opinion, profile
│   ├── firm/ (20% skeleton) – case management, team, review, analytics
│   ├── bank/ (20% skeleton) – upload, SLA, assign, track
│   └── admin/ (20% skeleton) – users, disputes, analytics, content
├── actions/ – Server actions: lawyer.ts, profile.ts, ratings.ts, requests.ts
├── auth/ – OAuth callback handler
└── Root: layout.tsx, page.tsx, globals.css
```

### Component Architecture

| Folder                    | Components                                                | Reusable?          |
| ------------------------- | --------------------------------------------------------- | ------------------ |
| **/components/layout**    | Navbar, Sidebar                                           | ✅ Yes, role-aware |
| **/components/providers** | ToastProvider                                             | ✅ Yes             |
| **/components/shared**    | 12 components (Card, DataTable, Modal, RatingStars, etc.) | ✅ Yes, all roles  |

**No role-specific component folders; all components shared.**

### Database & Infrastructure (/supabase)

| File                  | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| 01_schema.sql         | 8 tables with relationships, constraints, enums |
| 02_rls_policies.sql   | Row Level Security for all tables               |
| 03_auth_trigger.sql   | Auto-create profile on signup                   |
| 04_storage_setup.sql  | 3 storage buckets with policies                 |
| 05_realtime_setup.sql | Realtime subscriptions config                   |
| migrations/           | Versioned schema changes                        |
| seed.sql              | Test data                                       |

### File Statistics

- **Total Files:** 218
- **Total Folders:** 113
- **React Components (.tsx):** 82 (37.6%)
- **TypeScript Files (.ts):** 15 (6.9%)
- **HTML Mockups (.html):** 46 (NOT part of app)
- **SQL Files (.sql):** 8
- **Config Files:** 6

---

## SECTION 4: APPLICATION FLOW

### Authentication & Entry Point

**Unauthenticated User Flow:**

1. Land on `/` (homepage)
2. Redirect to `/auth/login` or browse `/auth/signup`
3. Create account with email + password
4. Redirected to `/auth/select-role`
5. Select role (Client, Lawyer, Firm, Bank, Admin)
6. Redirected to `/dashboard/{role}/`
7. Role is stored in `profiles.role` (permanent, immutable)

**Session Management:**

- ✅ Supabase JWT token stored in localStorage
- ✅ Token refresh automatic
- ✅ Middleware protects `/dashboard/*` routes
- ✅ Authenticated users accessing `/auth/*` redirected to dashboard

### Navigation Flow by Role

#### Client Dashboard (~80% Implemented)

```
/dashboard/client (Home)
├── /new-request → /dept-select → /details-upload
│   └── (No confirmation page; ⚠️ missing)
├── /track → View request status, assigned lawyer, SLA, documents
├── /lawyers → Browse lawyers (list only; ⚠️ no profiles)
├── /audit-logs → View request activity
├── /profile → View/edit own profile
├── /ratings → View/submit ratings
└── /departments → Browse practice areas
```

#### Lawyer Dashboard (~50% Implemented)

```
/dashboard/lawyer (Home)
├── /assigned → View assigned requests (⚠️ depends on assignment flow)
├── /review/[id] → View request details, documents
├── /clarification → Ask/answer clarifications (⚠️ limited)
├── /submit-opinion → Submit opinion document
├── /notifications → View notifications (⚠️ no real notifications yet)
├── /profile → View/edit own profile
└── /analytics → Personal metrics (⚠️ basic only)
```

#### Bank Dashboard (~20% Skeleton)

```
/dashboard/bank (Home)
├── /upload → Upload documents (❌ no logic)
├── /sla → Select SLA (❌ no logic)
├── /assign → Assign to firms (❌ no logic)
├── /track → Track status (❌ no logic)
├── /audit-logs → View logs (❌ no logic)
└── /integration → API settings (❌ no logic)
```

#### Firm Dashboard (~20% Skeleton)

```
/dashboard/firm (Home)
├── /assign → Assign to lawyers (❌ no logic)
├── /review → Senior review (❌ no logic)
├── /team → Team management (❌ no logic)
├── /oversight → Case oversight (❌ no logic)
└── /analytics → Team metrics (❌ no logic)
```

#### Admin Dashboard (~20% Skeleton)

```
/dashboard/admin (Home)
├── /users → User management (⚠️ view + role change only)
├── /disputes → Dispute resolution (❌ no logic)
├── /analytics → System analytics (❌ no logic)
├── /security-logs → Audit logs (⚠️ basic)
└── /content → Configuration (❌ no UI)
```

### Backend Request-Response Lifecycle

**Data Fetching:**

- Server Components fetch directly via Supabase server client
- ✅ No REST API layer yet
- ✅ RLS enforced at database level
- ⚠️ No optimistic UI updates (page waits for server response)

**File Operations:**

- ✅ Client uploads directly to Supabase Storage
- ✅ Signed URLs generated for access
- ⚠️ No server-side file validation
- ⚠️ No malware scanning

**Error Handling:**

- ✅ Server action errors → Sonner toast messages
- ❌ No error boundary pages
- ❌ No error monitoring

**State Management:**

- ✅ Vanilla React (useState, useReducer)
- ✅ Supabase JWT stored in localStorage
- ⚠️ Multi-step forms lose state on refresh
- ❌ No form persistence

### Real-Time & Notifications

**Current Status:**

- ✅ Supabase Realtime enabled at DB level
- ❌ No active subscriptions (useRealtime.ts planned but not implemented)
- ❌ Users must refresh page to see new data
- ❌ No notifications (in-app toast only)

### Critical Cross-Role Gaps

| Interaction                    | Status     | Impact                             |
| ------------------------------ | ---------- | ---------------------------------- |
| **Client creates request**     | ✅ Works   | Request created                    |
| **Request → Lawyer discovery** | ❌ Missing | Lawyer cannot see or claim request |
| **Lawyer assignment**          | ❌ Missing | No mechanism to assign             |
| **Lawyer → Firm escalation**   | ❌ Missing | Firm cannot see lawyer's opinion   |
| **Bank → Firm assignment**     | ❌ Missing | Banks cannot use platform          |
| **Notifications**              | ❌ Missing | No alerts for any action           |

---

## SECTION 5: DATABASE & DATA FLOW

### Schema Overview

**8 Core Tables:**

| Table              | Purpose                  | Key Fields                                                                                             |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| **profiles**       | User records (all roles) | id, auth_id, role, name, email, bio, specialization, rate, firm_id                                     |
| **legal_requests** | Case management          | id, client_id, lawyer_id, firm_id, status, department_id, description, sla_hours, created_at, deadline |
| **documents**      | File metadata            | id, request_id, file_name, file_path, file_size, mime_type, uploaded_by, created_at, version           |
| **ratings**        | Client feedback          | id, request_id, client_id, lawyer_id, score, comment, created_at                                       |
| **notifications**  | In-app alerts            | id, user_id, type, message, read_status, created_at                                                    |
| **audit_logs**     | Activity tracking        | id, user_id, action, resource_type, resource_id, timestamp, changes                                    |
| **clarifications** | Q&A between parties      | id, request_id, lawyer_id, client_id, question, answer, created_at, resolved                           |
| **departments**    | Practice areas           | id, name, description, sla_hours, active                                                               |

### Key Relationships

```
auth.users (1) ──── (1) profiles
                          │
                    ┌─────┼─────┐
                    │     │     │
            (M) legal_requests (M) documents
                    │
                    ├── (1) departments
                    ├── (1) ratings
                    ├── (M) clarifications
                    └── (M) audit_logs

profiles (firm) (1) ──── (M) profiles (lawyers in firm)
```

### Row Level Security (RLS) Policies

| Table              | Client Can       | Lawyer Can                | Firm Can   | Bank Can     | Admin Can |
| ------------------ | ---------------- | ------------------------- | ---------- | ------------ | --------- |
| **profiles**       | See own          | See own, assigned clients | See team   | See own      | See all   |
| **legal_requests** | See own          | See assigned              | See firm's | See bank's   | See all   |
| **documents**      | See own          | See assigned request      | See team's | See assigned | See all   |
| **clarifications** | See own requests | See assigned              | See team's | See assigned | See all   |
| **audit_logs**     | See own requests | See assigned              | See team's | See assigned | See all   |
| **ratings**        | See own requests | See own received          | See team's | See assigned | See all   |

### Data Lifecycle

**Request Creation:**

- ✅ Client creates request with department, description, documents
- ✅ Status = "pending"
- ✅ Stored in `legal_requests` table
- ❌ NO auto-assignment to lawyer
- ❌ NO notification triggered

**Lawyer Assignment (NOT IMPLEMENTED):**

- ❌ No workflow to discover or claim requests
- ❌ No firm admin assignment mechanism
- ❌ No admin override assignment

**Opinion Submission:**

- ⚠️ Lawyer can submit document to request
- ⚠️ Stored in `documents` table
- ⚠️ No firm review enforcement
- ❌ Client cannot see until full workflow implemented

**Request Completion:**

- ❌ No completion status transition
- ❌ No automatic closure

### Performance & Constraints

| Metric                   | Status                               |
| ------------------------ | ------------------------------------ |
| **N+1 Queries**          | ✅ None identified at current scale  |
| **Indexes**              | ✅ On major foreign keys             |
| **Pagination**           | ⚠️ Not consistently applied          |
| **Load Testing**         | ❌ Not performed                     |
| **Max Concurrent Users** | ⏳ Estimated ~100 before issues      |
| **Max Requests**         | ⏳ Estimated ~10k before bottlenecks |

---

## SECTION 6: ROLES & PERMISSIONS

### Role Model

**5 Distinct Roles (Parallel, Non-Hierarchical):**

```
Client ━━━━┐
Lawyer ━━━ ┼ (Parallel)
Firm ━━━━━┤
Bank ━━━━━┤
Admin ━━━━┛ (Highest authority)
```

**Constraints:**

- ✅ One profile = one role
- ✅ Role selected at signup, permanent (immutable)
- ❌ No multi-role users
- ❌ No role switching after signup
- ❌ No internal role hierarchies (all firm staff equal, all bank staff equal)

### Permission Matrix

#### CLIENT

**Can:**

- Create legal requests
- Upload documents to own requests
- View own requests (RLS enforced)
- Track request status
- View assigned lawyer
- Download own opinions
- Submit ratings
- Participate in clarifications

**Cannot:**

- View other clients' data
- Edit/delete requests
- Assign lawyers or firms
- Access admin/lawyer/firm/bank dashboards

#### LAWYER

**Can:**

- View assigned requests (RLS enforced)
- View client details for assigned cases
- Upload documents/opinions
- Ask/answer clarifications
- View personal analytics
- Update own profile (bio, specialization, availability)

**Cannot:**

- View unassigned requests
- Reassign cases to others
- Delete submitted opinions
- View other lawyers' cases
- Access firm-level analytics
- Access billing/payment data

#### FIRM (Admin)

**Can:**

- View requests assigned to firm (RLS enforced)
- View firm lawyers
- View firm-level analytics (planned)

**Cannot (Currently):**

- Assign cases to lawyers (❌ not implemented)
- Enforce senior review (❌ not implemented)
- Modify SLA rules
- View other firms' data

**No internal hierarchy:** All firm staff treated equally; no senior/junior separation.

#### BANK

**Can:**

- View own bank's requests (planned)
- Download completed opinions
- View assigned firm/lawyer (planned)

**Cannot:**

- View other banks' requests
- Assign lawyers directly
- Modify opinions
- Access firm/admin dashboards

#### ADMIN (Platform Admin)

**Can:**

- View all users, profiles, requests, documents
- Assign requests to firms/lawyers
- Modify user roles
- Resolve disputes
- View all audit logs
- View system-wide analytics
- Override decisions

**Cannot:**

- Impersonate users (❌ not implemented)
- Bypass audit logging

### Enforcement Mechanism

| Layer           | Mechanism            | Coverage                                      |
| --------------- | -------------------- | --------------------------------------------- |
| **Primary**     | Supabase RLS         | ✅ All data access controlled                 |
| **Secondary**   | Next.js middleware   | ✅ Route-level access (dashboard segregation) |
| **Application** | Server action checks | ⚠️ Minimal; relies on RLS                     |

**Security Model:**

- ✅ RLS is source of truth
- ✅ No RLS bypass allowed
- ❌ Server-side role checks missing (rely on RLS only)
- ⚠️ No application-level guards beyond RLS

---

## SECTION 7: CURRENT FEATURES

### Feature Completion Summary

| Role           | Completion | Status                                                                 |
| -------------- | ---------- | ---------------------------------------------------------------------- |
| **Client**     | ~35-40%    | Core request creation working; tracking partial; communication limited |
| **Lawyer**     | ~50%       | Dashboard exists; blocked by assignment workflow                       |
| **Firm**       | ~20%       | Routes skeleton only; no functional workflows                          |
| **Bank**       | ~20%       | Routes skeleton only; entire workflow missing                          |
| **Admin**      | ~20%       | Can view/modify roles; configuration missing                           |
| **Horizontal** | ~10%       | Toast notifications only; no email, search, payments, real-time        |

### Feature Matrix

#### Authentication & User Management

| Feature               | Status   |
| --------------------- | -------- |
| Email/password signup | ✅ Fully |
| Email/password login  | ✅ Fully |
| Password reset        | ✅ Fully |
| Role selection        | ✅ Fully |
| Session persistence   | ✅ Fully |
| OAuth                 | ❌ Not   |

#### Client Features

| Feature              | Status     | Details                                         |
| -------------------- | ---------- | ----------------------------------------------- |
| Create request       | ✅ Fully   | Multi-step form works                           |
| Select department    | ✅ Fully   | Dropdown available                              |
| Upload documents     | ✅ Fully   | Client → Supabase Storage                       |
| Track request        | ✅ Fully   | Status visible                                  |
| View assigned lawyer | ⚠️ Partial | Only when assigned (depends on assignment flow) |
| Download opinion     | ⚠️ Partial | Depends on lawyer submission + assignment       |
| Browse lawyers       | ⚠️ Partial | List only; no profiles                          |
| Submit rating        | ⚠️ Partial | Route exists; limited UI                        |
| View clarifications  | ⚠️ Partial | Basic UI only                                   |

#### Lawyer Features

| Feature                | Status     | Details                                               |
| ---------------------- | ---------- | ----------------------------------------------------- |
| View assigned requests | ⚠️ Partial | Route exists; blocked by assignment workflow          |
| View request details   | ⚠️ Partial | Limited implementation                                |
| Submit opinion         | ⚠️ Partial | Can upload; blocked by assignment                     |
| Ask clarifications     | ⚠️ Partial | Route exists; basic logic                             |
| Personal analytics     | ⚠️ Partial | Basic counts only                                     |
| Receive notifications  | ❌ Not     | No assignment, clarification, or rating notifications |

#### Firm Features

| Feature           | Status     | Details                          |
| ----------------- | ---------- | -------------------------------- |
| View firm cases   | ⚠️ Partial | Route exists; no backend logic   |
| Assign to lawyers | ❌ Not     | Critical blocker                 |
| Senior review     | ❌ Not     | Not implemented                  |
| Team management   | ❌ Not     | Cannot add/remove/manage lawyers |
| Firm analytics    | ❌ Not     | Route only; no metrics           |

#### Bank Features

| Feature           | Status | Details                 |
| ----------------- | ------ | ----------------------- |
| Upload documents  | ❌ Not | Entire workflow missing |
| Select SLA        | ❌ Not | Route only              |
| Assign to firms   | ❌ Not | Critical blocker        |
| Track status      | ❌ Not | Route only              |
| Download opinions | ❌ Not | No workflow             |

#### Admin Features

| Feature            | Status     | Details                      |
| ------------------ | ---------- | ---------------------------- |
| View all users     | ✅ Fully   | Can query all profiles       |
| Modify roles       | ✅ Fully   | Can update user roles        |
| Create users       | ❌ Not     | Only via signup              |
| Verify credentials | ❌ Not     | No verification flow         |
| View requests      | ⚠️ Partial | Can query; limited filtering |
| Manage departments | ⚠️ Partial | Database only; no UI         |
| Analytics          | ❌ Not     | Route only; no metrics       |
| Dispute resolution | ❌ Not     | Not implemented              |

#### Horizontal Features

| Feature              | Status                              |
| -------------------- | ----------------------------------- |
| In-app notifications | ⚠️ Toast only; no persistent center |
| Email notifications  | ❌ Not                              |
| Real-time updates    | ❌ Not (configured but unused)      |
| Search               | ❌ Not                              |
| Filtering            | ⚠️ Basic filters only               |
| Payments             | ❌ Not                              |
| Reporting            | ❌ Not                              |
| Responsive UI        | ⚠️ Desktop-first                    |

### Critical Gaps Blocking Launch

| Gap                           | Impact                             | Severity    |
| ----------------------------- | ---------------------------------- | ----------- |
| **No lawyer assignment**      | Lawyers can't work on cases        | 🔴 Critical |
| **No firm distribution**      | Firms can't use platform           | 🔴 Critical |
| **No bank workflow**          | Banks cannot adopt platform        | 🔴 Critical |
| **No email notifications**    | Users unaware of events            | 🔴 Critical |
| **No server-side validation** | Bad data reaches DB; security risk | 🔴 Critical |
| **No file upload validation** | Any file type/size accepted        | 🔴 Critical |

---

## SECTION 8: KNOWN ISSUES & CONSTRAINTS

### Bugs & Defects Status

| Category                 | Status        | Details                                     |
| ------------------------ | ------------- | ------------------------------------------- |
| **Runtime crashes**      | ✅ None       | Core flows stable                           |
| **Data corruption**      | ✅ None       | FK + CASCADE prevents orphans               |
| **Auth issues**          | ✅ None       | JWT refresh, RLS working                    |
| **File upload**          | ✅ Reliable   | No silent failures; toast errors            |
| **UI crashes**           | ✅ None       | Empty states only (missing logic)           |
| **Database performance** | ✅ Acceptable | No N+1, slow queries, or deadlocks at scale |

**Top 3 Functional Blockers (Not Runtime Bugs):**

1. No lawyer assignment → requests cannot progress
2. No firm distribution → firms cannot function
3. No bank workflow → banks cannot use platform

### Technical Debt

| Area                   | Severity | Details                                          |
| ---------------------- | -------- | ------------------------------------------------ |
| **Form validation**    | 🔴 High  | No Zod; server actions accept unchecked payloads |
| **Input sanitization** | 🔴 High  | Potential XSS; no sanitization                   |
| **File validation**    | 🔴 High  | Client-side only; server-side missing            |
| **CSRF protection**    | 🟠 High  | Not implemented                                  |
| **Rate limiting**      | 🟠 High  | Vulnerable to abuse                              |
| **Code duplication**   | 🟡 Low   | Some UI pattern duplication                      |
| **Architecture**       | 🟡 Low   | Heavy RLS; no abstraction layer                  |
| **Configuration**      | 🟡 Low   | Only `.env.local`; no staging/prod separation    |

### Security Gaps

| Gap                             | Severity    | Details                        |
| ------------------------------- | ----------- | ------------------------------ |
| **Server-side file validation** | 🔴 Critical | Accept any file type/size      |
| **Input validation**            | 🔴 Critical | No schema validation; XSS risk |
| **CSRF protection**             | 🟠 High     | Not implemented                |
| **Rate limiting**               | 🟠 High     | No abuse prevention            |
| **Malware scanning**            | 🟠 High     | Not implemented                |
| **Audit logging**               | ✅ Good     | RLS-protected; data not logged |

### Performance & Scalability

| Metric                      | Current          | At Scale                     |
| --------------------------- | ---------------- | ---------------------------- |
| **100 concurrent users**    | ✅ Should work   | ⏳ Untested                  |
| **1,000 requests**          | ✅ Expected      | ⏳ Untested                  |
| **10,000 requests**         | ⚠️ Risk          | 🔴 Bottlenecks expected      |
| **Pagination**              | ⚠️ Inconsistent  | ❌ Will fail at scale        |
| **Indexing**                | ✅ Basic         | ⚠️ May need optimization     |
| **Real-time subscriptions** | ⏳ Not activated | ❌ Not architected for scale |

### Constraints & Limitations

| Constraint                   | Impact                                                   |
| ---------------------------- | -------------------------------------------------------- |
| **Single developer**         | Timeline stretched; feature prioritization critical      |
| **Supabase free tier**       | Limits: DB size, realtime connections, API rate limits   |
| **No background job system** | Cannot schedule notifications, SLA tracking, escalations |
| **No GDPR export/delete**    | Data privacy compliance gap                              |
| **10MB file size max**       | Enforced client-side only; server-side missing           |
| **India data localization**  | Pending; compliance requirement                          |
| **Lawyer verification**      | Not implemented; trust/regulatory gap                    |

---

## SECTION 9: CHANGE EXPECTATIONS

### Primary Objectives (Priority Order)

| Priority                   | Objective               | Scope                                                                               |
| -------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| **1️⃣ Blocking Launch**     | Complete core workflows | Lawyer assignment, firm distribution, bank end-to-end, email + in-app notifications |
| **2️⃣ Blocking Production** | Security hardening      | Server-side validation (Zod), file validation, CSRF, rate limiting                  |
| **3️⃣ Post-Workflows**      | Production readiness    | Error monitoring (Sentry), consistent pagination, minimal admin UI                  |
| **Secondary (Phase 2+)**   | Deferred features       | Payments, real-time, advanced analytics, multi-role users                           |

### Non-Negotiable Constraints

#### 🚫 User Interface

- **UI designs are SOURCE OF TRUTH**
- Existing UI mockups dictate expected workflows
- Backend/logic must adapt to UI, not vice versa
- ❌ NO layout redesign, navigation changes, or visual restructuring allowed

#### 🚫 Technology Stack

- Next.js App Router (cannot change)
- Supabase (Auth, DB, Storage, RLS)
- Tailwind CSS
- Dependencies may be added (Zod, Sentry) but not replaced

#### 🚫 Role & Permission Model

- 5 roles fixed (Client, Lawyer, Firm, Bank, Admin)
- Single role per user (no multi-role)
- No new roles or hierarchies

#### 🚫 Authentication

- Supabase email/password (must remain)
- Role selection post-signup, permanent
- OAuth optional but not required

### Database & Backward Compatibility

- ✅ All existing data must be preserved
- ✅ Schema changes allowed if backward-compatible
- ✅ Migrations required if schema changes
- ✅ Sessions may be invalidated on deployment

### Architectural Improvements (Allowed)

- ✅ Codebase restructuring (clear separation by feature)
- ✅ Introduce Zod validation
- ✅ Add error boundaries and consistent error handling
- ⚠️ Global state management optional
- ⚠️ Form persistence desirable but not mandatory

### Security Hardening (Mandatory)

| Control                          | Requirement                   |
| -------------------------------- | ----------------------------- |
| **Server-side input validation** | ✅ Zod for all inputs         |
| **File validation**              | ✅ Type + size server-side    |
| **CSRF protection**              | ✅ Basic implementation       |
| **Rate limiting**                | ✅ On server actions          |
| **Malware scanning**             | ⏳ Phase 2 (not required now) |

### Workflow Implementation Sequence

```
Phase 1: Core Workflows + Security
├─ Lawyer assignment workflow
├─ Firm case distribution to lawyers
├─ Bank end-to-end (upload → SLA → assign → track → opinion)
└─ Security hardening (validation, rate limiting, CSRF)

Phase 2: Notifications + Admin UI + Stability
├─ Email notifications
├─ In-app persistent notification center
├─ Minimal admin configuration UI (departments, SLAs, assignments)
└─ Pagination consistency

Phase 3: Enhanced Features (Post-MVP)
├─ Payment processing
├─ Real-time subscriptions
├─ Advanced analytics
└─ Multi-role users (if needed)
```

### Feature Decisions

| Feature                    | Decision                                              |
| -------------------------- | ----------------------------------------------------- |
| **Notifications**          | Email first → in-app center; SMS deferred             |
| **Real-Time**              | Not mandatory; polling acceptable for MVP             |
| **Payments**               | Not required for initial launch; Phase 2+             |
| **Admin Configuration UI** | Minimal but required (departments, SLAs, assignments) |
| **Multi-Role Users**       | Deferred; not in scope                                |
| **Internal Hierarchies**   | Deferred; not in scope                                |

### Post-Assessment Deliverables

✅ **1. Comprehensive Project Understanding Document** (this document)
✅ **2. Prioritized Implementation Roadmap** (see below)
✅ **3. Phased Task List** (Phase 1 / 2 / 3 with specific tasks)

---

## IMPLEMENTATION ROADMAP

### Overview

This roadmap defines the logical sequence and dependencies for completing Legal Desk's core functionality, security hardening, and production readiness.

### Phasing Strategy

**Total Estimated Time:** ~2-3 months (single developer, MVP + Phase 2)

```
Current State (Jan 2026)
├─ 35-40% feature-complete
├─ Zero critical bugs
└─ 25-30% production-ready

        ↓

Phase 1: Core Workflows + Security (4-6 weeks)
├─ Lawyer assignment workflow (1.5 weeks)
├─ Firm case distribution (1.5 weeks)
├─ Bank end-to-end workflow (2 weeks)
└─ Security hardening (1 week)
└─ Result: MVP feature-complete, security-ready

        ↓

Phase 2: Notifications + Admin UI (2-3 weeks)
├─ Email notifications infrastructure (1 week)
├─ In-app notification center (0.5 weeks)
└─ Admin configuration UI (1-1.5 weeks)
└─ Result: Users notified; platform configurable

        ↓

Phase 3: Enhanced Features (Post-MVP, backlog)
├─ Payment processing
├─ Real-time subscriptions
└─ Advanced analytics

        ↓

Production Launch Ready
├─ All workflows functional
├─ Security hardened
├─ Notifications working
├─ Admin UI present
└─ 70-80% feature-complete

        ↓

Phase 4: Optimization (Post-Launch)
├─ Performance tuning
├─ Scalability hardening
├─ Advanced analytics
└─ Business model implementation
```

### Dependency Map

```
Client Request Creation (✅ exists)
        ↓
        ├─→ Lawyer Assignment Workflow (❌ BLOCKER #1)
        │   ├─→ Lawyer Dashboard Population
        │   ├─→ Assignment Notifications
        │   └─→ Firm Case Distribution (❌ BLOCKER #2)
        │       ├─→ Firm Dashboard Population
        │       ├─→ Opinion Submission
        │       ├─→ Bank Workflow (❌ BLOCKER #3)
        │       │   ├─→ Bank Upload
        │       │   ├─→ SLA Tracking
        │       │   ├─→ Bank Dashboard Population
        │       │   └─→ Opinion Delivery to Bank
        │       │
        │       └─→ All Notifications (❌ BLOCKER #4)
        │           ├─→ Email Notifications
        │           └─→ In-App Notification Center
        │
        └─→ Security Hardening (❌ BLOCKER #5)
            ├─→ Zod Validation
            ├─→ File Validation
            ├─→ CSRF Protection
            └─→ Rate Limiting

Admin Configuration UI (⏳ Phase 2)
        ├─→ Department Management
        ├─→ SLA Management
        └─→ User Management
```

### Critical Path

**The critical path to MVP launch:**

```
1. Implement Lawyer Assignment Workflow (dependency for all other workflows)
   ↓
2. Implement Firm Case Distribution (dependent on #1)
   ↓
3. Implement Bank End-to-End Workflow (dependent on #1 and #2)
   ↓
4. Implement Notifications Infrastructure (dependent on #1, #2, #3)
   ↓
5. Implement Security Hardening (independent; can be parallel)
   ↓
6. Implement Admin Configuration UI (Phase 2)
```

### Success Criteria by Phase

**Phase 1 (Core Workflows + Security):**

- ✅ Lawyer can see and claim assigned requests
- ✅ Firm can distribute requests to lawyers
- ✅ Bank can upload documents and assign to firms
- ✅ Bank can see request status and download opinions
- ✅ All inputs validated server-side (Zod)
- ✅ Files validated (type + size) server-side
- ✅ CSRF protection enabled
- ✅ Rate limiting on server actions

**Phase 2 (Notifications + Admin UI):**

- ✅ Users receive email notifications for key events
- ✅ In-app notification center persistent
- ✅ Admin can manage departments via UI
- ✅ Admin can configure SLA defaults via UI
- ✅ Admin can manually assign requests via UI
- ✅ All lists paginated consistently

**Phase 3 (Enhanced Features):**

- ✅ Payment processing integrated (if monetization decided)
- ✅ Real-time subscriptions activated
- ✅ Advanced analytics available
- ✅ Platform scales to 10,000+ requests

---

## PHASED TASK LIST

### PHASE 1: CORE WORKFLOWS + SECURITY (4-6 weeks)

#### SPRINT 1: Lawyer Assignment Workflow (1.5 weeks)

**Goal:** Lawyers can discover, claim, and work on assigned requests.

**Tasks:**

1. **Create Lawyer Request Discovery Service** (0.5 days)
   - [ ] Design unassigned request query (all + pending assignment)
   - [ ] Create server action: `getUnassignedRequests()`
   - [ ] Filter by department/practice area
   - [ ] Return: request ID, client name, department, created date, description

2. **Implement Lawyer Dashboard - Assigned Requests List** (0.5 days)
   - [ ] Create `/dashboard/lawyer/available` route (optional: rename `/assigned`)
   - [ ] Display list of available/assigned requests
   - [ ] Show: request ID, client, department, status, created date
   - [ ] Add filter by status (available, claimed, completed)
   - [ ] Add pagination (20 requests per page)

3. **Implement Request Claim/Assignment** (0.5 days)
   - [ ] Create server action: `claimRequest(requestId)`
   - [ ] Validate: lawyer can only claim unassigned requests
   - [ ] Update: `legal_requests.lawyer_id = current_lawyer`
   - [ ] Update: request status to "assigned"
   - [ ] Create audit log entry
   - [ ] Return: success toast

4. **Implement Request Detail View (Lawyer)** (0.5 days)
   - [ ] Create `/dashboard/lawyer/review/[id]` detail page
   - [ ] Display: client name, contact, department, description, deadline, documents
   - [ ] Show: all uploaded documents (client + lawyer)
   - [ ] Add: download document button
   - [ ] Add: navigation back to list

5. **Implement Clarifications Q&A (Basic)** (0.5 days)
   - [ ] Create `/dashboard/lawyer/clarification` page
   - [ ] Display: list of clarifications for assigned requests
   - [ ] Show: question, client response, status
   - [ ] Add: form to ask new clarification
   - [ ] Add: form to answer clarifications
   - [ ] Create server action: `postClarification(requestId, question)`
   - [ ] Create server action: `answerClarification(clarificationId, answer)`

6. **Integrate Notifications Trigger (Stubbed)** (0.5 days)
   - [ ] When lawyer claims request: create notification (not yet sent)
   - [ ] When client responds to clarification: create notification
   - [ ] When opinion submitted: create notification for client
   - [ ] Store in `notifications` table (email sending in Phase 2)

7. **Add Audit Logging** (0.25 days)
   - [ ] Log lawyer assignment: "Lawyer X assigned to request Y"
   - [ ] Log clarification creation: "Lawyer X asked clarification"
   - [ ] Log clarification answer: "Client answered clarification"

8. **Test & Validation** (0.25 days)
   - [ ] Test lawyer can see unassigned requests
   - [ ] Test lawyer can claim a request
   - [ ] Test request status updates correctly
   - [ ] Test clarifications create and show correctly
   - [ ] Test audit logs populated

**RLS Policy Changes:**

- ✅ Already allows lawyers to see assigned requests
- ⚠️ May need update if "available requests" requires different RLS

---

#### SPRINT 2: Firm Case Distribution Workflow (1.5 weeks)

**Goal:** Firms can distribute assigned cases to their lawyers.

**Tasks:**

1. **Create Firm Case Query Service** (0.5 days)
   - [ ] Design query: requests assigned to firm (status = "assigned" or "in_review")
   - [ ] Create server action: `getFirmCases(firmId)`
   - [ ] Return: request ID, assigned lawyer, status, client name, deadline, completion %

2. **Implement Firm Dashboard - Case Management** (0.5 days)
   - [ ] Create `/dashboard/firm/assign` route
   - [ ] Display: list of firm's assigned requests
   - [ ] Show: request ID, status, lawyer (if assigned to lawyer), deadline, client
   - [ ] Add: assign to lawyer button
   - [ ] Add: pagination (20 per page)

3. **Implement Lawyer Assignment Modal/Form** (0.5 days)
   - [ ] When "assign" clicked, show modal with firm's lawyers
   - [ ] Filter lawyers by specialization (optional)
   - [ ] Create server action: `assignRequestToLawyer(requestId, lawyerId)`
   - [ ] Validate: lawyer must be in same firm
   - [ ] Update: `legal_requests.lawyer_id = selected_lawyer`
   - [ ] Update: request status = "assigned_to_lawyer"
   - [ ] Trigger notification (stubbed)

4. **Implement Firm Dashboard - Senior Review** (0.5 days)
   - [ ] Create `/dashboard/firm/review` route
   - [ ] Display: list of requests with submitted opinions (status = "opinion_submitted")
   - [ ] Show: request ID, lawyer, opinion submission date, status
   - [ ] Add: review button for each opinion

5. **Implement Opinion Review View** (0.5 days)
   - [ ] Display: opinion document, lawyer notes, client request details
   - [ ] Add: approve opinion button
   - [ ] Add: request revisions button
   - [ ] Create server action: `approveOpinion(requestId)`
   - [ ] Create server action: `requestOpinionRevision(requestId, comments)`
   - [ ] Update status: "approved" or "revision_requested"

6. **Implement Firm Lawyer Team View** (0.5 days)
   - [ ] Create `/dashboard/firm/team` route
   - [ ] Display: list of lawyers in firm
   - [ ] Show: lawyer name, specialization, cases assigned, cases completed, avg rating
   - [ ] (Note: Adding/removing lawyers deferred to Phase 2)

7. **Integrate Notifications (Stubbed)** (0.25 days)
   - [ ] When lawyer assigned: create notification
   - [ ] When opinion needs review: create notification
   - [ ] When revision requested: create notification

8. **Test & Validation** (0.25 days)
   - [ ] Test firm can see assigned cases
   - [ ] Test firm can assign to lawyer
   - [ ] Test firm can see opinions for review
   - [ ] Test firm can approve/request revisions

**RLS Policy Changes:**

- May need update: firm lawyer queries must return firm's lawyers only

---

#### SPRINT 3: Bank End-to-End Workflow (2 weeks)

**Goal:** Banks can upload documents, assign to firms, track status, download opinions.

**Tasks:**

1. **Implement Bank Document Upload** (1 day)
   - [ ] Create `/dashboard/bank/upload` form
   - [ ] Add: multi-file upload (batch)
   - [ ] Add: document category dropdown (property verification, contract review, etc.)
   - [ ] Add: urgency level (normal, high, critical)
   - [ ] Server action: `uploadBankDocuments(files, category, urgency)`
   - [ ] Validate: file type/size server-side
   - [ ] Store: in `legal_requests` as bank request (client_id = bank_id)
   - [ ] Create: `documents` records for each file
   - [ ] Set: SLA deadline based on urgency
   - [ ] Return: success toast + upload summary

2. **Implement SLA Selection** (0.5 days)
   - [ ] Create `/dashboard/bank/sla` route
   - [ ] Display: list of departments with SLA options
   - [ ] Show: 24h, 48h, 72h options per department
   - [ ] Allow: bank to set preferred SLA
   - [ ] Store: in request creation

3. **Implement Firm Selection & Assignment** (1 day)
   - [ ] Create `/dashboard/bank/assign` route
   - [ ] Display: uploaded requests awaiting firm assignment
   - [ ] Show: request ID, documents, SLA, urgency, department
   - [ ] Add: select firm dropdown (empaneled firms only)
   - [ ] Server action: `assignRequestToFirm(requestId, firmId)`
   - [ ] Validate: firm handles this practice area
   - [ ] Update: `legal_requests.firm_id = selected_firm`
   - [ ] Update: status = "assigned_to_firm"
   - [ ] Trigger: firm notification (email in Phase 2)

4. **Implement Bank Request Tracking** (1 day)
   - [ ] Create `/dashboard/bank/track` route
   - [ ] Display: all bank's requests with status
   - [ ] Show: request ID, firm, lawyer, status, SLA deadline, time remaining
   - [ ] Add: SLA indicator (on-track, at-risk, overdue)
   - [ ] Add: click to view details
   - [ ] Add: pagination

5. **Implement Request Detail View (Bank)** (0.5 days)
   - [ ] Display: request documents, assigned firm/lawyer, current status
   - [ ] Show: opinion (if completed and approved)
   - [ ] Add: download opinion button
   - [ ] Show: SLA compliance indicator
   - [ ] Show: clarifications (if any)

6. **Implement Bank Audit Logs** (0.5 days)
   - [ ] Create `/dashboard/bank/audit-logs` route
   - [ ] Display: activity log for bank's requests
   - [ ] Show: timestamp, action, request ID, actor, details
   - [ ] Add: filter by request
   - [ ] Add: export option (Phase 2)

7. **Create Firm Empanelment Data Structure** (0.5 days)
   - [ ] Add to `profiles` or new table: firm specialization areas
   - [ ] Track: which firms handle which departments
   - [ ] Seed: test data (firm 1 handles property, firm 2 handles corporate, etc.)

8. **Integrate Notifications (Stubbed)** (0.5 days)
   - [ ] When assigned to firm: create notification
   - [ ] When status changes: create notification
   - [ ] When SLA at-risk: create notification
   - [ ] When SLA exceeded: create notification
   - [ ] When opinion ready: create notification

9. **Test & Validation** (0.5 days)
   - [ ] Test bank can upload documents
   - [ ] Test documents stored correctly
   - [ ] Test bank can assign to firm
   - [ ] Test firm sees assignment
   - [ ] Test bank can track status
   - [ ] Test opinion visible to bank when ready
   - [ ] Test SLA calculations

**RLS Policy Changes:**

- New: banks can only see their own requests
- New: firms can see requests assigned to them

---

#### SPRINT 4: Security Hardening (1 week)

**Goal:** All inputs validated, files validated, basic CSRF, rate limiting.

**Tasks:**

1. **Install Zod & Integrate into Project** (0.5 days)
   - [ ] npm install zod
   - [ ] Create: `lib/schemas.ts` for all form schemas
   - [ ] Schema: LoginForm, SignupForm, RequestForm, OpinionForm, ClarificationForm, etc.

2. **Add Server-Side Input Validation to All Server Actions** (2 days)
   - [ ] Update: `app/actions/requests.ts` - validate all inputs with Zod
   - [ ] Update: `app/actions/lawyer.ts` - validate all inputs
   - [ ] Update: `app/actions/ratings.ts` - validate all inputs
   - [ ] Update: `app/actions/profile.ts` - validate all inputs
   - [ ] Each server action: parse input, return error if invalid
   - [ ] All server actions: wrap in try/catch, return user-friendly errors
   - [ ] Test: invalid inputs rejected with error messages

3. **Add Server-Side File Validation** (1 day)
   - [ ] Create: `lib/fileValidation.ts`
   - [ ] Validate: file type (whitelist: PDF, DOC, DOCX, JPG, PNG)
   - [ ] Validate: file size (max 10MB; reject if over)
   - [ ] Reject: executable files (exe, sh, bat, etc.)
   - [ ] Implement in: `uploadBankDocuments()`, document upload forms
   - [ ] Return: error toast if validation fails
   - [ ] Test: all file types and sizes

4. **Implement CSRF Protection** (1 day)
   - [ ] Review: Next.js CSRF defaults (already present with form actions)
   - [ ] Add: CSRF token to all forms (built-in to Next.js 15)
   - [ ] Verify: middleware checks CSRF
   - [ ] Test: CSRF attacks blocked

5. **Implement Rate Limiting on Server Actions** (1 day)
   - [ ] Install: `lru-cache` or equivalent
   - [ ] Create: `lib/rateLimit.ts` utility
   - [ ] Apply: rate limiting to sensitive actions:
     - [ ] `claimRequest()` - 10 per minute per user
     - [ ] `uploadBankDocuments()` - 5 per minute per bank
     - [ ] `postClarification()` - 20 per minute per lawyer
     - [ ] Others: standard 100 per minute
   - [ ] Return: error if rate limit exceeded
   - [ ] Test: rate limiting working

6. **Add Form Validation Error Messages** (0.5 days)
   - [ ] Update: all forms to display validation errors
   - [ ] Add: inline error indicators (red text, visual feedback)
   - [ ] Test: users see error messages

7. **Test & Validation** (0.5 days)
   - [ ] Test all form submissions with invalid data
   - [ ] Test file upload with invalid files
   - [ ] Test rate limiting kicks in
   - [ ] Test CSRF protection

**Defer to Later:**

- Malware scanning (Phase 2+)
- Advanced security headers (CSP, HSTS) (Phase 2+)

---

### PHASE 2: NOTIFICATIONS + ADMIN UI (2-3 weeks)

#### SPRINT 5: Email Notifications Infrastructure (1 week)

**Tasks:**

1. **Select Email Service & Integrate** (0.5 days)
   - [ ] Choose: Resend (recommended for Next.js) or SendGrid or AWS SES
   - [ ] Install: email library
   - [ ] Setup: API keys in environment variables
   - [ ] Test: send test email

2. **Create Email Templates** (1 day)
   - [ ] Template: Request assigned (to lawyer)
   - [ ] Template: Clarification asked (to client)
   - [ ] Template: Clarification answered (to lawyer)
   - [ ] Template: Opinion submitted (to firm/client)
   - [ ] Template: Opinion approved (to client)
   - [ ] Template: SLA warning (to bank)
   - [ ] Template: SLA exceeded (to bank)
   - [ ] All: with branding, links, clear CTAs

3. **Create Notification Service** (1 day)
   - [ ] Create: `lib/notifications.ts`
   - [ ] Function: `sendNotificationEmail(userId, type, data)`
   - [ ] Logging: all emails sent to audit table (future analytics)
   - [ ] Error handling: graceful failure if email fails

4. **Integrate Email into Workflows** (1 day)
   - [ ] Lawyer assignment → send email to lawyer
   - [ ] Clarification asked → send email to client
   - [ ] Clarification answered → send email to lawyer
   - [ ] Opinion submitted → send email to firm/client
   - [ ] Opinion approved → send email to client
   - [ ] SLA at-risk → send email to bank
   - [ ] SLA exceeded → send email to bank + firm

5. **Test & Validation** (0.5 days)
   - [ ] Test emails sent for each event type
   - [ ] Test email content correct
   - [ ] Test links work
   - [ ] Test undeliverable emails handled

---

#### SPRINT 6: In-App Notification Center (0.5 weeks)

**Tasks:**

1. **Create Persistent Notification UI** (0.5 days)
   - [ ] Create: `/components/shared/NotificationCenter.tsx`
   - [ ] Display: notification list (most recent first)
   - [ ] Show: notification type, message, timestamp, read/unread status
   - [ ] Add: mark as read button
   - [ ] Add: clear/archive notifications
   - [ ] Add: notification count badge on navbar

2. **Implement Notification Queries** (0.5 days)
   - [ ] Server action: `getNotifications(userId, limit=20)`
   - [ ] Filter: unread first, then by date
   - [ ] Server action: `markNotificationRead(notificationId)`
   - [ ] Server action: `clearNotifications(userId)`

3. **Integrate into Dashboard** (0.5 days)
   - [ ] Add notification center to navbar/sidebar
   - [ ] Show: count of unread notifications
   - [ ] Modal/dropdown: click to view all
   - [ ] Real-time updates (when Realtime enabled): new notifications appear

---

#### SPRINT 7: Admin Configuration UI (1-1.5 weeks)

**Tasks:**

1. **Create Department Management UI** (0.5 days)
   - [ ] Create: `/dashboard/admin/content` route
   - [ ] Display: list of departments (name, description, SLA hours, active status)
   - [ ] Add: create new department form
   - [ ] Add: edit department modal
   - [ ] Add: delete department button
   - [ ] Server actions: `createDepartment()`, `updateDepartment()`, `deleteDepartment()`

2. **Create SLA Configuration UI** (0.5 days)
   - [ ] In department management: show SLA hours field
   - [ ] Allow: set default SLA per department
   - [ ] Show: how many requests use this SLA
   - [ ] Validation: SLA must be positive integer

3. **Enhance User Management UI** (0.5 days)
   - [ ] Create: `/dashboard/admin/users` route (improve existing)
   - [ ] Display: all users with role, status, created date
   - [ ] Add: search/filter by name, role, email
   - [ ] Add: change role dropdown
   - [ ] Add: deactivate/activate button
   - [ ] Show: user profile link

4. **Create Manual Assignment UI** (0.5 days)
   - [ ] Create: `/dashboard/admin/assign` route
   - [ ] Display: unassigned requests
   - [ ] Add: assign to lawyer dropdown
   - [ ] Add: assign to firm dropdown
   - [ ] Server actions: `adminAssignRequest(requestId, lawyerId/firmId)`
   - [ ] Validation: admin-only action
   - [ ] Audit log: log all admin assignments

5. **Test & Validation** (0.25 days)
   - [ ] Test admin can manage departments
   - [ ] Test admin can set SLAs
   - [ ] Test admin can manually assign
   - [ ] Test changes reflected in system

---

### PHASE 3: ENHANCED FEATURES (Post-MVP, Backlog)

**Defer to Phase 3 or later:**

- Payment processing (Stripe/Razorpay integration)
- Real-time subscriptions activation
- Advanced analytics & reporting
- Multi-role users support
- Internal firm/bank hierarchies
- Performance optimization
- Lawyer credential verification system

---

## VALIDATION GATES

**After each phase, validate:**

| Gate                     | Criteria                                                              | Owner |
| ------------------------ | --------------------------------------------------------------------- | ----- |
| **Phase 1 Complete**     | All workflows functional, security requirements met, no critical bugs | You   |
| **Phase 2 Complete**     | Notifications working, admin UI usable, pagination consistent         | You   |
| **Ready for MVP Launch** | All Phase 1 + 2 items complete, tested, documented                    | You   |
| **Ready for Phase 3**    | MVP launched, user feedback collected, prioritize Phase 3 features    | You   |

---

## SUMMARY

**Legal Desk Discovery Assessment Complete.**

### Key Findings

| Dimension             | Finding                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| **Current State**     | 35-40% feature-complete; 25-30% production-ready                             |
| **Critical Blockers** | Lawyer assignment, firm distribution, bank workflow, notifications, security |
| **Timeline**          | ~2-3 months to full production readiness (single developer)                  |
| **Tech Stack**        | Strong, modern, stable (Next.js 15 + Supabase + Tailwind)                    |
| **Code Quality**      | High; well-architected; low technical debt                                   |
| **Security**          | RLS solid; input validation needed; file validation needed                   |
| **Architecture**      | Clean; can handle incremental improvements                                   |

### Next Steps

1. ✅ **Discovery Complete** – All 9 sections assessed and confirmed
2. ⏭️ **Review this Document** – Confirm findings align with your understanding
3. ⏭️ **Approve Implementation Roadmap** – Confirm Phase 1, 2, 3 sequence
4. ⏭️ **Begin Phase 1** – Implement lawyer assignment (critical path)

**This document serves as the source of truth for all future development work.**

---

**Assessment Completed:** January 10, 2026  
**Status:** ✅ Ready for Implementation  
**Approvals:** Pending your confirmation
