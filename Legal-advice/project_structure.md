# 📁 stitch_legal_opinion_portal_homepage - Project Structure

_Generated on: 1/10/2026, 12:48:13 PM_

## 📋 Quick Overview

| Metric           | Value                                    |
| ---------------- | ---------------------------------------- |
| 📄 Total Files   | 218                                      |
| 📁 Total Folders | 113                                      |
| 🌳 Max Depth     | 5 levels                                 |
| 🛠️ Tech Stack    | React, Next.js, TypeScript, CSS, Node.js |

## ⭐ Important Files

- 🟡 🚫 **.gitignore** - Git ignore rules
- 🟡 ▲ **next.config.js** - Next.js config
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🔴 📖 **README.md** - Project documentation
- 🔴 📖 **README.md** - Project documentation
- 🟡 🔷 **tsconfig.json** - TypeScript config

## 📊 File Statistics

### By File Type

- ⚛️ **.tsx** (React TypeScript files): 82 files (37.6%)
- 🌐 **.html** (HTML files): 46 files (21.1%)
- 🖼️ **.png** (PNG images): 45 files (20.6%)
- 🔷 **.ts** (TypeScript files): 15 files (6.9%)
- 📄 **.** (Other files): 8 files (3.7%)
- 📄 **.sql** (Other files): 8 files (3.7%)
- 📖 **.md** (Markdown files): 5 files (2.3%)
- ⚙️ **.json** (JSON files): 3 files (1.4%)
- 📜 **.js** (JavaScript files): 2 files (0.9%)
- 📄 **.example** (Other files): 1 files (0.5%)
- 🚫 **.gitignore** (Git ignore): 1 files (0.5%)
- 🎨 **.css** (Stylesheets): 1 files (0.5%)
- ⚙️ **.toml** (TOML files): 1 files (0.5%)

### By Category

- **React**: 82 files (37.6%)
- **Web**: 46 files (21.1%)
- **Assets**: 45 files (20.6%)
- **Other**: 17 files (7.8%)
- **TypeScript**: 15 files (6.9%)
- **Docs**: 5 files (2.3%)
- **Config**: 4 files (1.8%)
- **JavaScript**: 2 files (0.9%)
- **DevOps**: 1 files (0.5%)
- **Styles**: 1 files (0.5%)

### 📁 Largest Directories

- **root**: 218 files
- **app**: 73 files
- **app\(dashboard)**: 51 files
- **supabase**: 18 files
- **app\(dashboard)\client**: 17 files

## 🌳 Directory Structure

