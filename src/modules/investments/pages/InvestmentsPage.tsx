import { useState, useEffect } from 'react';
import { useUser } from '../../auth/hooks/useAuth';
import { investmentService } from '../services/InvestmentService';
import { Investment, InvestmentAsset, InvestmentsSummary } from '../types/investment.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/ui/components/card';
import { Button } from '../../../core/ui/components/button';
import { Plus, TrendingUp, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../../core/ui/components/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../core/ui/components/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../core/ui/components/table';

export function InvestmentsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<InvestmentsSummary | null>(null);
  const [assets, setAssets] = useState<InvestmentAsset[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [summaryRes, assetsRes, investmentsRes] = await Promise.all([
      investmentService.getSummary(user!.id),
      investmentService.getAssets(user!.id),
      investmentService.getInvestments(user!.id)
    ]);
    
    if (summaryRes.data) setSummary(summaryRes.data);
    if (assetsRes.data) setAssets(assetsRes.data);
    if (investmentsRes.data) setInvestments(investmentsRes.data);
    
    setLoading(false);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format(value / 100);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu portfólio e carteiras</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/investments/new')}>
            <Briefcase className="mr-2 h-4 w-4" />
            Nova Carteira
          </Button>
          <Button onClick={() => navigate('/investments/assets/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Comprar Ativo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Investido</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.current_total_value || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor aplicado: {formatCurrency(summary?.total_invested || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.profitability || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {(summary?.profitability || 0) >= 0 ? '+' : ''}{formatCurrency(summary?.profitability || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercent(summary?.profitability_percentage || 0)} histórico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em {investments.length} carteira(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Meus Ativos</TabsTrigger>
          <TabsTrigger value="wallets">Carteiras/Corretoras</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posição Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum ativo na sua carteira. Comece a investir agora!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ativo</TableHead>
                      <TableHead>Corretora</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Preço Médio</TableHead>
                      <TableHead className="text-right">Total Investido</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">
                          <div>{asset.ticker}</div>
                          <div className="text-xs text-muted-foreground">{asset.name} ({asset.type})</div>
                        </TableCell>
                        <TableCell>{asset.investments?.name || '---'}</TableCell>
                        <TableCell className="text-right">{asset.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.average_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.quantity * asset.average_price)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/investments/assets/${asset.id}`)}>
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suas Corretoras</CardTitle>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma carteira cadastrada.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Corretora Instituição</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investments.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.name}</TableCell>
                        <TableCell>{inv.broker}</TableCell>
                        <TableCell className="text-muted-foreground">{inv.description || '---'}</TableCell>
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
