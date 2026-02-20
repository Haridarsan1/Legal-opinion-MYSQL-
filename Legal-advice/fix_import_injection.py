"""
Final fix: Remove supabase declarations that were incorrectly placed 
inside import braces {} or metadata objects.
"""
import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # Remove bad injections inside import { ... } blocks
    content = re.sub(
        r'(import\s+\{[^}]*?)\n\s*const supabase = (?:await )?createClient\(\);\s*\n',
        r'\1\n',
        content
    )

    # Remove bad injections inside export const metadata = { ... } blocks
    content = re.sub(
        r'((?:export\s+const\s+\w+\s*(?::\s*\w+)?\s*=\s*\{[^}]*?))\n\s*const supabase = (?:await )?createClient\(\);\s*\n',
        r'\1\n',
        content
    )

    # Remove if inside type annotations (Promise<{ or just { context)
    # Pattern: Promise<{\n  const supabase = createClient();\n
    content = re.sub(
        r'(Promise\s*<\s*\{[^>]*?)\n\s*const supabase = (?:await )?createClient\(\);\s*\n',
        r'\1\n',
        content
    )

    # Ensure supabase is still declared somewhere in function bodies
    is_client = "'use client'" in content or '"use client"' in content
    decl = '  const supabase = createClient();\n' if is_client else '  const supabase = await createClient();\n'

    if 'supabase.' in content and 'const supabase' not in content:
        # Add at first async function / default export function body
        content = re.sub(
            r'(export\s+default\s+(?:async\s+)?function\s+\w+[^{]*\{(?:\s*\n)?)',
            r'\1' + decl,
            content,
            count=1
        )
        if 'const supabase' not in content:
            content = re.sub(
                r'(export\s+(?:async\s+)?function\s+\w+[^{]*\{(?:\s*\n)?)',
                r'\1' + decl,
                content,
                count=1
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

print(f"\nTotal: {changed}")
