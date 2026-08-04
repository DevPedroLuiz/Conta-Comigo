const fs = require('fs');
let code = fs.readFileSync('src/modules/transactions/repositories/TransactionRepository.ts', 'utf8');

// The update is a bit complex, let's just rewrite the file
