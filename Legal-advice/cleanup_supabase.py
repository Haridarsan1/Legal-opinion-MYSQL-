import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # 1. Remove @supabase/supabase-js imports entirely
    content = re.sub(r"import\s+.*?from\s+['\"]@supabase/supabase-js['\"];?\n?", "", content)

    # 2. Remove @supabase/ssr imports entirely
    content = re.sub(r"import\s+.*?from\s+['\"]@supabase/ssr['\"];?\n?", "", content)

    # 3. Fix: components that still use supabase .channel (realtime) - remove those blocks
    content = re.sub(r"channel\s*=\s*supabase\s*\.\s*channel\([^)]+\)[\s\S]*?\.subscribe\(\);?", "", content)
    content = re.sub(r"supabase\.removeChannel\([^)]+\);?", "", content)

    # 4. Fix auth/signup files that still call supabase.auth.signUp, signIn, etc.
    # These will be replaced by fetch('/api/auth/signup') patterns
    # Check for supabase.auth.signUp calls
    content = re.sub(
        r"const\s*\{[^}]*\}\s*=\s*await\s+supabase\.auth\.signUp\(([^)]+)\);?",
        r"""const signUpRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(\1)
      });
      const signUpData = await signUpRes.json();
      const { error } = signUpData;""",
        content
    )

    # 5. Remove any remaining bare references to `supabase.auth.signIn` etc.
    # These are stale calls not yet cleaned by the auth migration script
    content = re.sub(
        r"const\s*\{\s*(?:data\s*,\s*)?error\s*\}\s*=\s*await\s+supabase\.auth\.signInWithPassword\([^)]+\);?",
        """const { error } = { error: 'Use NextAuth signIn() instead' }; // TODO: migrate to signIn from next-auth/react""",
        content
    )

    # 6. Fix files that use `supabase.auth.signOut()` (should be using NextAuth signOut)  
    content = re.sub(
        r"await\s+supabase\.auth\.signOut\(\);?",
        "// supabase.auth.signOut migrated to NextAuth signOut()",
        content
    )

    # 7. Fix files that use `supabase.auth.resetPasswordForEmail` / other auth methods
    content = re.sub(
        r"await\s+supabase\.auth\.[a-zA-Z]+\([^)]*\);?",
        "// supabase.auth call removed - use NextAuth API",
        content
    )

    # 8. Fix remaining `supabase.auth.getUser()` patterns (already handled mostly, but just in case)
    content = re.sub(
        r"const\s*\{\s*data:\s*\{\s*user\s*\}\s*,?\s*\}\s*=\s*await\s+supabase\.auth\.getUser\(\);?",
        "const session = await auth();\n  const user = session?.user;",
        content
    )
    content = re.sub(
        r"\(await supabase\.auth\.getUser\(\)\)\.data\.user",
        "(await auth())?.user",
        content
    )

    # 9. Fix auth callback route (Supabase OAuth callback is no longer used)
    # Remove the entire callback file content if it's just handling Supabase auth
    if 'callback/route.ts' in filepath and '@supabase' in content:
        content = """import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Supabase Auth callback removed. Authentication now handled by NextAuth.
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
"""

    # 10. Remove createClient calls that are only used for auth (not data fetching)
    content = re.sub(
        r"const\s+supabase\s*=\s*(?:await\s+)?createClient\(\);\s*\n(?!\s*(?:const|let|await)\s+(?:\{|supabase\.))",
        "",
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

changed = 0
for d in ROOT_DIRS:
    for root, dirs, files in os.walk(d):
        # Skip node_modules and .next
        dirs[:] = [x for x in dirs if x not in ('node_modules', '.next', 'generated')]
        for fname in files:
            if fname.endswith(('.ts', '.tsx')):
                fp = os.path.join(root, fname)
                if fix_file(fp):
                    print(f"  Fixed: {fp}")
                    changed += 1

print(f"\nTotal files modified: {changed}")
