const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app');

function findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findFiles(filePath, fileList);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const files = findFiles(directoryPath);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('await supabase')) {
        // We will do some basic replacements for common patterns

        // 1. .from('X').select('*').eq('Y', Z).single()
        // -> await prisma.x.findFirst({ where: { Y: Z } })
        content = content.replace(
            /const\s+\{\s*data\s*:\s*([^,]+)(?:,\s*error\s*:\s*([^}]+))?\s*\}\s*=\s*await\s*supabase\s*\.from\(['"]([^'"]+)['"]\)\s*\.select\(['"]\*['"]\)\s*\.eq\(['"]([^'"]+)['"],\s*([^)]+)\)\s*\.single\(\);/g,
            (match, dataVar, errVar, table, col, val) => {
                let res = `let ${dataVar} = null;\n`;
                if (errVar) res += `let ${errVar} = null;\n`;
                res += `try {\n  ${dataVar} = await prisma.${table}.findFirst({ where: { ${col}: ${val} } });\n} catch (e: any) {\n`;
                if (errVar) res += `  ${errVar} = e;\n`;
                else res += `  console.error(e);\n`;
                res += `}`;
                return res;
            }
        );

        // 2. .from('X').select('A, B').eq('Y', Z).single()
        // similar to above

        // This is just a test stub. It's extremely hard to accurately regex this.
        // Instead of regex, maybe we can inject Prisma imports where needed.
    }
}
