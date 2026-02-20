import os
import re

def migrate_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    orig_content = content

    # 1. Replace server imports
    content = re.sub(
        r"import\s*\{\s*createClient\s*\}\s*from\s*['\"]@/lib/supabase/server['\"];?",
        "import { auth } from '@/auth';\nimport prisma from '@/lib/prisma';",
        content
    )

    # 2. Replace standard getUser initialization
    content = re.sub(
        r"const\s+supabase\s*=\s*await\s+createClient\(\s*\);?\s*const\s*\{\s*data:\s*\{\s*user\s*\}\s*,?\s*\}\s*=\s*await\s+supabase\.auth\.getUser\(\s*\);?",
        "const session = await auth();\n  const user = session?.user;",
        content
    )

    # 3. Replace standalone getUser where supabase was initialized earlier
    content = re.sub(
        r"const\s*\{\s*data:\s*\{\s*user\s*\}\s*,?\s*\}\s*=\s*await\s+supabase\.auth\.getUser\(\s*\);?",
        "const session = await auth();\n  const user = session?.user;",
        content
    )

    # 4. Same for when they alias the user maybe? Let's fix remaining basic createClient() calls
    content = re.sub(
        r"const\s+supabase\s*=\s*await\s+createClient\(\s*\);?",
        "",
        content
    )
    
    # Fix the case where the user relies heavily on `supabase.auth.getUser()`. 
    content = re.sub(
        r"\(await supabase\.auth\.getUser\(\)\)\.data\.user",
        "(await auth())?.user",
        content
    )

    if orig_content != content:
        with open(filepath, 'w') as f:
            f.write(content)

for dir_to_scan in ['app', 'components']:
    for root, _, files in os.walk(dir_to_scan):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                migrate_file(os.path.join(root, file))

print("Auth migration script completed.")
