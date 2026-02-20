import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # Only process files that a) use supabase. and b) DON'T have const supabase declared
    if 'supabase.' not in content:
        return False
    
    is_client_file = "'use client'" in content or '"use client"' in content
    
    # For client files, supabase is initialized at hook level outside async functions
    # For server files, need to add it inside each async function
    
    if is_client_file:
        # Client: add `const supabase = createClient();` right before the first `supabase.` use
        # inside each function, but only if not already declared
        if 'const supabase' not in content and 'createClient' in content:
            # Add at component level (at function body start)
            content = re.sub(
                r'(export\s+(?:default\s+)?function\s+\w+[^{]*\{)',
                r'\1\n  const supabase = createClient();',
                content
            )
    else:
        # Server: Add inside each async function that uses supabase but doesn't have it
        # Find all async function/arrow function blocks
        def inject_supabase(match):
            fn_header = match.group(0)
            return fn_header + '\n  const supabase = await createClient();'
        
        # Match async function declarations 
        content = re.sub(
            r'(export\s+async\s+function\s+\w+\s*\([^)]*\)\s*(?::\s*\S+)?\s*\{)',
            inject_supabase,
            content
        )
        # Match async arrow functions assigned to variables
        content = re.sub(
            r'(=\s*async\s*\([^)]*\)\s*(?::\s*\S+)?\s*=>\s*\{)',
            inject_supabase,
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
