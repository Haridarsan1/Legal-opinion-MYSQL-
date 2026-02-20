# PowerShell script to fix unescaped entities in JSX files

$files = @(
    'app/(auth)/forgot-password/ForgotPasswordForm.tsx:55',
    'app/(dashboard)/bank/integration/page.tsx:155',
    'app/(dashboard)/bank/upload/page.tsx:200',
    'app/(dashboard)/case/[id]/CaseClarifications.tsx:375',
    'app/(dashboard)/case/[id]/CaseWorkspace.tsx:626',
    'app/(dashboard)/case/[id]/components/DocumentChecklistWidget.tsx:268',
    'app/(dashboard)/case/[id]/page.tsx:64',
    'app/(dashboard)/client/ClientDashboardContent.tsx:510',
    'app/(dashboard)/client/lawyers/[id]/components/SendMessageModal.tsx:180',
    'app/(dashboard)/client/messages/ClientMessagesContent.tsx:75',
    'app/(dashboard)/client/notifications/page.tsx:40',
    'app/(dashboard)/client/opinion/[id]/components/AcceptOpinionAction.tsx:108,194,205',
    'app/(dashboard)/client/ratings/RatingsContent.tsx:203,517',
    'app/(dashboard)/firm/submit-opinion/page.tsx:132',
    'app/(dashboard)/lawyer/analytics/LawyerAnalyticsContent.tsx:752',
    'app/(dashboard)/lawyer/clarification/page.tsx:97,169',
    'app/(dashboard)/lawyer/messages/LawyerMessagesContent.tsx:74',
    'app/(dashboard)/lawyer/notifications/NotificationsContent.tsx:196',
    'app/(dashboard)/lawyer/opinions/components/OpinionPreview.tsx:132',
    'app/(dashboard)/lawyer/opinions/reviews/page.tsx:36',
    'app/(dashboard)/lawyer/requests/page.tsx:67',
    'app/(dashboard)/lawyer/requests/[id]/page.tsx:78',
    'app/auth/login/page.tsx:263',
    'app/auth/signup/bank/page.tsx:167',
    'app/auth/signup/firm/page.tsx:164',
    'app/auth/signup/lawyer/page.tsx:138',
    'components/client/ClientOpinionView.tsx:208,360',
    'components/client/DocumentManager.tsx:175',
    'components/layout/Navbar.tsx:15',
    'components/shared/SecondOpinionShare.tsx:93,215'
)

foreach ($entry in $files) {
    $parts = $entry -split ':'
    $filePath = $parts[0]
    Write-Host "Processing: $filePath"
    
   # Replace unescaped apostrophes in JSX content (between > and <)
    $content = Get-Content $filePath -Raw
    # This won't be perfect but will catch most common cases
    $content = $content -replace "(\>)([^<]*)'([^<]*)((\<))", '$1$2&apos;$3$4'
    $content = $content -replace '(\>)([^<]*)"([^<]*)((\<))', '$1$2&quot;$3$4'
    Set-Content -Path $filePath -Value $content -NoNewline
}

Write-Host "Fixed unescaped entities in JSX files"
