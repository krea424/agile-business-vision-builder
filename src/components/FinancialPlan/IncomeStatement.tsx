import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { YearlyData } from './types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface Props {
  data: YearlyData[];
  currency?: string;
}

const chartConfig = {
  revenues: {
    label: "Ricavi",
    color: "hsl(var(--primary))",
  },
  netProfit: {
    label: "Utile Netto",
    color: "#10b981",
  },
};

export function IncomeStatement({ data, currency = 'EUR' }: Props) {
  if (!data || data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Conto Economico Proiettato</CardTitle>
                <CardDescription>Nessun dato da visualizzare. Compila le sezioni precedenti.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  const formatPercentage = (value: number) => new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);

  const tableHeaders = ["Voce", ...data.map(d => `Anno ${d.year}`)];
  const rows: { label: string; key: keyof YearlyData; isBold?: boolean; isHighlighted?: boolean; isPercentage?: boolean; isSubtle?: boolean; }[] = [
    { label: "Ricavi da Clienti Recuperati", key: 'recoverableClientRevenues', isSubtle: true },
    { label: "Ricavi da Nuovi Clienti (Marketing)", key: 'newClientRevenues', isSubtle: true },
    { label: "Ricavi da Clienti Diretti", key: 'directlyAcquiredClientRevenues', isSubtle: true },
    { label: "Ricavi Totali", key: 'revenues', isBold: true },
    { label: "Costi Variabili", key: 'variableCosts' },
    { label: "Margine di Contribuzione (%)", key: 'contributionMarginPercentage', isPercentage: true, isBold: true },
    { label: "Costi del Personale", key: 'personnelCosts' },
    { label: "Costi Fissi Operativi", key: 'fixedCosts' },
    { label: "Costi di Marketing", key: 'marketingCosts' },
    { label: "EBITDA", key: 'ebitda', isBold: true },
    { label: "EBITDA Margin (%)", key: 'ebitdaMargin', isPercentage: true },
    { label: "Ammortamenti", key: 'amortization' },
    { label: "EBIT (Utile Operativo)", key: 'ebit', isBold: true },
    { label: "EBIT Margin (%)", key: 'ebitMargin', isPercentage: true },
    { label: "(-) Oneri Finanziari", key: 'interestExpense' },
    { label: "Utile ante imposte (EBT)", key: 'ebt', isBold: true },
    { label: "Imposte (IRES + IRAP)", key: 'taxes' },
    { label: "Utile Netto", key: 'netProfit', isBold: true, isHighlighted: true },
    { label: "Net Profit Margin (%)", key: 'netProfitMargin', isPercentage: true, isHighlighted: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conto Economico Proiettato</CardTitle>
        <CardDescription>Riepilogo annuale dei ricavi, costi e profittabilità del piano.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Riepilogo Grafico</h3>
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart accessibilityLayer data={data}>
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
                    formatter={(value, name) => {
                      if (name === 'netProfit' || name === 'revenues') {
                        return formatCurrency(value as number);
                      }
                      return value;
                    }}
                    indicator="dot"
                />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenues" fill="var(--color-revenues)" radius={4} />
              <Bar dataKey="netProfit" fill="var(--color-netProfit)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Dettaglio Conto Economico</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHeaders.map((header) => <TableHead key={header} className={header !== "Voce" ? "text-right" : ""}>{header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.label} className={row.isHighlighted ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                    <TableCell className={`${row.isBold ? 'font-semibold text-gray-800 dark:text-gray-100' : ''} ${row.isSubtle ? 'pl-8 text-sm text-muted-foreground' : ''}`}>
                      {row.label}
                    </TableCell>
                    {data.map(yearData => {
                      const value = yearData[row.key] as number;
                      let colorClass = '';

                      if (typeof value === 'number' && value < 0 && !row.isPercentage) {
                        colorClass = 'text-red-600';
                      }
                      
                      return (
                        <TableCell key={yearData.year} className={`text-right tabular-nums ${row.isBold ? 'font-semibold text-gray-800 dark:text-gray-100' : ''} ${colorClass}`}>
                          {row.isPercentage ? formatPercentage(value) : formatCurrency(value)}
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
