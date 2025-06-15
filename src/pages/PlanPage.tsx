import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { GeneralAssumptions } from '@/components/FinancialPlan/GeneralAssumptions';
import { RecoverableClients } from '@/components/FinancialPlan/RecoverableClients';
import { NewClients } from '@/components/FinancialPlan/NewClients';
import { DirectlyAcquiredClients } from '@/components/FinancialPlan/DirectlyAcquiredClients';
import { PersonnelCosts } from '@/components/FinancialPlan/PersonnelCosts';
import { FixedCosts } from '@/components/FinancialPlan/FixedCosts';
import { VariableCosts } from '@/components/FinancialPlan/VariableCosts';
import { Investments } from '@/components/FinancialPlan/Investments';
import { IncomeStatement } from '@/components/FinancialPlan/IncomeStatement';
import { calculateFinancialSummary } from '@/components/FinancialPlan/financialCalculator';
import { CashFlowStatement } from '@/components/FinancialPlan/CashFlowStatement';
import { calculateCashFlowSummary } from '@/components/FinancialPlan/cashFlowCalculator';
import { calculateDashboardData } from '@/components/FinancialPlan/dashboardCalculator';
import { Button } from "@/components/ui/button";
import { Save, Home, ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Stepper } from '@/components/ui/stepper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialPlanState: FinancialPlanState = {
  general: {
    companyName: 'Nome Azienda Esempio',
    timeHorizon: 5,
    startDate: 'set-25',
    inflationRate: 3.0,
    iresRate: 24.0,
    irapRate: 3.9,
    equityInjection: 100000,
    daysToCollectReceivables: 60,
    daysToPayPayables: 30,
    // Campi aggiunti
    scenarioName: 'Caso Base',
    initialLoanAmount: 50000,
    loanInterestRate: 5,
    loanDurationMonths: 60,
    minimumCashBuffer: 10000,
    annualNewRevenueGrowthRate: 10,
    customerChurnRate: 5,
    averageVatRate: 22,
    vatPaymentFrequency: 'Trimestrale',
    dividendDistributionPolicy: 0,
    dividendDistributionStartYear: 3,
    terminalValueMethod: 'Multiplo EBITDA',
    exitMultiple: 5,
    wacc: 8,
    currency: 'EUR',
  },
  recoverableClients: [
    { id: '1', name: 'yardreaas', previousAnnualRevenue: 400000, recoveryProbability: 80, contractStartDateMonth: 3, serviceType: 'ricorrente', recoveryAmountPercentage: 30, annualIncreasePercentage: 0, contractDurationMonths: 24, renewalProbability: 50, activationRampUpMonths: 0, specificCollectionDays: 90 },
  ],
  newClients: [
      { id: '1', channel: 'Commerciale', monthlyMarketingInvestment: 1000, leadsPer100Invested: 5, conversionRate: 10, averageAnnualContractValue: 15000, startMonth: 1 },
  ],
  directlyAcquiredClients: [],
  personnelCosts: [
    { id: '1', role: 'Founder & CEO', contractType: 'Compenso Amministratore', monthlyCost: 2000, hiringMonth: 1, annualSalaryIncrease: 5 },
    { id: '2', role: 'Sviluppatore Senior', contractType: 'Dipendente', annualGrossSalary: 45000, companyCostCoefficient: 1.6, hiringMonth: 3, endMonth: 27, annualSalaryIncrease: 3, bonusType: '% su EBITDA', bonusValue: 2 },
    { id: '3', role: 'Marketing Specialist', contractType: 'Freelance/P.IVA', monthlyCost: 1500, hiringMonth: 1 },
  ],
  fixedCosts: [
    { id: '1', name: 'Affitto ufficio', monthlyCost: 1000, startMonth: 1, indexedToInflation: true, paymentFrequency: 'Mensile' },
    { id: '2', name: 'Licenze Software', monthlyCost: 300, startMonth: 1, indexedToInflation: false, paymentFrequency: 'Annuale' },
  ],
  variableCosts: [
    { id: '1', name: 'Commissioni su vendite dirette', calculationMethod: '% su Ricavi Specifici', value: 10, linkedRevenueChannel: 'direct' },
    { id: '2', name: 'Costi piattaforma per contratto', calculationMethod: '€ per Contratto', value: 50 },
  ],
  initialInvestments: [
    { id: '1', name: 'Costi di costituzione', cost: 2000, investmentMonth: 1, amortizationYears: 5, paymentMethod: 'Unica Soluzione' },
    { id: '2', name: 'Sviluppo Piattaforma', cost: 15000, investmentMonth: 1, amortizationYears: 3, paymentMethod: 'Unica Soluzione' },
    { id: '3', name: 'Rinnovo Hardware (Anno 3)', cost: 5000, investmentMonth: 25, amortizationYears: 3, paymentMethod: 'Rateizzato', installments: 10 },
  ],
};

