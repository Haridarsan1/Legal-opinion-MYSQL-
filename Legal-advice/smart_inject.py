"""
Smarter supabase injection: Uses AST-like line-by-line analysis to find function 
bodies and inject supabase after the opening brace when supabase. is used inside.
"""
import os
import re

ROOT_DIRS = ['app', 'components', 'lib']

# Files that already have supabase declared (skip them)
SKIP_PATTERNS = [
    'shim.ts', 'client-shim.ts', 'server.ts', 'client.ts', 
    'prisma.ts', 'auth.ts', 'auth.config.ts', 'middleware.ts'
]

def should_skip(filepath):
    for p in SKIP_PATTERNS:
        if filepath.endswith(p):
            return True
    return False

def inject_supabase_in_functions(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    is_client = any("'use client'" in l or '"use client"' in l for l in lines[:3])
    decl = '  const supabase = createClient();\n' if is_client else '  const supabase = await createClient();\n'

    # Check if file uses supabase at all
    content = ''.join(lines)
    if 'supabase.' not in content:
        return False
    if 'const supabase' in content:
        # Already declared somewhere, check if enough declarations
        decl_count = content.count('const supabase')
        usage_funcs = len(re.findall(r'(export\s+(?:async\s+)?function|export\s+default\s+function|=\s*async\s*\()', content))
        # if there are roughly as many declarations as async functions, skip
        if decl_count >= max(1, usage_funcs // 2):
            return False

    # Parse line by line to find function opening braces and inject
    new_lines = []
    i = 0
    brace_depth = 0
    in_function = False
    injected_at_depths = set()

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Detect function start patterns
        is_fn_start = bool(re.match(
            r'(export\s+)?(default\s+)?(async\s+)?function\s+\w|'
            r'=\s*async\s*\(',
            stripped
        ))

        # Count braces
        opens = line.count('{')
        closes = line.count('}')
        
        new_lines.append(line)

        if opens > closes:
            brace_depth += opens - closes
            # If this line opens a function body (has { at end or within it)
            # and we haven't injected at this depth yet
            if '{' in line and brace_depth not in injected_at_depths:
                # Check if the upcoming function body contains supabase usage
                # Look ahead up to 200 lines
                future_block = ''.join(lines[i+1:min(i+200, len(lines))])
                if 'supabase.' in future_block.split('\n')[0:100] or \
                   any('supabase.' in fl for fl in future_block.split('\n')[:100]):
                    new_lines.append(decl)
                    injected_at_depths.add(brace_depth)
        elif closes > opens:
            brace_depth -= closes - opens
            if brace_depth < 0:
                brace_depth = 0

        i += 1

    new_content = ''.join(new_lines)
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
                if should_skip(fp):
                    continue
                if inject_supabase_in_functions(fp):
                    changed += 1
                    print(f"  Fixed: {fp}")

print(f"\nTotal files modified: {changed}")
