import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../../auth/hooks/useAuth';
import { investmentService } from '../services/InvestmentService';
import { InvestmentAsset, InvestmentMovement, Dividend } from '../types/investment.types';
import { Button } from '../../../core/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/ui/components/card';
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../core/ui/components/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../core/ui/components/table';
import { Spinner } from '../../../core/ui/components/spinner';

export function AssetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUser();
  
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<InvestmentAsset | null>(null);
  const [movements, setMovements] = useState<InvestmentMovement[]>([]);
  const [dividends, setDividends] = useState<Dividend[]>([]);

  useEffect(() => {
    if (user && id) {
      loadData();
    }
  }, [user, id]);

  async function loadData() {
    setLoading(true);
    
    // Using internal repository method to bypass service missing getAssetById, or just fetch via getAssets
    const res = await investmentService.getAssets(user!.id);
    const currentAsset = res.data?.find(a => a.id === id);
    
    if (currentAsset) {
      setAsset(currentAsset);
      const [movRes, divRes] = await Promise.all([
        investmentService.getMovements(user!.id, id),
        investmentService.getDividends(user!.id, id)
      ]);
      if (movRes.data) setMovements(movRes.data);
      if (divRes.data) setDividends(divRes.data);
    } else {
      toast.error('Ativo não encontrado');
      navigate('/investments');
    }
    
    setLoading(false);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!asset) return null;

  const totalInvested = asset.quantity * asset.average_price;
  const currentTotal = asset.quantity * asset.current_price;
  const profit = currentTotal - totalInvested;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/investments')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{asset.ticker}</h1>
            <p className="text-muted-foreground mt-1">{asset.name} • {asset.investments?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/investments/assets/${id}/dividend`)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Receber Provento
          </Button>
          <Button onClick={() => navigate(`/investments/assets/${id}/movement`)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Comprar / Vender
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quantidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asset.quantity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Preço Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(asset.average_price)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Atual (Lucro/Prejuízo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentTotal)}</div>
            <p className={`text-xs mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements">Histórico de Ordens</TabsTrigger>
          <TabsTrigger value="dividends">Proventos / Dividendos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">Nenhuma ordem registrada.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Operação</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>{new Date(mov.movement_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            mov.movement_type === 'BUY' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                             : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {mov.movement_type === 'BUY' ? 'COMPRA' : 'VENDA'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{mov.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(mov.unit_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(mov.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dividends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Proventos</CardTitle>
            </CardHeader>
            <CardContent>
              {dividends.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">Nenhum dividendo registrado.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data de Pagamento</TableHead>
                      <TableHead className="text-right">Valor Recebido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dividends.map((div) => (
                      <TableRow key={div.id}>
                        <TableCell>{new Date(div.payment_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">+{formatCurrency(div.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
