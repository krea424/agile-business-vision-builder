
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { calculateFinancialSummary } from '@/components/FinancialPlan/financialCalculator';
import { calculateCashFlowSummary } from '@/components/FinancialPlan/cashFlowCalculator';
import { calculateDashboardData, Insight, DashboardData } from './dashboardCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, Bar, Line } from 'recharts';
import { Edit, Banknote, Landmark, AlertTriangle, ArrowDown, CalendarCheck, Percent, Target, Info, BarChart } from 'lucide-react';
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

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || value === null) return "N/A";
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export const ExecutiveDashboard = ({ planData }: { planData: FinancialPlanState }) => {
  const navigate = useNavigate();

  const financialSummary = useMemo(() => calculateFinancialSummary(planData), [planData]);
  const cashFlowSummary = useMemo(() => calculateCashFlowSummary(planData, financialSummary), [planData, financialSummary]);
  const dashboardData: DashboardData = useMemo(() => calculateDashboardData(planData, financialSummary, cashFlowSummary), [planData, financialSummary, cashFlowSummary]);
  
  const { kpis, monthlyChartData, automatedInsights } = dashboardData;

  // Type guard to ensure KPIs are loaded
  if (!('peakFundingRequirement' in kpis)) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-secondary via-background to-background dark:from-black/10 dark:via-background dark:to-background">
            <Card>
                <CardHeader>
                    <CardTitle>Dati non disponibili</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">I calcoli sono in corso o i dati di input non sono sufficienti per generare la dashboard.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-background dark:from-black/10 dark:via-background dark:to-background">
      <div className="container mx-auto p-4 md:p-8 lg:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Executive Summary</h1>
            <p className="mt-2 text-lg text-muted-foreground">{planData.general.scenarioName}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/plan')}>
              <Edit className="mr-2 h-4 w-4" /> Modifica Piano
            </Button>
            <Button onClick={() => navigate('/sensitivity')}>
              <BarChart className="mr-2 h-4 w-4" /> Analisi di Sensitività
            </Button>
          </div>
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

        {automatedInsights && automatedInsights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4 text-primary">Insight Automatici</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {automatedInsights.map((insight: Insight) => (
                    <Alert variant={insight.variant} key={insight.key} className="col-span-1 md:col-span-2 lg:col-span-1">
                        {insight.variant === 'destructive' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                        <AlertTitle>{insight.title}</AlertTitle>
                        <AlertDescription>{insight.description}</AlertDescription>
                    </Alert>
                ))}
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
