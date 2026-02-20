import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # -------------------------------------------------------------------
    # Fix 1: Files that still use `supabase.from(...)` but the variable
    # `supabase` was deleted by the previous cleanup script.
    # If supabase.from appears but `createClient` import is missing, add it.
    # -------------------------------------------------------------------
    has_supabase_usage = 'supabase.' in content or 'supabase\n' in content
    has_createclient_import = 'createClient' in content
    is_client_file = "'use client'" in content or '"use client"' in content

    if has_supabase_usage and not has_createclient_import:
        # Add the appropriate import at the top after 'use server' or 'use client'
        if is_client_file:
            import_line = "import { createClient } from '@/lib/supabase/client';\n"
        else:
            import_line = "import { createClient } from '@/lib/supabase/server';\n"

        # Insert after 'use server'/'use client' directive if present
        content = re.sub(
            r"(^'use (server|client)';\n)",
            r"\1" + import_line,
            content,
            count=1,
            flags=re.MULTILINE
        )
        # If no directive, add at top
        if import_line not in content:
            content = import_line + content

    # -------------------------------------------------------------------
    # Fix 2: Add `const supabase = createClient();` at the beginning of
    # async functions that use `supabase.` but don't declare it
    # -------------------------------------------------------------------
    if 'supabase.' in content and 'const supabase' not in content:
        # Pattern: inside async function body, add supabase declaration
        # Find all async function bodies that contain supabase usage
        def add_supabase_to_fn(match):
            fn_body = match.group(0)
            if 'supabase.' in fn_body and 'const supabase' not in fn_body:
                # Add after the opening brace
                fn_body = fn_body.replace('{\n', '{\n  const supabase = await createClient();\n', 1)
            return fn_body
        
        # Match async function bodies
        content = re.sub(
            r'(async\s+function\s+\w+[^{]*\{)',
            lambda m: m.group(0),
            content
        )
        
        # Simpler approach: if file still has supabase. but no const supabase, 
        # add it after the imports section
        if 'supabase.' in content and 'const supabase' not in content:
            # Add supabase declaration right after the last import line
            lines = content.split('\n')
            last_import_idx = 0
            for i, line in enumerate(lines):
                if line.startswith('import ') or line.startswith("'use ") or line.startswith('"use '):
                    last_import_idx = i
            
            # Don't add at top level for server actions - they need it inside functions
            # Instead, just ensure the import is there (already done above)
            pass

    # -------------------------------------------------------------------
    # Fix 3: Fix `Cannot find name 'auth'` - files that have auth() calls
    # without importing it
    # -------------------------------------------------------------------
    has_auth_usage = 'await auth()' in content or "= await auth()" in content
    has_auth_import = "from '@/auth'" in content or 'from "@/auth"' in content

    if has_auth_usage and not has_auth_import:
        if is_client_file:
            # Client components should use useSession from next-auth/react
            content = re.sub(
                r"(^'use client';\n)",
                r"\1import { useSession } from 'next-auth/react';\n",
                content,
                count=1,
                flags=re.MULTILINE
            )
        else:
            # Server component/action - import auth
            import_auth = "import { auth } from '@/auth';\n"
            if import_auth not in content:
                content = re.sub(
                    r"(^'use server';\n)",
                    r"\1" + import_auth,
                    content,
                    count=1,
                    flags=re.MULTILINE
                )
                if import_auth not in content:
                    content = import_auth + content

    # -------------------------------------------------------------------
    # Fix 4: Remove broken `const { data: {...} } = { data: { user: (await auth())?.user }, error: null };`
    # Replace with simple pattern
    # -------------------------------------------------------------------
    content = re.sub(
        r'const\s*\{[^}]+\}\s*=\s*\{\s*data:\s*\{\s*user:\s*\(await auth\(\)\)\?\.user\s*\},\s*error:\s*null\s*\};\s*\n',
        'const session = await auth();\n  const user = session?.user;\n',
        content
    )

    # -------------------------------------------------------------------
    # Fix 5: Clean up double user declarations when session already set
    # Pattern: `const user = session?.user;\n      const user = userData?.user;`
    # -------------------------------------------------------------------
    content = re.sub(
        r'(const user = session\?\.user;\n)\s*const user = userData\?\.user;\n',
        r'\1',
        content
    )
    content = re.sub(
        r'(const user = _session\?\.user;\n)',
        'const user = _session?.user;\n',
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
        dirs[:] = [x for x in dirs if x not in ('node_modules', '.next', 'generated')]
        for fname in files:
            if fname.endswith(('.ts', '.tsx')):
                fp = os.path.join(root, fname)
                if fix_file(fp):
                    changed += 1
                    print(f"  Fixed: {fp}")

print(f"\nTotal files modified: {changed}")
