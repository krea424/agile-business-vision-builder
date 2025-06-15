
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CashFlowYearlyData } from './types';
import { TrendingDown } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts"

interface Props {
  data: CashFlowYearlyData[];
  currency?: string;
}

const chartConfig = {
  endingCash: {
    label: "Cassa Finale",
    color: "hsl(var(--chart-1))",
  },
  minimumCashBuffer: {
    label: "Buffer Cassa Minimo",
    color: "hsl(var(--destructive))",
  },
};

export function CashFlowStatement({ data, currency = 'EUR' }: Props) {
  if (!data || data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Rendiconto Finanziario Proiettato</CardTitle>
                <CardDescription>Nessun dato da visualizzare. Compila le sezioni precedenti.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const peakFunding = data.length > 0 ? Math.min(...data.map(d => d.endingCash)) : 0;

  const tableHeaders = ["Voce", ...data.map(d => `Anno ${d.year}`)];
  const rows: { label: string; key: keyof CashFlowYearlyData; isBold?: boolean; isHighlighted?: boolean; isPositive?: boolean; isSubtle?: boolean; }[] = [
    { label: "Utile Netto", key: 'netProfit' },
    { label: "Ammortamenti", key: 'amortization', isPositive: true },
    { label: "Flusso di Cassa Operativo Lordo", key: 'grossOperatingCashFlow', isBold: true },
    { label: "Variazione Crediti vs Clienti", key: 'changeInReceivables', isSubtle: true },
    { label: "Variazione Debiti vs Fornitori", key: 'changeInPayables', isSubtle: true },
    { label: "Flusso di Cassa da Attività Operativa (A)", key: 'cashFlowFromOperations', isBold: true },
    { label: "Investimenti (CapEx)", key: 'capex' },
    { label: "Flusso di Cassa da Attività di Investimento (B)", key: 'cashFlowFromInvesting', isBold: true },
    { label: "Apporto Capitale Proprio (Equity)", key: 'equityInjection', isPositive: true },
    { label: "Accensione Finanziamenti", key: 'loanProceeds', isPositive: true },
    { label: "Rimborso Quota Capitale Finanziamenti", key: 'loanPrincipalRepayment' },
    { label: "Pagamento Dividendi", key: 'dividendsPaid' },
    { label: "Flusso di Cassa da Attività Finanziaria (C)", key: 'cashFlowFromFinancing', isBold: true },
    { label: "Flusso di Cassa Netto del Periodo", key: 'netCashFlow', isBold: true },
    { label: "Cassa Iniziale", key: 'startingCash' },
    { label: "Cassa Finale", key: 'endingCash', isBold: true, isHighlighted: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendiconto Finanziario Proiettato (Flusso di Cassa)</CardTitle>
        <CardDescription>Analisi della liquidità e del fabbisogno finanziario dell'azienda.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fabbisogno Finanziario Massimo</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(peakFunding)}</div>
                    <p className="text-xs text-muted-foreground">
                        Il punto più basso della cassa durante il piano.
                    </p>
                </CardContent>
            </Card>
            <Card className="flex flex-col items-center justify-center bg-muted/50">
                 <CardHeader>
                    <CardTitle className="text-sm font-medium text-center">Time to Cash Flow Positive</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-sm text-muted-foreground">Prossimamente</p>
                 </CardContent>
            </Card>
             <Card className="flex flex-col items-center justify-center bg-muted/50">
                 <CardHeader>
                    <CardTitle className="text-sm font-medium text-center">Runway (Mesi)</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-sm text-muted-foreground">Prossimamente</p>
                 </CardContent>
            </Card>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Andamento Cassa Finale</h3>
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `Anno ${value}`}
              />
              <YAxis
                tickFormatter={(value) => new Intl.NumberFormat('it-IT', {notation: "compact", compactDisplay: "short"}).format(value as number)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                    indicator="dot"
                />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
               <ReferenceLine 
                y={data[0]?.minimumCashBuffer || 0} 
                label={{ value: "Buffer Minimo", position: "insideTopLeft", fill: "hsl(var(--destructive))", fontSize: 12 }} 
                stroke="var(--color-minimumCashBuffer)"
                strokeDasharray="4 4" 
              />
              <Line type="monotone" dataKey="endingCash" stroke="var(--color-endingCash)" strokeWidth={2} dot={{ r: 5, fill: "var(--color-endingCash)" }} />
            </LineChart>
          </ChartContainer>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Dettaglio Flusso di Cassa</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHeaders.map((header) => <TableHead key={header} className={header !== "Voce" ? "text-right" : ""}>{header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.label} className={row.isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                    <TableCell className={`${row.isBold ? 'font-semibold text-gray-800 dark:text-gray-100' : ''} ${row.isSubtle ? 'pl-8 text-sm text-muted-foreground' : ''}`}>{row.label}</TableCell>
                    {data.map(yearData => {
                      const value = yearData[row.key] as number;
                      let colorClass = '';

                      if (typeof value === 'number' && value !== 0) {
                        // For cash flow, positive values (inflows) are green, negative (outflows) are red.
                        colorClass = value >= 0 ? 'text-green-600' : 'text-red-600';
                      }

                      return (
                        <TableCell key={yearData.year} className={`text-right tabular-nums ${row.isBold ? 'font-semibold text-gray-800 dark:text-gray-100' : ''} ${colorClass}`}>
                          {formatCurrency(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
