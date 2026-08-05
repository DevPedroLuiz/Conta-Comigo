import Papa from 'papaparse';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  fitId?: string;
}

export function parseOFX(ofxContent: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  // Extract all STMTTRN blocks
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  
  while ((match = stmtTrnRegex.exec(ofxContent)) !== null) {
    const block = match[1];
    
    // Helper to extract value with or without closing tag
    const extractTag = (tag: string) => {
      const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
      const res = block.match(regex);
      return res ? res[1].trim() : '';
    };

    const trnType = extractTag('TRNTYPE');
    const dtPosted = extractTag('DTPOSTED');
    const trnAmt = extractTag('TRNAMT');
    const fitId = extractTag('FITID');
    const memo = extractTag('MEMO');
    
    if (dtPosted && trnAmt) {
      // Parse date: YYYYMMDDHHMMSS or YYYYMMDD
      const year = dtPosted.substring(0, 4);
      const month = dtPosted.substring(4, 6);
      const day = dtPosted.substring(6, 8);
      const date = `${year}-${month}-${day}`;
      
      const amountValue = parseFloat(trnAmt.replace(',', '.'));
      const isExpense = amountValue < 0;
      
      transactions.push({
        date,
        description: memo || 'Transação Importada',
        amount: Math.abs(amountValue),
        type: isExpense ? 'EXPENSE' : 'INCOME',
        fitId: fitId || undefined
      });
    }
  }

  return transactions;
}

export function parseCSV(csvContent: string): Promise<ParsedTransaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const transactions: ParsedTransaction[] = [];
        for (const row of results.data as any[]) {
          // Attempt to find standard columns for date, description, amount
          const dateStr = row.Data || row.Date || row.date || row.data || '';
          const descStr = row.Descricao || row.Description || row.description || row.historico || row.Historico || '';
          const amountStr = row.Valor || row.Amount || row.amount || row.valor || '0';

          if (!dateStr || !amountStr) continue;

          // Parse date: assume DD/MM/YYYY or YYYY-MM-DD
          let parsedDate = '';
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 4) {
                // DD/MM/YYYY
                parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              } else {
                // YYYY/MM/DD
                parsedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              }
            }
          } else {
            parsedDate = dateStr; // Fallback
          }

          // Parse amount
          const cleanedAmount = amountStr.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
          const amountValue = parseFloat(cleanedAmount);
          if (isNaN(amountValue)) continue;

          const isExpense = amountValue < 0;

          transactions.push({
            date: parsedDate,
            description: descStr || 'Transação Importada (CSV)',
            amount: Math.abs(amountValue),
            type: isExpense ? 'EXPENSE' : 'INCOME',
          });
        }
        resolve(transactions);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

