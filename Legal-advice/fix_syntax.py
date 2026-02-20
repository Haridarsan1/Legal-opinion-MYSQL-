import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # Pattern 1: destruction assignment left with a comment:
    # const { data: { user }, ... } = // supabase.auth call removed - use NextAuth API
    # Replace the whole destructured block with a clean auth() call
    content = re.sub(
        r'const\s*\{[^}]*\}\s*=\s*//\s*supabase\.auth call removed.*\n',
        'const session = await auth();\n  const user = session?.user;\n',
        content
    )

    # Pattern 2: Same but with different variable names like `error: authError`
    content = re.sub(
        r'const\s*\{[^;{}]+?\}\s*=\s*//\s*supabase\.auth call removed.*\n',
        'const session = await auth();\n  const user = session?.user;\n',
        content
    )

    # Pattern 3: `} = // supabase.auth call removed - use NextAuth API` on its own line
    content = re.sub(
        r'\}\s*=\s*//\s*supabase\.auth call removed[^\n]*\n',
        '} = { data: { user: (await auth())?.user }, error: null };\n',
        content
    )

    # Pattern 4: Remove stray remaining `// supabase.auth call removed` lines  
    # if they're orphaned (i.e. not part of a comment block)
    content = re.sub(
        r'^.*//\s*supabase\.auth call removed[^\n]*\n',
        'const _session = await auth(); const user = _session?.user;\n',
        content,
        flags=re.MULTILINE
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
                    print(f"  Fixed: {fp}")
                    changed += 1

print(f"\nTotal files modified: {changed}")
