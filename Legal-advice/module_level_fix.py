"""
Module-level supabase injection: For files that use supabase in nested functions/callbacks,
add a module-level constant after the last import so all scopes can access it.
"""
import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

SKIP_FILES = ['shim.ts', 'client-shim.ts', 'server.ts', 'client.ts', 'prisma.ts', 
              'auth.ts', 'auth.config.ts', 'middleware.ts', 'test-supabase.ts']

def fix_file(filepath):
    for s in SKIP_FILES:
        if filepath.endswith(s):
            return False
    
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Only process files that use supabase but don't have a module-level declaration
    if 'supabase.' not in content:
        return False

    is_client = "'use client'" in content[:100] or '"use client"' in content[:100]
    
    # Check if there's already a module-level (top-level, not inside function) supabase var
    lines = content.split('\n')
    
    # Find last import line index
    last_import_line = -1
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('import ') or stripped.startswith("'use ") or stripped.startswith('"use '):
            last_import_line = i
    
    if last_import_line == -1:
        return False

    # Check what's on the line right after imports
    # Don't add if already there 
    post_import = '\n'.join(lines[last_import_line+1:last_import_line+5])
    if 'const supabase' in post_import:
        return False
        
    # Also don't add if supabase is declared anywhere at top level (non-indented)
    for i, line in enumerate(lines):
        if line.startswith('const supabase') or line.startswith('let supabase'):
            return False  # already module-level

    # Determine the right declaration
    if is_client:
        # Client component: supabase via browser shim
        decl = '\nconst supabase = createClient();\n'
    else:
        # Server component/action: supabase is async so we can't do module-level await
        # Instead add it at the top of every async function that uses it
        # For server files, skip module-level and inject inside functions only
        # Add inside each top-level async exported function
        def inject_fn(m):
            return m.group(0) + '\n  const supabase = await createClient();'
        
        new_content = re.sub(
            r'(export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*(?::\s*\S+)?\s*\{)',
            inject_fn,
            content
        )
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False

    # For client files: insert the module-level const after last import
    new_lines = lines[:last_import_line+1] + [decl] + lines[last_import_line+1:]
    new_content = '\n'.join(new_lines)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
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

print(f"\nTotal: {changed}")
