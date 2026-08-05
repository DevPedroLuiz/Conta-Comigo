import { useMutation } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '../services/SettingsService';
import { downloadJson } from '../utils/downloadJson';
import { Button } from '../../../core/ui/components/button';
import { Spinner } from '../../../core/ui/components/spinner';
import { format } from 'date-fns';

export function DataExportSection() {
  const exportMutation = useMutation({
    mutationFn: () => settingsService.exportUserData(),
    onSuccess: (data) => {
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      downloadJson(data, `conta-comigo-export-${dateStr}.json`);
      toast.success('Dados exportados com sucesso.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao exportar dados.');
    },
  });

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b last:border-0">
      <div>
        <p className="font-medium">Exportação de Dados</p>
        <p className="text-sm text-muted-foreground">
          Baixe uma cópia de todos os seus dados financeiros em formato JSON (Portabilidade LGPD).
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => exportMutation.mutate()}
        disabled={exportMutation.isPending}
      >
        {exportMutation.isPending ? (
          <Spinner className="mr-2 h-4 w-4" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Baixar meus dados (JSON)
      </Button>
    </div>
  );
}