const LOCAL_STORAGE_KEY = 'financial-plan-data';

const PlanPage = () => {
  const [planData, setPlanData] = useState<FinancialPlanState>(() => {
    if (typeof window === 'undefined') {
      return initialPlanState;
    }
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // A simple check to ensure data is somewhat valid before using
        if (parsedData.general && parsedData.recoverableClients) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error("Error reading financial plan data from localStorage", error);
    }
    return initialPlanState;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planData));
    }
  }, [planData]);
  
  const steps = ['Generali', 'Ricavi', 'Costi', 'C. Economico', 'Flusso di Cassa'];
  const tabMapping = ['general', 'revenues', 'costs', 'income', 'cashflow'];
  const [activeStep, setActiveStep] = useState(0);
  const activeTab = tabMapping[activeStep];

  const handleNext = () => {
      if (activeStep < steps.length - 1) {
          setActiveStep(prev => prev + 1);
      }
  };

  const handlePrev = () => {
      if (activeStep > 0) {
          setActiveStep(prev => prev - 1);
      }
  };

  const setGeneral = (data: FinancialPlanState['general']) => setPlanData(prev => ({...prev, general: data}));
  const setRecoverableClients = (data: FinancialPlanState['recoverableClients']) => setPlanData(prev => ({...prev, recoverableClients: data}));
  const setNewClients = (data: FinancialPlanState['newClients']) => setPlanData(prev => ({...prev, newClients: data}));
  const setDirectlyAcquiredClients = (data: FinancialPlanState['directlyAcquiredClients']) => setPlanData(prev => ({...prev, directlyAcquiredClients: data}));
  const setPersonnelCosts = (data: FinancialPlanState['personnelCosts']) => setPlanData(prev => ({...prev, personnelCosts: data}));
  const setFixedCosts = (data: FinancialPlanState['fixedCosts']) => setPlanData(prev => ({...prev, fixedCosts: data}));
  const setVariableCosts = (data: FinancialPlanState['variableCosts']) => setPlanData(prev => ({...prev, variableCosts: data}));
  const setInitialInvestments = (data: FinancialPlanState['initialInvestments']) => setPlanData(prev => ({...prev, initialInvestments: data}));

  const financialSummary = useMemo(() => {
    try {
      return calculateFinancialSummary(planData);
    } catch (error) {
      console.error("Error calculating financial summary:", error);
      return [];
    }
  }, [planData]);

  const cashFlowSummary = useMemo(() => {
    try {
      return calculateCashFlowSummary(planData, financialSummary);
    } catch (error) {
      console.error("Error calculating cash flow summary:", error);
      return [];
    }
  }, [planData, financialSummary]);

  const dashboardData = useMemo(() => {
    try {
      return calculateDashboardData(planData, financialSummary, cashFlowSummary);
    } catch (error) {
      console.error("Error calculating dashboard data:", error);
      return { kpis: {}, monthlyChartData: [], automatedInsights: [] };
    }
  }, [planData, financialSummary, cashFlowSummary]);

  const navigate = useNavigate();
  const handleExport = () => navigate('/report', { state: { planData, financialSummary, cashFlowSummary, dashboardData } });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-background dark:from-black/10 dark:via-background dark:to-background">
      <div className="container mx-auto p-4 md:p-8 lg:p-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Financial Sustainability Plan</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Simulatore di volo per testare le decisioni strategiche.</p>
        </header>
        
        <div className="mb-12">
            <Stepper steps={steps} currentStep={activeStep} />
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrev} disabled={activeStep === 0} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
            </Button>
            {activeStep < steps.length - 1 ? (
                 <Button onClick={handleNext}>
                     Avanti <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
            ) : (
                 <Button onClick={handleExport}>
                     <Save className="mr-2 h-4 w-4" /> Salva ed Esporta Scenario
                 </Button>
            )}
           </div>
        </div>

        <Tabs value={activeTab} className="w-full">
          <TabsContent value="general">
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>1. Ipotesi Generali</AlertTitle>
                <AlertDescription>
                    Benvenuto! Inizia da qui. Inserisci le assunzioni di base per il tuo piano. Questi dati influenzeranno tutti i calcoli successivi. Pensa a questo come alle fondamenta della tua casa finanziaria.
                </AlertDescription>
            </Alert>
            <GeneralAssumptions data={planData.general} setData={setGeneral} />
          </TabsContent>

          <TabsContent value="revenues" className="space-y-6">
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>2. Previsione dei Ricavi</AlertTitle>
                <AlertDescription>
                    <p>Come genererà entrate la tua azienda? Definisci qui le diverse fonti di ricavo.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                        <li><strong>Clienti da Recuperare:</strong> Clienti persi che potresti riconquistare.</li>
                        <li><strong>Nuovi Clienti (da Canali Strutturati):</strong> Acquisizione tramite marketing e vendite.</li>
                        <li><strong>Nuovi Clienti (Acquisiti Direttamente):</strong> Contatti diretti, passaparola, ecc.</li>
                    </ul>
                </AlertDescription>
            </Alert>
            <RecoverableClients data={planData.recoverableClients} setData={setRecoverableClients} />
            <NewClients data={planData.newClients} setData={setNewClients} />
            <DirectlyAcquiredClients data={planData.directlyAcquiredClients} setData={setDirectlyAcquiredClients} />
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>3. Struttura dei Costi</AlertTitle>
                <AlertDescription>
                    <p>Quali sono le spese necessarie per far funzionare la tua attività? Suddividile qui.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                        <li><strong>Personale:</strong> Il costo del tuo team. Il "Costo Azienda" è circa 1.6 volte la Retribuzione Annua Lorda (RAL) per i dipendenti.</li>
                        <li><strong>Costi Fissi:</strong> Spese che non cambiano con il volume delle vendite (es. affitto, software).</li>
                        <li><strong>Costi Variabili:</strong> Spese legate direttamente ai ricavi (es. commissioni).</li>
                        <li><strong>Investimenti:</strong> Acquisti di beni durevoli che vengono ammortizzati nel tempo.</li>
                    </ul>
                </AlertDescription>
            </Alert>
            <PersonnelCosts data={planData.personnelCosts} setData={setPersonnelCosts} />
            <FixedCosts data={planData.fixedCosts} setData={setFixedCosts} />
            <VariableCosts data={planData.variableCosts} setData={setVariableCosts} />
            <Investments data={planData.initialInvestments} setData={setInitialInvestments} />
          </TabsContent>

          <TabsContent value="income">
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>4. Conto Economico Previsionale</AlertTitle>
                <AlertDescription>
                    Questo è il riassunto della performance economica del tuo business. Mostra la differenza tra ricavi e costi, portando all'utile o alla perdita. Non puoi modificare direttamente questa tabella, è calcolata automaticamente.
                </AlertDescription>
            </Alert>
            <IncomeStatement data={financialSummary} />
          </TabsContent>

          <TabsContent value="cashflow">
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>5. Flusso di Cassa Previsionale</AlertTitle>
                <AlertDescription>
                    Qui vedi l'effettivo movimento di denaro (entrate e uscite). È fondamentale per capire la liquidità e la sostenibilità finanziaria. La cassa è il re! Questa tabella è calcolata automaticamente.
                </AlertDescription>
            </Alert>
            <CashFlowStatement data={cashFlowSummary} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlanPage;
