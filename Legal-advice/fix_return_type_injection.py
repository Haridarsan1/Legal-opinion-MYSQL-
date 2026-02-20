import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # Pattern: `const supabase = await createClient(); success: boolean; ...}>` 
    # inside return type annotations. Remove the bad injection.
    content = re.sub(
        r'\n\s*const supabase = (?:await )?createClient\(\); (?=[a-z])',
        '\n',
        content
    )

    # Pattern 2: `Promise<{\n  const supabase = await createClient(); success:...`
    content = re.sub(
        r'(Promise\s*<\s*\{)\s*\n\s*const supabase = (?:await )?createClient\(\);?\s*\n',
        r'\1\n',
        content
    )

    # Pattern 3: After fixing, make sure the function body HAS the declaration
    # Check if there are function bodies using supabase but no declaration
    is_client = "'use client'" in content or '"use client"' in content
    decl = 'const supabase = createClient();' if is_client else 'const supabase = await createClient();'

    if 'supabase.' in content and decl not in content:
        # Add after the try { block in async functions
        content = re.sub(
            r'(\)\s*\{)\s*\n(\s*try\s*\{)',
            r'\1\n  ' + decl + r'\n\2',
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

print(f"\nTotal files modified: {changed}")
