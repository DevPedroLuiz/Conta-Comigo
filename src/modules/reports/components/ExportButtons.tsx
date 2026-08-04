import { Button } from '../../../core/ui/components/button';
import { Download, FileText } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { CompleteReportData } from '../types/report.types';

interface ExportButtonsProps {
  data: CompleteReportData | null;
  startDate: string;
  endDate: string;
}

export function ExportButtons({ data, startDate, endDate }: ExportButtonsProps) {
  if (!data || data.transactions.length === 0) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => exportToCSV(data, startDate, endDate)} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
        <Download className="mr-2 h-4 w-4" />
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportToPDF(data, startDate, endDate)} className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800">
        <FileText className="mr-2 h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
