import re

with open('prisma/schema.prisma', 'r') as f:
    text = f.read()

# Change provider to mysql
text = re.sub(r'provider\s*=\s*"postgresql"', 'provider = "mysql"', text)

# Convert Unsupported things
text = re.sub(r'@default\(dbgenerated\("uuid_generate_v4\(\)"\)\)', '@default(uuid())', text)
text = re.sub(r'@default\(dbgenerated\("gen_random_uuid\(\)"\)\)', '@default(uuid())', text)
text = re.sub(r'@db\.Uuid', '@db.Char(36)', text)
text = re.sub(r'@db\.Timestamptz\(6\)', '', text)
text = re.sub(r'String\[\]\s*@default\(\[\]\)', 'Json? @default("[]")', text)
text = re.sub(r'String\[\]', 'Json?', text)
text = re.sub(r'type: Gin', '', text)
text = re.sub(r',\s*$', '', text, flags=re.MULTILINE) # clean trailing commas in indexes
text = re.sub(r',\s*\)', ')', text)

# Clean up any warnings left by Prisma
lines = text.split('\n')
clean_lines = [l for l in lines if not l.strip().startswith('///This table contains') and not l.strip().startswith('/// This table contains') and not l.strip().startswith('/// This model') and not l.strip().startswith('/// This enum')]
text = '\n'.join(clean_lines)

with open('prisma/schema.prisma', 'w') as f:
    f.write(text)