```
stitch_legal_opinion_portal_homepage/
├── 📄 .env.local.example
├── 🟡 🚫 **.gitignore**
├── 🚀 app/
│   ├── 📂 (auth)/
│   │   ├── 📂 forgot-password/
│   │   │   ├── ⚛️ ForgotPasswordForm.tsx
│   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 login/
│   │   │   ├── ⚛️ LoginForm.tsx
│   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 reset-password/
│   │   │   ├── ⚛️ page.tsx
│   │   │   └── ⚛️ ResetPasswordForm.tsx
│   │   ├── 📂 select-role/
│   │   │   ├── ⚛️ page.tsx
│   │   │   └── ⚛️ RoleSelectionForm.tsx
│   │   └── 📂 signup/
│   │   │   ├── ⚛️ page.tsx
│   │   │   └── ⚛️ SignupForm.tsx
│   ├── 📂 (dashboard)/
│   │   ├── 📂 admin/
│   │   │   ├── 📂 analytics/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 content/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 disputes/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ page.tsx
│   │   │   ├── 📂 security-logs/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   └── 📂 users/
│   │   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 bank/
│   │   │   ├── 📂 assign/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 audit-logs/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 integration/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ page.tsx
│   │   │   ├── 📂 ratings/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 sla/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 track/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   └── 📂 upload/
│   │   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 client/
│   │   │   ├── 📂 audit/
│   │   │   │   ├── ⚛️ AuditLogsContent.tsx
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 audit-logs/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ ClientDashboardContent.tsx
│   │   │   ├── 📂 departments/
│   │   │   │   ├── ⚛️ DepartmentsListContent.tsx
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 lawyers/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 new-request/
│   │   │   │   ├── 📂 dept-select/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── 📂 details-upload/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── ⚛️ NewRequestForm.tsx
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ page.tsx
│   │   │   ├── 📂 profile/
│   │   │   │   ├── ⚛️ page.tsx
│   │   │   │   └── ⚛️ ProfileContent.tsx
│   │   │   ├── 📂 ratings/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   └── 📂 track/
│   │   │   │   ├── ⚛️ page.tsx
│   │   │   │   └── ⚛️ TrackStatusContent.tsx
│   │   ├── 📂 firm/
│   │   │   ├── 📂 analytics/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 assign/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 audit-logs/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 oversight/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ page.tsx
│   │   │   ├── 📂 review/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 submit-opinion/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 team/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   └── 📂 versioning/
│   │   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 lawyer/
│   │   │   ├── 📂 analytics/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 assigned/
│   │   │   │   ├── ⚛️ AssignedRequestsContent.tsx
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 clarification/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ LawyerDashboardContent.tsx
│   │   │   ├── 📂 notifications/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── ⚛️ page.tsx
│   │   │   ├── 📂 profile/
│   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 review/
│   │   │   │   └── 📂 [id]/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   └── 📂 submit-opinion/
│   │   │   │   └── ⚛️ page.tsx
│   │   └── ⚛️ layout.tsx
│   ├── 📂 actions/
│   │   ├── 🔷 lawyer.ts
│   │   ├── 🔷 profile.ts
│   │   ├── 🔷 ratings.ts
│   │   └── 🔷 requests.ts
│   ├── 📂 auth/
│   │   ├── 📂 callback/
│   │   │   └── 🔷 route.ts
│   │   ├── 📂 forgot-password/
│   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 login/
│   │   │   └── ⚛️ page.tsx
│   │   ├── 📂 reset-password/
│   │   │   └── ⚛️ page.tsx
│   │   └── 📂 signup/
│   │   │   └── ⚛️ page.tsx
│   ├── 🎨 globals.css
│   ├── ⚛️ layout.tsx
│   └── ⚛️ page.tsx
├── 📂 bank_dashboard_-_assign_to_law_firm/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 bank_dashboard_-_audit_logs/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 bank_dashboard_-_integration_settings/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 bank_dashboard_-_ratings/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 bank_dashboard_-_select_sla/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 bank_dashboard_-_track_status/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 bank_dashboard_-_upload_property_files/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 bank_signup_page/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_audit_logs/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_lawyers_list/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_legal_departments/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_new_request_(dept_select)/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_new_request_(details_&_upload)/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_profile_1/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_profile_2/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_ratings/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_-_track_status/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_dashboard_home/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 client_signup_page/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 🧩 components/
│   ├── 📂 layout/
│   │   ├── ⚛️ Navbar.tsx
│   │   └── ⚛️ Sidebar.tsx
│   ├── 📂 providers/
│   │   └── ⚛️ ToastProvider.tsx
│   └── 📂 shared/
│   │   ├── ⚛️ BackButton.tsx
│   │   ├── ⚛️ Card.tsx
│   │   ├── ⚛️ DataTable.tsx
│   │   ├── ⚛️ EmptyState.tsx
│   │   ├── ⚛️ FileUpload.tsx
│   │   ├── ⚛️ FileUploader.tsx
│   │   ├── ⚛️ LoadingSpinner.tsx
│   │   ├── ⚛️ Modal.tsx
│   │   ├── ⚛️ RatingStars.tsx
│   │   ├── ⚛️ RequestCard.tsx
│   │   ├── ⚛️ StatCard.tsx
│   │   └── ⚛️ StatusBadge.tsx
├── 📖 DEPLOYMENT.md
├── 📂 firm_dashboard_-_analytics/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 firm_dashboard_-_assign_cases/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 firm_dashboard_-_audit_logs/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 firm_dashboard_-_case_oversight/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 firm_dashboard_-_document_versioning/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 firm_dashboard_-_senior_review/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 firm_dashboard_-_submit_firm-stamped_opinion/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 firm_dashboard_-_team_management/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 forgot_password_screen/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 🌐 homepage_backup.html
├── 📂 lawyer_dashboard_-_ask_clarification/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 lawyer_dashboard_-_assigned_requests/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 lawyer_dashboard_-_notifications/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 lawyer_dashboard_-_performance_analytics/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 lawyer_dashboard_-_profile/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 lawyer_dashboard_-_review_case/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 lawyer_dashboard_-_submit_opinion/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 lawyer_signup_page/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 legal_opinion_portal_homepage/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📚 lib/
│   ├── 🎣 hooks/
│   │   └── 🔷 useRealtime.ts
│   ├── 🔷 icon-mapping.ts
│   ├── 📂 supabase/
│   │   ├── 🔷 client.ts
│   │   └── 🔷 server.ts
│   ├── 🔷 test-supabase.ts
│   ├── 🔷 types.ts
│   └── 🔷 utils.ts
├── 🔷 middleware.ts
├── 🔷 next-env.d.ts
├── 🟡 ▲ **next.config.js**
├── 🟡 🔒 **package-lock.json**
├── 🔴 📦 **package.json**
├── 📂 platform_admin_-_content_management/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 platform_admin_-_dispute_resolution/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 platform_admin_-_security_logs/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 platform_admin_-_system_analytics/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 platform_admin_-_user_management/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📜 postcss.config.js
├── 🔴 📖 **README.md**
├── 📂 reset_password_screen/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📂 role_selection_gateway/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
├── 📖 SEED_SETUP.md
├── 📂 supabase/
│   ├── 📂 .temp/
│   │   ├── 📄 cli-latest
│   │   ├── 📄 gotrue-version
│   │   ├── 📄 pooler-url
│   │   ├── 📄 postgres-version
│   │   ├── 📄 project-ref
│   │   ├── 📄 rest-version
│   │   ├── 📄 storage-migration
│   │   └── 📄 storage-version
│   ├── 📄 01_schema.sql
│   ├── 📄 02_rls_policies.sql
│   ├── 📄 03_auth_trigger.sql
│   ├── 📄 04_storage_setup.sql
│   ├── 📄 05_realtime_setup.sql
│   ├── ⚙️ config.toml
│   ├── 📂 migrations/
│   │   ├── 📄 20260109_initial_schema.sql
│   │   └── 📄 20260109050001_schema.sql
│   ├── 🔴 📖 **README.md**
│   └── 📄 seed.sql
├── 🔷 tailwind.config.ts
├── 📖 TEST_USERS.md
├── 🟡 🔷 **tsconfig.json**
└── 📂 unified_login_page/
│   ├── 🌐 code.html
│   └── 🖼️ screen.png
```

## 📖 Legend

### File Types

- 📄 Other: Other files
- 🚫 DevOps: Git ignore
- ⚛️ React: React TypeScript files
- 🔷 TypeScript: TypeScript files
- 🎨 Styles: Stylesheets
- 🌐 Web: HTML files
- 🖼️ Assets: PNG images
- 📖 Docs: Markdown files
- 📜 JavaScript: JavaScript files
- ⚙️ Config: JSON files
- ⚙️ Config: TOML files

### Importance Levels

- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential files
