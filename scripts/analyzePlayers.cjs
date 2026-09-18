const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'data', 'teams');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'helpers.tsx');

let total = 0;
const allPlayers = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const regex = /{\s*id:\s*(\d+),\s*name:\s*['"]([^'"]+)['"]/g;
  let match;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[1], 10);
    const name = match[2];
    allPlayers.push({ file, id, name });
    count++;
  }
  console.log(`${file}: ${count} players`);
  total += count;
}

console.log(`\nTotal registered players across all files: ${total}`);
