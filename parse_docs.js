const fs = require('fs');
const path = require('path');
const docsDir = path.join(__dirname, 'docs');
const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  console.log(`\n=== ${file} ===`);
  const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
  console.log(content);
}
