import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, AlertTriangle, Info } from 'lucide-react';
import { FinancialPlanState, GeneralAssumptions, RecoverableClient, NewClientAcquisition, DirectlyAcquiredClient, PersonnelCost, FixedCost, VariableCost, InitialInvestment } from '@/components/FinancialPlan/types';
import { Insight } from '@/components/FinancialPlan/dashboardCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { IncomeStatement } from '@/components/FinancialPlan/IncomeStatement';
import { CashFlowStatement } from '@/components/FinancialPlan/CashFlowStatement';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Bar, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from '@/lib/utils';

const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
const formatPercentage = (value: number) => new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);

// Helper functions copied from components to calculate row-specific values
const calculateNewClientRevenue = (item: NewClientAcquisition): number => {
    if (!item.monthlyMarketingInvestment || !item.leadsPer100Invested || !item.conversionRate || !item.averageAnnualContractValue) return 0;
    const annualMarketingInvestment = item.monthlyMarketingInvestment * 12;
    const annualLeads = (annualMarketingInvestment / 100) * item.leadsPer100Invested;
    const annualNewContracts = annualLeads * (item.conversionRate / 100);
    return annualNewContracts * item.averageAnnualContractValue;
};

const calculateDirectClientRevenue = (item: DirectlyAcquiredClient): number => {
    return item.annualContractValue * item.numberOfClients;
};

const calculatePersonnelAnnualCost = (item: PersonnelCost): number => item.annualGrossSalary * item.companyCostCoefficient;
const calculatePersonnelFirstYearCost = (item: PersonnelCost): number => (calculatePersonnelAnnualCost(item) / 12) * (13 - item.hiringMonth);

const chartConfig = {
  Ricavi: {
    label: 'Ricavi',
    color: 'hsl(var(--chart-revenue))',
  },
  EBITDA: {
    label: 'EBITDA',
    color: 'hsl(var(--chart-ebitda))',
  },
  "Cassa Finale": {
    label: 'Cassa Finale',
    color: 'hsl(var(--chart-cash))',
  },
} satisfies ChartConfig;

const Section: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <section className={cn("mb-10 break-inside-avoid", className)}>
        <h2 className="text-2xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary">{title}</h2>
        <div>{children}</div>
    </section>
);

const KpiBox: React.FC<{ title: string; value: string, className?: string }> = ({ title, value, className }) => (
    <div className={cn("bg-secondary/50 p-4 rounded-lg", className)}>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
);

const GeneralAssumptionsDisplay: React.FC<{ data: GeneralAssumptions, formatCurrency: (value: number) => string }> = ({ data, formatCurrency }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 text-sm p-4 rounded-lg bg-muted/30">
        <p><strong>Scenario:</strong> {data.scenarioName}</p>
        <p><strong>Orizzonte Temporale:</strong> {data.timeHorizon} anni</p>
        <p><strong>Data Inizio:</strong> {data.startDate}</p>
        <p><strong>Tasso Inflazione:</strong> {formatPercentage(data.inflationRate)}</p>
        <p><strong>Aliquota IRES:</strong> {formatPercentage(data.iresRate)}</p>
        <p><strong>Aliquota IRAP:</strong> {formatPercentage(data.irapRate)}</p>
        <p><strong>Aliquota IVA:</strong> {formatPercentage(data.averageVatRate)}</p>
        <p><strong>Liquidazione IVA:</strong> {data.vatPaymentFrequency}</p>
        <p><strong>Valuta:</strong> {data.currency}</p>
        <p><strong>Capitale Proprio:</strong> {formatCurrency(data.equityInjection)}</p>
        <p><strong>Finanziamento Iniziale:</strong> {formatCurrency(data.initialLoanAmount)}</p>
        <p><strong>Tasso Interesse Fin.:</strong> {formatPercentage(data.loanInterestRate)}</p>
        <p><strong>Durata Finanziamento:</strong> {data.loanDurationMonths} mesi</p>
        <p><strong>Giorni Incasso Clienti:</strong> {data.daysToCollectReceivables}</p>
        <p><strong>Giorni Pagamento Fornitori:</strong> {data.daysToPayPayables}</p>
        <p><strong>Cassa Minima:</strong> {formatCurrency(data.minimumCashBuffer)}</p>
        <p><strong>Crescita Ricavi:</strong> {formatPercentage(data.annualNewRevenueGrowthRate)}</p>
        <p><strong>Churn Rate:</strong> {formatPercentage(data.customerChurnRate)}</p>
        <p><strong>Politica Dividendi:</strong> {`${formatPercentage(data.dividendDistributionPolicy)} dal ${data.dividendDistributionStartYear}° anno`}</p>
        <p><strong>WACC:</strong> {formatPercentage(data.wacc)}</p>
        <p><strong>Terminal Value:</strong> {`${data.terminalValueMethod}${data.terminalValueMethod === 'Multiplo EBITDA' ? ` (${data.exitMultiple}x)` : ''}`}</p>
    </div>
);

