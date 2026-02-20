"""
DEFINITIVE cleanup: 
1. Remove ALL injected `const supabase = createClient()` / `const supabase = await createClient()` 
   from every file (both correct and incorrect placements)
2. Then add exactly ONE correct declaration per function that needs it
"""
import os
import re

ROOT_DIRS = ['app', 'components', 'lib']
SKIP_FILES = ['shim.ts', 'client-shim.ts', 'server.ts', 'client.ts', 'prisma.ts',
              'auth.ts', 'auth.config.ts', 'middleware.ts', 'test-supabase.ts',
              'supabase-proxy']

def should_skip(fp):
    for s in SKIP_FILES:
        if s in fp:
            return True
    return False


def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    original = content

    if 'supabase.' not in content and 'const supabase' not in content:
        return False

    is_client = content[:100].find("'use client'") != -1 or content[:100].find('"use client"') != -1
    decl_re = re.compile(r'\n?\s*const supabase = (?:await )?createClient\(\);\s*')

    # Step 1: Remove ALL existing supabase declarations
    content = decl_re.sub('', content)

    # Step 2: Re-add ONE correct declaration per exported function that uses supabase
    if 'supabase.' not in content:
        # No more usage after stripping → just write clean content
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    if is_client:
        # Client: find where last import ends, add module-level const (shared by all hooks)
        lines = content.split('\n')
        last_import = 0
        for i, l in enumerate(lines):
            s = l.strip()
            if s.startswith('import ') or s.startswith("'use ") or s.startswith('"use '):
                last_import = i
        # Insert after last import
        lines.insert(last_import + 1, '\nconst supabase = createClient();')
        content = '\n'.join(lines)
    else:
        # Server: inject inside each exported async function body (after the opening {)
        def inject_in_fn(m):
            return m.group(0) + '\n  const supabase = await createClient();'

        prev = None
        while prev != content:
            prev = content
            content = re.sub(
                r'(export\s+async\s+function\s+\w+[^{]*\{)(?!\s*\n\s*const supabase)',
                inject_in_fn,
                content,
                count=0
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
                if should_skip(fp):
                    continue
                if fix_file(fp):
                    changed += 1

print(f"Fixed {changed} files")
