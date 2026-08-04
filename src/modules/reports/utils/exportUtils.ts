import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CompleteReportData } from '../types/report.types';
import { format } from 'date-fns';

export function exportToCSV(data: CompleteReportData, startDate: string, endDate: string) {
  const transactions = data.transactions.map(tx => ({
    Data: format(new Date(tx.date), 'dd/MM/yyyy'),
    Tipo: tx.type === 'INCOME' ? 'Receita' : 'Despesa',
    Categoria: tx.categories?.name || 'Sem Categoria',
    Conta: tx.accounts?.name || 'Sem Conta',
    Descrição: tx.description,
    Valor: Number(tx.amount).toFixed(2).replace('.', ',')
  }));

  const csv = Papa.unparse(transactions, { delimiter: ';' });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `relatorio_${startDate}_a_${endDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: CompleteReportData, startDate: string, endDate: string) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Relatório Financeiro', 14, 22);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Período: ${format(new Date(startDate), 'dd/MM/yyyy')} a ${format(new Date(endDate), 'dd/MM/yyyy')}`, 14, 30);
  
  // Summary
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Resumo', 14, 45);
  
  (doc as any).autoTable({
    startY: 50,
    head: [['Total Receitas', 'Total Despesas', 'Saldo Líquido']],
    body: [[
      `R$ ${data.summary.totalIncome.toFixed(2)}`,
      `R$ ${data.summary.totalExpense.toFixed(2)}`,
      `R$ ${data.summary.netBalance.toFixed(2)}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [63, 63, 70] },
    styles: { halign: 'center' }
  });
  
  // Transactions
  doc.text('Transações', 14, (doc as any).lastAutoTable.finalY + 15);
  
  const tableData = data.transactions.map(tx => [
    format(new Date(tx.date), 'dd/MM/yyyy'),
    tx.type === 'INCOME' ? 'Receita' : 'Despesa',
    tx.categories?.name || '-',
    tx.description,
    `R$ ${Number(tx.amount).toFixed(2)}`
  ]);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [63, 63, 70] },
    styles: { fontSize: 9 }
  });
  
  doc.save(`relatorio_${startDate}_a_${endDate}.pdf`);
}