const DashboardDisplay: React.FC<{ data: any, planData: FinancialPlanState }> = ({ data, planData }) => {
    const { kpis, monthlyChartData, automatedInsights } = data;

    const formatCurrencyDisplay = (value: number | undefined) => {
        if (value === undefined || value === null) return "N/A";
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: planData.general.currency || 'EUR', maximumFractionDigits: 0 }).format(value);
    }
    const formatCurrencyForChart = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

    if (!kpis) return null;

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4">Metriche Chiave</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <KpiBox title="Fabbisogno Finanziario" value={formatCurrencyDisplay(kpis.peakFundingRequirement)} />
                    <KpiBox title="Valore d'Impresa (a 5 anni)" value={formatCurrencyDisplay(kpis.enterpriseValue)} />
                    <KpiBox title="IRR" value={`${kpis.irr ? (kpis.irr * 100).toFixed(1) : 'N/A'}%`} />
                    <KpiBox title="Payback Period" value={kpis.paybackPeriodYears ? `${kpis.paybackPeriodYears.toFixed(1)} Anni` : 'N/A'} />
                    <KpiBox title="Break-Even Point (EBITDA)" value={kpis.breakEvenMonth ? `Mese ${kpis.breakEvenMonth}` : 'Non raggiunto'} />
                    <KpiBox title="Punto di Cassa più Basso" value={formatCurrencyDisplay(kpis.lowestCashPoint?.value)} />
                </div>
            </div>

            {automatedInsights && automatedInsights.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Insight Strategici</h3>
                    <div className="space-y-2">
                        {automatedInsights.map((insight: Insight) => (
                            <Alert variant={insight.variant} key={insight.key}>
                                {insight.variant === 'destructive' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                <AlertTitle className="font-bold">{insight.title}</AlertTitle>
                                <AlertDescription>{insight.description}</AlertDescription>
                            </Alert>
                        ))}
                    </div>
                </div>
            )}
            
            <div>
                <h3 className="text-xl font-semibold mb-2">Andamento Economico e Finanziario</h3>
                <div className="h-[400px] w-full">
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <ComposedChart data={monthlyChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                            />
                            <YAxis
                              yAxisId="left"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => formatCurrencyForChart(value as number).replace(/€\s/g, '').replace(/\./g, '').slice(0, -3) + 'k'}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={(value) => formatCurrencyForChart(value as number).replace(/€\s/g, '').replace(/\./g, '').slice(0, -3) + 'k'}
                            />
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="Ricavi" yAxisId="left" fill="var(--color-Ricavi)" radius={4} />
                            <Line type="monotone" dataKey="EBITDA" yAxisId="left" stroke="var(--color-EBITDA)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-EBITDA)" }} activeDot={{r: 6}} />
                            <Line type="monotone" dataKey="Cassa Finale" yAxisId="right" stroke="var(--color-Cassa Finale)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-Cassa Finale)" }} activeDot={{r: 6}} />
                        </ComposedChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

const ScenarioReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planData, financialSummary, cashFlowSummary, dashboardData, autoPrint } = location.state || {};

    useEffect(() => {
        if (autoPrint) {
            // Use a timeout to ensure all content and styles are rendered before printing
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [autoPrint]);

    const formatCurrency = (value: number) => {
        if (typeof value !== 'number' || isNaN(value)) return '';
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: planData?.general?.currency || 'EUR' }).format(value);
    };

    if (!planData || !financialSummary || !cashFlowSummary || !dashboardData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p>Dati non disponibili per generare il report.</p>
                <Button onClick={() => navigate('/')}><ArrowLeft className="mr-2" /> Torna Indietro</Button>
            </div>
        );
    }

    const handlePrint = () => window.print();

    return (
        <div className="bg-background text-foreground font-inter">
            <div className="p-8 print:p-0 mx-auto max-w-5xl">
                <header className="flex justify-between items-center mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-primary">Report Dettagliato</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2" /> Indietro</Button>
                        <Button onClick={handlePrint}><Printer className="mr-2" /> Stampa</Button>
                    </div>
                </header>
                
                <div className="print:block hidden mb-8 text-center">
                    <h1 className="text-4xl font-bold text-primary">{planData.general.companyName}</h1>
                    <p className="text-2xl font-semibold mt-2">Financial Sustainability Plan</p>
                    <p className="text-lg text-muted-foreground mt-1">Scenario: {planData.general.scenarioName}</p>
                </div>


                <main>
                    <Section title="Executive Summary & Dashboard">
                        <DashboardDisplay data={dashboardData} planData={planData} />
                    </Section>
                    
                    <Section title="1. Assunzioni Generali"><GeneralAssumptionsDisplay data={planData.general} formatCurrency={formatCurrency} /></Section>
                    
                    <Section title="2.1 Ricavi: Clienti da Recuperare">
                        <Table>
                            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Fatturato Annuo Prec.</TableHead><TableHead>Prob. Recupero</TableHead><TableHead>% Recupero</TableHead><TableHead>% Incr. Annuo</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {planData.recoverableClients.map(c => <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{formatCurrency(c.previousAnnualRevenue)}</TableCell><TableCell>{formatPercentage(c.recoveryProbability)}</TableCell><TableCell>{formatPercentage(c.recoveryAmountPercentage)}</TableCell><TableCell>{formatPercentage(c.annualIncreasePercentage || 0)}</TableCell></TableRow>)}
                            </TableBody>
                        </Table>
                    </Section>
                    
                    <Section title="2.2 Ricavi: Nuovi Clienti (da Marketing)">
                        <Table>
                             <TableHeader><TableRow><TableHead>Canale</TableHead><TableHead>Invest. Mkt Mensile</TableHead><TableHead>Conv. %</TableHead><TableHead>Valore Contratto Annuo</TableHead><TableHead>Ricavo Annuo Generato</TableHead></TableRow></TableHeader>
                             <TableBody>{planData.newClients.map(c => <TableRow key={c.id}><TableCell>{c.channel}</TableCell><TableCell>{formatCurrency(c.monthlyMarketingInvestment)}</TableCell><TableCell>{formatPercentage(c.conversionRate)}</TableCell><TableCell>{formatCurrency(c.averageAnnualContractValue)}</TableCell><TableCell>{formatCurrency(calculateNewClientRevenue(c))}</TableCell></TableRow>)}</TableBody>
                        </Table>
                    </Section>

                    <Section title="2.3 Ricavi: Clienti Acquisiti Direttamente">
                        <Table>
                            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Nr. Clienti</TableHead><TableHead>Importo Annuo</TableHead><TableHead>Fatturato Annuo Atteso</TableHead></TableRow></TableHeader>
                            <TableBody>{planData.directlyAcquiredClients.map(c => <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.numberOfClients}</TableCell><TableCell>{formatCurrency(c.annualContractValue)}</TableCell><TableCell>{formatCurrency(calculateDirectClientRevenue(c))}</TableCell></TableRow>)}</TableBody>
                        </Table>
                    </Section>
                    
                    <Section title="3.1 Costi: Personale">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Ruolo</TableHead>
                                <TableHead>Tipo Contratto</TableHead>
                                <TableHead>Costo Annuo Base</TableHead>
                                <TableHead>Dettagli</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>{planData.personnelCosts.map((c: PersonnelCost) => {
                                let annualCostText: string;
                                let details = `Inizio: Mese ${c.hiringMonth}`;

                                if (c.contractType === 'Dipendente') {
                                    const annualCost = (c.annualGrossSalary || 0) * (c.companyCostCoefficient || 1);
                                    annualCostText = formatCurrency(annualCost);
                                    details += `, Aumento annuo: ${formatPercentage(c.annualSalaryIncrease || 0)}`;
                                    if (c.bonusType && c.bonusType !== 'Nessuno') {
                                        const bonusValueText = c.bonusType === 'Importo Fisso Annuo' ? formatCurrency(c.bonusValue || 0) : formatPercentage(c.bonusValue || 0);
                                        details += `, Bonus: ${bonusValueText} ${c.bonusType}`;
                                    }
                                } else {
                                    annualCostText = formatCurrency((c.monthlyCost || 0) * 12);
                                }
                                
                                return (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.role}</TableCell>
                                        <TableCell>{c.contractType}</TableCell>
                                        <TableCell>{annualCostText}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{details}</TableCell>
                                    </TableRow>
                                );
                            })}</TableBody>
                        </Table>
                    </Section>

                    <Section title="3.2 Costi e Investimenti Operativi">
                        <h4 className="font-bold mt-4 mb-2">Costi Fissi</h4>
                        <Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Costo Mensile</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {planData.fixedCosts.map(c => (
                                    <React.Fragment key={c.id}>
                                        <TableRow>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell>{formatCurrency(c.subItems && c.subItems.length > 0 ? c.subItems.reduce((acc, si) => acc + si.monthlyCost, 0) : c.monthlyCost)}</TableCell>
                                        </TableRow>
                                        {c.subItems?.map(si => (
                                            <TableRow key={si.id} className="bg-muted/50"><TableCell className="pl-8 text-muted-foreground">{si.name}</TableCell><TableCell>{formatCurrency(si.monthlyCost)}</TableCell></TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                        <h4 className="font-bold mt-4 mb-2">Costi Variabili</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Metodo</TableHead>
                                    <TableHead>Valore</TableHead>
                                    <TableHead>Canale Ricavo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {planData.variableCosts.map((c: VariableCost) => {
                                    const isCurrency = c.calculationMethod === '€ per Contratto';
                                    const formatValue = (val: number) => isCurrency ? formatCurrency(val) : formatPercentage(val);
                                    const totalValue = c.subItems && c.subItems.length > 0 ? c.subItems.reduce((acc, si) => acc + si.value, 0) : c.value;

                                    return (
                                        <React.Fragment key={c.id}>
                                            <TableRow>
                                                <TableCell className="font-medium">{c.name}</TableCell>
                                                <TableCell>{c.calculationMethod}</TableCell>
                                                <TableCell>{formatValue(totalValue)}</TableCell>
                                                <TableCell>{c.calculationMethod === '% su Ricavi Specifici' ? c.linkedRevenueChannel : '---'}</TableCell>
                                            </TableRow>
                                            {c.subItems?.map(si => (
                                                <TableRow key={si.id} className="bg-muted/50">
                                                    <TableCell className="pl-8 text-muted-foreground">{si.name}</TableCell>
                                                    <TableCell></TableCell>
                                                    <TableCell>{formatValue(si.value)}</TableCell>
                                                    <TableCell></TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <h4 className="font-bold mt-4 mb-2">Investimenti Iniziali</h4>
                        <Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Costo</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {planData.initialInvestments.map(c => (
                                    <React.Fragment key={c.id}>
                                        <TableRow>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell>{formatCurrency(c.subItems && c.subItems.length > 0 ? c.subItems.reduce((acc, si) => acc + si.cost, 0) : c.cost)}</TableCell>
                                        </TableRow>
                                        {c.subItems?.map(si => (
                                            <TableRow key={si.id} className="bg-muted/50"><TableCell className="pl-8 text-muted-foreground">{si.name}</TableCell><TableCell>{formatCurrency(si.cost)}</TableCell></TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </Section>

                    <Section title="4. Conto Economico Previsionale"><IncomeStatement data={financialSummary} /></Section>
                    <Section title="5. Flusso di Cassa Previsionale"><CashFlowStatement data={cashFlowSummary} /></Section>
                </main>
            </div>
        </div>
    );
};

export default ScenarioReport;
