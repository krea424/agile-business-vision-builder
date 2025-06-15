
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CashFlowYearlyData } from './types';
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
}

const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const chartConfig = {
  endingCash: {
    label: "Cassa Finale",
    color: "hsl(var(--chart-1))",
  },
};

export function CashFlowStatement({ data }: Props) {
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

  const tableHeaders = ["Voce", ...data.map(d => `Anno ${d.year}`)];
  const rows: { label: string; key: keyof CashFlowYearlyData; isBold?: boolean; isHighlighted?: boolean; isPositive?: boolean }[] = [
    { label: "Utile Netto", key: 'netProfit' },
    { label: "(+) Ammortamenti", key: 'amortization', isPositive: true },
    { label: "Flusso di Cassa Operativo Lordo", key: 'grossOperatingCashFlow', isBold: true },
    { label: "Variazione Capitale Circolante", key: 'changeInWorkingCapital' },
    { label: "Flusso di Cassa da Attività Operativa (A)", key: 'cashFlowFromOperations', isBold: true },
    { label: "(-) Investimenti (CapEx)", key: 'capex' },
    { label: "Flusso di Cassa da Attività di Investimento (B)", key: 'cashFlowFromInvesting', isBold: true },
    { label: "(+) Apporto Capitale Proprio (Equity)", key: 'equityInjection', isPositive: true },
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
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3 3" />
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
                    <TableCell className={row.isBold ? 'font-semibold text-gray-800 dark:text-gray-100' : ''}>{row.label}</TableCell>
                    {data.map(yearData => {
                      const value = yearData[row.key] as number;
                      let colorClass = '';

                      if (typeof value === 'number' && value !== 0) {
                        const standardColorRows: (keyof CashFlowYearlyData)[] = ['netProfit', 'grossOperatingCashFlow', 'cashFlowFromOperations', 'cashFlowFromInvesting', 'cashFlowFromFinancing', 'netCashFlow', 'startingCash', 'endingCash', 'amortization', 'equityInjection'];
                        const invertedColorRows: (keyof CashFlowYearlyData)[] = ['changeInWorkingCapital', 'capex'];
                        
                        if (standardColorRows.includes(row.key)) {
                          colorClass = value > 0 ? 'text-green-600' : 'text-red-600';
                        } else if (invertedColorRows.includes(row.key)) {
                          colorClass = value > 0 ? 'text-red-600' : 'text-green-600';
                        }
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
