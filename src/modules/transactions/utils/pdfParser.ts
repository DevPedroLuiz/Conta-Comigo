import * as pdfjsLib from 'pdfjs-dist';
import { ParsedTransaction } from './ofxParser';

if (typeof window !== 'undefined') {
  // Configurar o worker via CDN oficial (unpkg) para evitar problemas de CORS
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export async function parsePDF(file: File): Promise<ParsedTransaction[]> {
  try {
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
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }

    return extractTransactionsFromText(fullText);
  } catch (error) {
    console.error('Erro ao ler PDF:', error);
    if (error instanceof Error && error.message.includes('Worker')) {
      throw new Error('Falha ao carregar o Worker do PDF.js. Tente novamente mais tarde ou use OFX/CSV/PDF.');
    }
    throw new Error('O arquivo PDF parece ser inválido ou uma imagem escaneada. Certifique-se de que contém texto selecionável.');
  }
}

function extractTransactionsFromText(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  const cleanText = text.replace(/\r?\n|\r/g, ' ');

  // Regex robusta para encontrar padrões comuns em extratos (Data, Descrição, Valor)
  // Exemplo: 01/05/2024 PGTO DE CONTA -150,00 ou 150,00
  // Exemplo: 01/05 SUPERMERCADO - 1.250,50
  // Captura valores como 1.000,00 ou -1.000,00 ou 1.000,00- ou 1.000,00 D
  const regex = /(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+([A-Za-z0-9\s\-\/\.\*]+?)\s+((?:R\$\s*)?-?(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2}(?:\s*[-CDcd])?)/g;
  
  let match;
  while ((match = regex.exec(cleanText)) !== null) {
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
    const isNegative = amountStr.includes('-') || amountStr.toLowerCase().endsWith('d');
    const cleanAmountStr = amountStr.replace(/[a-zA-Z\$\s-]/g, '').replace(/\./g, '').replace(',', '.');
    let amount = parseFloat(cleanAmountStr);
    
    if (isNaN(amount)) continue;
    
    if (isNegative) amount = -Math.abs(amount);
    
    const descLower = description.toLowerCase();
    
    // Determinar se é receita ou despesa
    const isExpense = amount < 0 || 
                     descLower.includes('tarifa') || 
                     descLower.includes('pagamento') ||
                     descLower.includes('compra') ||
                     descLower.includes('pix enviado');
                     
    const type = isExpense || amount < 0 ? 'EXPENSE' : 'INCOME';
    amount = Math.abs(amount);
    
    // Filtrar descrições comuns que não são transações reais
    if (descLower.includes('saldo') || description.length < 3) continue;
    
    transactions.push({
      date: isoDate,
      description: description.substring(0, 100),
      amount,
      type,
    });
  }
  
  return transactions;
}
