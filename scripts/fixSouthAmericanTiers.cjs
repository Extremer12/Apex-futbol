const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'teams', 'southAmericanClubs.ts');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/tier:\s*'(UpperMid|MidTable)'/g, "tier: 'Mid'");
text = text.replace(/tier:\s*'LowerMid'/g, "tier: 'Lower'");

fs.writeFileSync(file, text, 'utf8');
console.log('Fixed tiers in southAmericanClubs.ts successfully.');
