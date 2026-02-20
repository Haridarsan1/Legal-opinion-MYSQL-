import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    original = content
    is_client = "'use client'" in content or '"use client"' in content

    # Fix bad injection INSIDE function parameter list:
    # Pattern: `function Foo(\n  const supabase = createClient(); param1 }: Type) {`
    # or: `function Foo({ const supabase = ... param }: Type) {`
    
    # Remove the bad injection from parameter lists
    client_decl = r'\n  const supabase = createClient\(\); '
    server_decl = r'\n  const supabase = await createClient\(\); '
    
    # Remove it from parameter destructuring contexts (followed by param name and `}`)
    content = re.sub(
        r'(\(\{)' + client_decl + r'(\w)',
        r'\1 \2',
        content
    )
    content = re.sub(
        r'(\(\{)' + server_decl + r'(\w)',
        r'\1 \2',
        content
    )
    
    # Also fix: `function Name({\n  const supabase = createClient();\n  paramName`
    content = re.sub(
        r'(\(\s*\{)\s*\n\s*const supabase = (?:await )?createClient\(\);\s*\n(\s*\w)',
        r'\1\n\2',
        content
    )

    # After removal, ensure supabase is declared inside the function body.
    # If the file uses supabase. but doesn't have `const supabase` now, add after opening brace
    if 'supabase.' in content and 'const supabase' not in content:
        decl = '  const supabase = createClient();\n' if is_client else '  const supabase = await createClient();\n'
        # Add after "} ) {" or "}) {" closing parameter list
        # Find the function body opening brace that follows the parameter list
        content = re.sub(
            r'(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{)',
            r'\1\n' + decl.strip(),
            content,
            count=1
        )
        content = re.sub(
            r'(export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{)',
            r'\1\n' + decl.strip(),
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
