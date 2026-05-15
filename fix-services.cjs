const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import axios from 'axios'; if not present
    if (!content.includes("import axios from 'axios';")) {
        content = "import axios from 'axios';\n" + content;
    }

    // Replace the catch blocks
    const catchRegex = /catch\s*\(\s*error\s*:\s*any\s*\)\s*\{\s*if\s*\(\s*error\.response\s*\)\s*\{\s*throw\s*new\s*Error\(\s*error\.response\.data\.detail\s*\|\|\s*error\.response\.data\.message\s*\|\|\s*'([^']+)'\s*\);\s*\}\s*else\s*if\s*\(\s*error\.request\s*\)\s*\{\s*throw\s*new\s*Error\([^)]+\);\s*\}\s*else\s*\{\s*throw\s*new\s*Error\([^)]+\);\s*\}\s*\}/g;

    content = content.replace(catchRegex, (match, defaultMsg) => {
        return `catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.response?.data?.message || '${defaultMsg}');
      }
      throw error;
    }`;
    });

    fs.writeFileSync(filePath, content);
}

const servicesDir = 'd:/Repos2025/front-transcriptor/src/services';
const subdirs = ['room', 'session', 'user'];
for (const subdir of subdirs) {
    const dirPath = path.join(servicesDir, subdir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        if (file.endsWith('.ts')) {
            processFile(path.join(dirPath, file));
        }
    }
}
