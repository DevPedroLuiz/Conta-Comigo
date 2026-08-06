const fs = require('fs');
const code = fs.readFileSync('src/modules/credit-cards/services/CreditCardsService.ts', 'utf8');
const fixed = code.replace(/if \(a\.year !== b\.year\) if \(a\.year !== b\.year\) return a\.year - b\.year; \/\/ Year ascending/g, 'if (a.year !== b.year) return a.year - b.year;');
fs.writeFileSync('src/modules/credit-cards/services/CreditCardsService.ts', fixed);
