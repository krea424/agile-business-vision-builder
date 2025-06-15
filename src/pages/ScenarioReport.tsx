import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { GeneralAssumptions, RecoverableClient, NewClientAcquisition, DirectlyAcquiredClient, PersonnelCost, FixedCost, VariableCost, InitialInvestment } from '@/components/FinancialPlan/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { IncomeStatement } from '@/components/FinancialPlan/IncomeStatement';
import { CashFlowStatement } from '@/components/FinancialPlan/CashFlowStatement';

const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
const formatPercentage = (value: number) => new Intl.NumberFormat('it-IT', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);

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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="mb-6 break-inside-avoid">
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const GeneralAssumptionsDisplay: React.FC<{ data: GeneralAssumptions, formatCurrency: (value: number) => string }> = ({ data, formatCurrency }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

const ScenarioReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planData, financialSummary, cashFlowSummary } = location.state || {};

    const formatCurrency = (value: number) => {
        if (typeof value !== 'number' || isNaN(value)) return '';
        return new Intl.NumberFormat('it-IT', { style: 'currency', currency: planData?.general?.currency || 'EUR' }).format(value);
    };

    if (!planData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p>Dati non disponibili per generare il report.</p>
                <Button onClick={() => navigate('/')}><ArrowLeft className="mr-2" /> Torna Indietro</Button>
            </div>
        );
    }

    const handlePrint = () => window.print();

    return (
        <div className="bg-background text-foreground min-h-screen">
            <div className="container mx-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-primary">Report Scenario Finanziario</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2" /> Indietro</Button>
                        <Button onClick={handlePrint}><Printer className="mr-2" /> Stampa</Button>
                    </div>
                </header>

                <main>
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
                            <TableHeader><TableRow><TableHead>Ruolo</TableHead><TableHead>RAL</TableHead><TableHead>Costo Azienda Annuo</TableHead><TableHead>Costo Effettivo Anno 1</TableHead></TableRow></TableHeader>
                            <TableBody>{planData.personnelCosts.map(c => <TableRow key={c.id}><TableCell>{c.role}</TableCell><TableCell>{formatCurrency(c.annualGrossSalary)}</TableCell><TableCell>{formatCurrency(calculatePersonnelAnnualCost(c))}</TableCell><TableCell>{formatCurrency(calculatePersonnelFirstYearCost(c))}</TableCell></TableRow>)}</TableBody>
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
                        <Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>% su Fatturato</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {planData.variableCosts.map(c => (
                                    <React.Fragment key={c.id}>
                                        <TableRow>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell>{formatPercentage(c.subItems && c.subItems.length > 0 ? c.subItems.reduce((acc, si) => acc + si.percentageOnRevenue, 0) : c.percentageOnRevenue)}</TableCell>
                                        </TableRow>
                                        {c.subItems?.map(si => (
                                            <TableRow key={si.id} className="bg-muted/50"><TableCell className="pl-8 text-muted-foreground">{si.name}</TableCell><TableCell>{formatPercentage(si.percentageOnRevenue)}</TableCell></TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
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
