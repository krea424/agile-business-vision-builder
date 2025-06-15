
```tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { calculateFinancialSummary } from '@/components/FinancialPlan/financialCalculator';
import { calculateCashFlowSummary } from '@/components/FinancialPlan/cashFlowCalculator';
import { calculateDashboardData } from './dashboardCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Bar, Line } from 'recharts';
import { Edit, Banknote, Landmark, AlertTriangle, ArrowDown, CalendarCheck, Percent, Target, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type KpiCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

export const ExecutiveDashboard = ({ planData }: { planData: FinancialPlanState }) => {
  const navigate = useNavigate();

  const financialSummary = useMemo(() => calculateFinancialSummary(planData), [planData]);
  const cashFlowSummary = useMemo(() => calculateCashFlowSummary(planData, financialSummary), [planData, financialSummary]);
  const dashboardData = useMemo(() => calculateDashboardData(planData, financialSummary, cashFlowSummary), [planData, financialSummary, cashFlowSummary]);
  
  const { kpis, monthlyChartData } = dashboardData;

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }

  const automatedInsights = useMemo(() => {
    const insights: React.ReactNode[] = [];

    if (!planData || !kpis || !financialSummary || financialSummary.length === 0) {
      return [];
    }
    
    // Insight 1: Liquidity Risk
    const equityInjection = planData.general.equityInjection || 0;
    if (kpis.peakFundingRequirement && kpis.peakFundingRequirement > equityInjection) {
      const shortfall = kpis.peakFundingRequirement - equityInjection;
      insights.push(
        <Alert variant="destructive" key="liquidity-risk" className="col-span-1 md:col-span-2 lg:col-span-1">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rischio di Liquidità</AlertTitle>
          <AlertDescription>
            Il capitale versato ({formatCurrency(equityInjection)}) non basta a coprire il fabbisogno di {formatCurrency(kpis.peakFundingRequirement)}. 
            Necessario un ulteriore finanziamento di {formatCurrency(shortfall)} o una revisione dei costi.
          </AlertDescription>
        </Alert>
      );
    }
    
    // Insight 2: Cash Cycle
    const netTradeCycle = (planData.general.daysToCollectReceivables || 0) - (planData.general.daysToPayPayables || 0);
    if (netTradeCycle > 60) {
        insights.push(
            <Alert key="cash-cycle" className="col-span-1 md:col-span-2 lg:col-span-1">
                <Info className="h-4 w-4" />
                <AlertTitle>Insight: Ciclo di Cassa</AlertTitle>
                <AlertDescription>
                    Il ciclo di cassa ({netTradeCycle.toFixed(0)} giorni) è lungo. Valutare di ritardare i pagamenti o accelerare gli incassi per migliorare la liquidità.
                </AlertDescription>
            </Alert>
        );
    }

    // Insight 3: Cost Structure
    const year1Summary = financialSummary[0];
    const totalCosts1 = year1Summary.personnelCosts + year1Summary.fixedCosts + year1Summary.variableCosts + year1Summary.marketingCosts;
    if (totalCosts1 > 0) {
        const personnelCostRatio = year1Summary.personnelCosts / totalCosts1;
        if (personnelCostRatio > 0.7) {
            insights.push(
                <Alert key="cost-structure" className="col-span-1 md:col-span-2 lg:col-span-1">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Insight: Struttura dei Costi</AlertTitle>
                    <AlertDescription>
                        I costi del personale rappresentano il {(personnelCostRatio * 100).toFixed(0)}% dei costi totali. Valutare l'impatto di aumenti salariali inattesi.
                    </AlertDescription>
                </Alert>
            );
        }
    }

    // Insight 4: Sustainability Risk
    if (financialSummary.length > 1) {
        const year2Summary = financialSummary[1];
        const totalCosts2 = year2Summary.personnelCosts + year2Summary.fixedCosts + year2Summary.variableCosts + year2Summary.marketingCosts;

        if (year1Summary.revenues > 0 && totalCosts1 > 0) {
            const revenueGrowth = (year2Summary.revenues - year1Summary.revenues) / year1Summary.revenues;
            const costGrowth = (totalCosts2 - totalCosts1) / totalCosts1;
            
            if (costGrowth > revenueGrowth) {
                insights.push(
                    <Alert variant="destructive" key="sustainability-risk" className="col-span-1 md:col-span-2 lg:col-span-1">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Rischio di Sostenibilità</AlertTitle>
                        <AlertDescription>
                            I costi ({ (costGrowth * 100).toFixed(1) }%) crescono più dei ricavi ({ (revenueGrowth * 100).toFixed(1) }%). Rivedere il pricing o l'efficienza dei costi.
                        </AlertDescription>
                    </Alert>
                );
            }
        }
    }

    return insights;
  }, [planData, kpis, financialSummary, formatCurrency]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-background dark:from-black/10 dark:via-background dark:to-background">
      <div className="container mx-auto p-4 md:p-8 lg:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Executive Summary</h1>
            <p className="mt-2 text-lg text-muted-foreground">{planData.general.scenarioName}</p>
          </div>
          <Button onClick={() => navigate('/plan')}>
            <Edit className="mr-2 h-4 w-4" /> Modifica Piano
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <KpiCard title="Fabbisogno Finanziario" value={formatCurrency(kpis.peakFundingRequirement)} description="Massima esposizione finanziaria richiesta" icon={Banknote} />
          <KpiCard title="Valore d'Impresa (a 5 anni)" value={formatCurrency(kpis.enterpriseValue)} description={`Basato su un multiplo EBITDA di ${planData.general.exitMultiple}x`} icon={Landmark} />
          <KpiCard title="IRR (Internal Rate of Return)" value={`${kpis.irr ? (kpis.irr * 100).toFixed(1) : 'N/A'}%`} description="Rendimento annualizzato dell'investimento" icon={Percent} />
          <KpiCard title="Payback Period" value={kpis.paybackPeriodYears ? `${kpis.paybackPeriodYears.toFixed(1)} Anni` : 'N/A'} description="Tempo per recuperare l'investimento iniziale" icon={CalendarCheck} />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-8">
            <KpiCard title="Break-Even Point (EBITDA)" value={kpis.breakEvenMonth ? `Mese ${kpis.breakEvenMonth}` : 'Non raggiunto'} description="Mese in cui l'EBITDA cumulato diventa positivo" icon={Target} />
            <KpiCard title="Punto di Cassa più Basso" value={formatCurrency(kpis.lowestCashPoint?.value)} description={kpis.lowestCashPoint ? `Raggiunto al mese ${kpis.lowestCashPoint.month}` : ''} icon={ArrowDown} />
        </div>

        {automatedInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-primary">Insight Automatici</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {automatedInsights}
            </div>
          </div>
        )}

        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Andamento Economico e Finanziario</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" stroke="#8884d8" tickFormatter={(value) => formatCurrency(value).replace('€', '€ ')} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => formatCurrency(value).replace('€', '€ ')} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Ricavi" yAxisId="left" fill="#8884d8" name="Ricavi" />
                        <Line type="monotone" dataKey="EBITDA" yAxisId="left" stroke="#ff7300" name="EBITDA" />
                        <Line type="monotone" dataKey="Cassa Finale" yAxisId="right" stroke="#82ca9d" name="Cassa Finale" />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};
```
