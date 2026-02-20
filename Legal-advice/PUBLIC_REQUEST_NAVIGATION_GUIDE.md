# Public Request Marketplace - Navigation Integration Guide

## 🗂 Where to Add Navigation Links

### Lawyer Sidebar Navigation

Find the lawyer navigation menu (likely in `app/(dashboard)/lawyer/layout.tsx` or in a shared navigation component).

Add these new links under the appropriate section:

```tsx
{
  /* PUBLIC REQUEST MARKETPLACE - NEW SECTION */
}
<div className="space-y-2">
  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-2">
    Marketplace
  </h3>
  <Link
    href="/lawyer/public-requests"
    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
  >
    <Globe className="size-5" />
    Public Requests
  </Link>
  <Link
    href="/lawyer/my-claims"
    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
  >
    <Briefcase className="size-5" />
    My Claims
  </Link>
</div>;
```

**Icons to import (if not already imported)**:

```tsx
import { Globe, Briefcase } from 'lucide-react';
```

### Alternative: Tabs in Dashboard

If your dashboard uses tabs instead of sidebar, add to the tabs array:

```tsx
const lawyerTabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'assigned', label: 'Assigned Cases', icon: CheckCircle },
  { id: 'public-requests', label: 'Public Requests', icon: Globe }, // NEW
  { id: 'my-claims', label: 'My Claims', icon: Briefcase }, // NEW
  { id: 'messages', label: 'Messages', icon: MessageCircle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  // ... other tabs
];
```

---

## 📄 Adding Interested Lawyers Tab to Client Case View

Find the client case view component (likely `ClientCaseWorkspace.tsx`).

### 1. Import the Component

```tsx
import InterestedLawyersTab from './InterestedLawyersTab';
```

### 2. Add to Tab List

In the tabs/navigation section, add:

```tsx
const clientTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'documents', label: 'Documents' },
  { id: 'messages', label: 'Messages' },
  { id: 'interested-lawyers', label: 'Interested Lawyers' }, // NEW - only show for public cases
  { id: 'rating', label: 'Rating & Review' },
];
```

### 3. Render the Tab

In the tab content rendering section:

```tsx
{
  activeTab === 'interested-lawyers' && request.request_type === 'public' && (
    <InterestedLawyersTab caseId={request.id} publicStatus={request.public_status} />
  );
}
```

### 4. Conditional Tab Display

Only show the tab for public requests:

```tsx
{
  request.request_type === 'public' && (
    <button
      onClick={() => setActiveTab('interested-lawyers')}
      className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
        activeTab === 'interested-lawyers'
          ? 'border-primary text-primary'
          : 'border-transparent text-slate-600 hover:text-slate-900'
      }`}
    >
      Interested Lawyers
    </button>
  );
}
```

---

## 🎨 Styling Consistency

All new components follow the existing design system:

### Color Scheme

- Primary: Blue (#003366)
- Success: Green (for selections)
- Warning: Orange (for high priority)
- Error: Red (for rejections)
- Neutral: Slate palette

### Typography

- Headings: Bold with tracking-tight
- Body: Regular slate-600
- Labels: Uppercase xs with tracking-wider
- Icons: lucide-react from existing imports

### Spacing

- Cards: p-6 with shadow-sm border
- Sections: gap-8
- Internal spacing: gap-4 or gap-2

### Components Used

- All use existing Button styles (px-4 py-2 rounded-lg)
- All use existing Badge styling
- All use existing form inputs
- All consistent with existing cards

No new CSS needed - uses Tailwind classes from existing config

---

## 🔗 URL Routes That Need to Exist

Ensure these route folders exist:

```
app/(dashboard)/lawyer/
├── public-requests/
│   ├── page.tsx              [CREATED]
│   └── [id]/
│       └── page.tsx          [CREATED]
└── my-claims/
    └── page.tsx              [CREATED]

app/(dashboard)/client/track/
└── [id]/
    └── InterestedLawyersTab.tsx  [CREATED]
```

If any folders don't exist, create them:

```bash
mkdir -p app/(dashboard)/lawyer/public-requests/[id]
mkdir -p app/(dashboard)/lawyer/my-claims
# Client folder already exists
```

---

## 📱 Responsive Design Notes

All new components include:

- Mobile-first design
- Proper grid/flex layouts
- Responsive text sizes
- Touch-friendly buttons (min 44px height)
- Horizontal scroll prevention
- Proper spacing on mobile

---

## 🔍 Testing Navigation

After integrating, test:

1. **As a Lawyer**:
   - [ ] Can see "Public Requests" in sidebar
   - [ ] Can see "My Claims" in sidebar
   - [ ] Can click and navigate to both pages
   - [ ] Pages load correctly
   - [ ] Filters/search work

2. **As a Client**:
   - [ ] Can see "Interested Lawyers" tab on public cases
   - [ ] Tab only shows for public cases (not direct cases)
   - [ ] Can see list of interested lawyers
   - [ ] Can select a lawyer
   - [ ] Tab disappears/changes after selection

3. **Mobile**:
   - [ ] Navigation items visible on mobile
   - [ ] Can tap and navigate
   - [ ] Pages load properly on mobile screen size
   - [ ] Forms are usable on mobile

---

## 🚀 Deployment Steps

1. **Database**: Run migration scripts first
2. **Backend**: Deploy `publicRequestActions.ts` and updated `requests.ts`
3. **Components**: Deploy all new React components
4. **Navigation**: Update navigation/layout files
5. **Test**: Verify navigation and functionality
6. **Go Live**: Announce feature to users

---

## 💡 Tips for Successful Integration

1. **Test in Development First**
   - Set up test accounts (lawyer + client)
   - Create test public requests
   - Test full workflow before deploying

2. **Monitor After Deployment**
   - Check error logs for any issues
   - Verify all links work
   - Test on multiple devices

3. **Get User Feedback**
   - Ask early users for feedback
   - Be ready to fix bugs quickly
   - Listen to UX feedback

4. **Keep Documentation Updated**
   - Update help/FAQ with new features
   - Train customer support team
   - Create video tutorials if helpful

---

## ❓ Troubleshooting Navigation

| Issue                       | Solution                                                     |
| --------------------------- | ------------------------------------------------------------ |
| Links not appearing         | Check layout.tsx file path, verify imports                   |
| 404 on navigation click     | Verify route folders exist, check spelling                   |
| Styling looks wrong         | Verify Tailwind config includes new files, clear build cache |
| Tab not showing for clients | Check `request.request_type === 'public'` condition          |
| Component not loading       | Check import paths, verify file exists                       |

---

## 📞 Getting Help

If navigation integration doesn't work:

1. Check file paths match exactly (case-sensitive)
2. Verify all imports are correct
3. Run `npm run build` to catch TypeScript errors
4. Check browser console for JavaScript errors
5. Review the existing navigation structure first
6. Copy formatting from existing navigation items

---

## ✅ Integration Checklist

- [ ] Created route folders
- [ ] Deployed component files
- [ ] Added lawyer navigation items
- [ ] Added client tab
- [ ] Tested as lawyer
- [ ] Tested as client
- [ ] Tested on mobile
- [ ] Verified all links work
- [ ] No console errors
- [ ] Users can discover feature
- [ ] Ready for user training

---

**Last Updated**: February 5, 2026
