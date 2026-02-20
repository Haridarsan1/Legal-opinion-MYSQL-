"""
Final targeted fix: Remove supabase declarations from inside object literals 
(useState, interface bodies, etc.)
"""
import os
import re

PROBLEM_FILES = [
    'app/(dashboard)/bank/profile/BankProfileContent.tsx',
    'app/(dashboard)/case/[id]/CaseClarifications.tsx',
    'app/(dashboard)/client/track/[id]/ClientCaseWorkspace.tsx',
    'components/lawyer/OpinionEditor.tsx',
]

DECL_PATTERN = re.compile(r'\s*const supabase = (?:await )?createClient\(\);\s*\n')

def fix_object_injections(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        lines = f.readlines()

    new_lines = []
    in_object_literal = 0  # track depth of object literals
    i = 0
    changed = False

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Detect if we're inside an object literal (useState({, interface {, type {, etc.)
        # by counting unmatched { that are NOT function bodies
        is_supabase_decl = 'const supabase = ' in line and 'createClient()' in line

        if is_supabase_decl and i > 0:
            # Look at the previous non-empty line to determine context
            prev_idx = i - 1
            while prev_idx >= 0 and not new_lines[prev_idx].strip():
                prev_idx -= 1
            
            prev_line = new_lines[prev_idx].strip() if prev_idx >= 0 and prev_idx < len(new_lines) else ''
            
            # If previous line ends with ({  or doesn't end with {,  
            # or starts with type/interface - this declaration is misplaced
            bad_contexts = [
                prev_line.endswith('({'),
                prev_line.endswith(',') and not prev_line.startswith('//'),
                stripped.endswith(';') and (
                    # check what follows: if the next line has property: value pattern
                    i + 1 < len(lines) and ':' in lines[i+1] and not lines[i+1].strip().startswith('//')
                ),
            ]
            
            if any(bad_contexts):
                # Skip this bad injection line
                changed = True
                i += 1
                continue

        new_lines.append(line)
        i += 1

    if changed:
        content = ''.join(new_lines)
        
        # Also handle: supabase still needed? If yes, add at function body start
        is_client = "'use client'" in content or '"use client"' in content
        decl = '  const supabase = createClient();\n' if is_client else '  const supabase = await createClient();\n'
        
        if 'supabase.' in content and 'const supabase' not in content:
            # Add after opening brace of the main exported function
            content = re.sub(
                r'(export\s+default\s+function\s+\w+[^{]*\{)',
                r'\1\n' + decl.strip(),
                content,
                count=1
            )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

changed = 0
for fp in PROBLEM_FILES:
    if fix_object_injections(fp):
        changed += 1
        print(f"  Fixed: {fp}")

print(f"\nTotal: {changed}")
