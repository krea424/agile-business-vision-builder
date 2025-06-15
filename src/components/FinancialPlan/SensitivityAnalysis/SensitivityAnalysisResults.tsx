
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export type KpiResults = {
    enterpriseValue: number | null;
    irr: number | null;
    peakFundingRequirement: number | null;
    paybackPeriodYears: number | null;
};

export type AnalysisResults = {
    variable: string;
    base: KpiResults;
    pessimistic: KpiResults;
    optimistic: KpiResults;
};

type Props = {
    results: AnalysisResults | null;
    isRunning: boolean;
};

const formatCurrency = (value: number | null | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
};

const formatPercentage = (value: number | null | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
};

const formatYears = (value: number | null | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return `${value.toFixed(1)} Anni`;
};

export const SensitivityAnalysisResults = ({ results, isRunning }: Props) => {

    if (isRunning) {
        return (
            <Card className="flex items-center justify-center min-h-[400px]">
                <CardContent>
                    <p className="text-muted-foreground">Calcolo degli scenari in corso...</p>
                </CardContent>
            </Card>
        );
    }
    
    if (!results) {
        return (
            <Card className="flex items-center justify-center min-h-[400px]">
                 <CardContent>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>In attesa di analisi</AlertTitle>
                        <AlertDescription>
                            Configura la variabile e clicca su "Esegui Analisi" per vedere i risultati.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const { variable, base, pessimistic, optimistic } = results;

    const kpiMapping = [
        { key: 'enterpriseValue', label: 'Valore d\'Impresa', formatter: formatCurrency },
        { key: 'irr', label: 'IRR', formatter: formatPercentage },
        { key: 'peakFundingRequirement', label: 'Fabbisogno Finanziario', formatter: formatCurrency },
        { key: 'paybackPeriodYears', label: 'Payback Period', formatter: formatYears },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Risultati Analisi di Sensitività</CardTitle>
                <CardDescription>Impatto della variazione di "{variable}" sui KPI principali.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>KPI</TableHead>
                            <TableHead className="text-right">Scenario Pessimistico</TableHead>
                            <TableHead className="text-right">Caso Base</TableHead>
                            <TableHead className="text-right">Scenario Ottimistico</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {kpiMapping.map(kpi => (
                             <TableRow key={kpi.key}>
                                <TableCell className="font-medium">{kpi.label}</TableCell>
                                <TableCell className="text-right">
                                    {kpi.formatter(pessimistic[kpi.key as keyof KpiResults])}
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {kpi.formatter(base[kpi.key as keyof KpiResults])}
                                </TableCell>
                                <TableCell className="text-right">
                                    {kpi.formatter(optimistic[kpi.key as keyof KpiResults])}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
