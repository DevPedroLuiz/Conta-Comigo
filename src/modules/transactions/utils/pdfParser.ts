import * as pdfjsLib from 'pdfjs-dist';
import { ParsedTransaction } from './ofxParser';

// Use CDN for the worker to avoid Vite build configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function parsePDF(file: File): Promise<ParsedTransaction[]> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Carregar o PDF usando pdfjs
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  
  // Extrair texto de todas as páginas
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Converter os itens de texto em uma string continua
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return extractTransactionsFromText(fullText);
}

function extractTransactionsFromText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  // Regex básica para encontrar padrões comuns em extratos (Data, Descrição, Valor)
  // Exemplo: 01/05/2024 PGTO DE CONTA -150,00 ou 150,00
  // Exemplo: 01/05 SUPERMERCADO - 1.250,50
  const regex = /(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+(.+?)\s+(-?(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2})/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const dateStr = match[1];
    const description = match[2].trim();
    const amountStr = match[3];
    
    // Processar Data
    let date = new Date();
    const dateParts = dateStr.split('/');
    if (dateParts.length === 2) {
      date = new Date(new Date().getFullYear(), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));
    } else if (dateParts.length === 3) {
      let year = parseInt(dateParts[2], 10);
      if (year < 100) year += 2000;
      date = new Date(year, parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));
    }
    
    // Ignorar datas inválidas
    if (isNaN(date.getTime())) continue;
    
    const isoDate = date.toISOString().substring(0, 10);
    
    // Processar Valor
    const cleanAmountStr = amountStr.replace(/\./g, '').replace(',', '.');
    let amount = parseFloat(cleanAmountStr);
    
    if (isNaN(amount)) continue;
    
    // Determinar se é receita ou despesa
    const isExpense = amount < 0 || 
                     description.toLowerCase().includes('tarifa') || 
                     description.toLowerCase().includes('pagamento') ||
                     description.toLowerCase().includes('compra') ||
                     description.toLowerCase().includes('pix enviado');
                     
    const type = isExpense || amount < 0 ? 'EXPENSE' : 'INCOME';
    amount = Math.abs(amount);
    
    // Filtrar descrições comuns que não são transações reais
    if (description.toLowerCase().includes('saldo')) continue;
    
    transactions.push({
      date: isoDate,
      description,
      amount,
      type,
    });
  }
  
  return transactions;
}
