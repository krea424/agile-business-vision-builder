import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { GeneralAssumptions } from '@/components/FinancialPlan/GeneralAssumptions';
import { RecoverableClients } from '@/components/FinancialPlan/RecoverableClients';
import { NewClients } from '@/components/FinancialPlan/NewClients';
import { DirectlyAcquiredClients } from '@/components/FinancialPlan/DirectlyAcquiredClients';
import { PersonnelCosts } from '@/components/FinancialPlan/PersonnelCosts';
import { OperationalInvestments } from '@/components/FinancialPlan/OperationalInvestments';
import { IncomeStatement } from '@/components/FinancialPlan/IncomeStatement';
import { calculateFinancialSummary } from '@/components/FinancialPlan/financialCalculator';
import { CashFlowStatement } from '@/components/FinancialPlan/CashFlowStatement';
import { calculateCashFlowSummary } from '@/components/FinancialPlan/cashFlowCalculator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, Save } from "lucide-react";

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
    { id: '1', role: 'Visurista Esperto 1', netMonthlySalary: 1600, ralCoefficient: 17.375, annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '2', role: 'Visurista Esperto 2', netMonthlySalary: 1600, ralCoefficient: 17.375, annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '3', role: 'Visurista Esperto 3', netMonthlySalary: 1600, ralCoefficient: 17.375, annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '4', role: 'Visurista Esperto 4', netMonthlySalary: 1600, ralCoefficient: 17.375, annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 4 },
    { id: '5', role: 'Amministrativo', netMonthlySalary: 1600, ralCoefficient: 17.375, annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '6', role: 'Direttore Operativo (Founder)', netMonthlySalary: 1200, ralCoefficient: 15, annualGrossSalary: 18000, companyCostCoefficient: 1.0, hiringMonth: 7 },
    { id: '7', role: 'Commerciale (Founder)', netMonthlySalary: 1200, ralCoefficient: 15, annualGrossSalary: 18000, companyCostCoefficient: 1.0, hiringMonth: 7 },
  ],
  fixedCosts: [
    { id: '1', name: 'Affitto ufficio', monthlyCost: 1000, startMonth: 1 },
    { id: '2', name: 'Utenze', monthlyCost: 300, startMonth: 1 },
    { id: '3', name: 'Servizio Cloud', monthlyCost: 300, startMonth: 1 },
    { id: '4', name: 'Licenze Software', monthlyCost: 300, startMonth: 1 },
    { id: '5', name: 'Commercialista', monthlyCost: 250, startMonth: 1 },
    { id: '6', name: 'Consulente del Lavoro', monthlyCost: 150, startMonth: 1 },
  ],
  variableCosts: [],
  initialInvestments: [
    { id: '1', name: 'Costi di costituzione', cost: 2000 },
    { id: '2', name: 'Sviluppo sito web', cost: 2000 },
    { id: '3', name: 'Arredo', cost: 2000 },
    { id: '4', name: 'Computer', cost: 2000 },
    { id: '5', name: 'Deposito cauzione ufficio', cost: 2000 },
  ],
};

const LOCAL_STORAGE_KEY = 'financial-plan-data';

const Index = () => {
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
  
  const [activeTab, setActiveTab] = useState('general');

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

  const navigate = useNavigate();
  const handleExport = () => navigate('/report', { state: { planData, financialSummary, cashFlowSummary } });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-background dark:from-black/10 dark:via-background dark:to-background">
      <div className="container mx-auto p-4 md:p-8 lg:p-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Financial Sustainability Plan</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Il suo simulatore di volo per testare le decisioni strategiche.</p>
        </header>
        
        <div className="flex justify-between items-center mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Menu className="mr-2 h-4 w-4" /> Seleziona Sezione
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setActiveTab('general')}>1. Generali</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('revenues')}>2. Ricavi</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('costs')}>3. Costi</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('income')}>4. C. Economico</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setActiveTab('cashflow')}>5. Flusso di Cassa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleExport}>
            <Save className="mr-2 h-4 w-4" /> Salva ed Esporta Scenario
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="general">
            <GeneralAssumptions data={planData.general} setData={setGeneral} />
          </TabsContent>

          <TabsContent value="revenues" className="space-y-6">
            <RecoverableClients data={planData.recoverableClients} setData={setRecoverableClients} />
            <NewClients data={planData.newClients} setData={setNewClients} />
            <DirectlyAcquiredClients data={planData.directlyAcquiredClients} setData={setDirectlyAcquiredClients} />
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <PersonnelCosts data={planData.personnelCosts} setData={setPersonnelCosts} />
            <OperationalInvestments 
                fixedCosts={planData.fixedCosts}
                variableCosts={planData.variableCosts}
                initialInvestments={planData.initialInvestments}
                setFixedCosts={setFixedCosts}
                setVariableCosts={setVariableCosts}
                setInitialInvestments={setInitialInvestments}
            />
          </TabsContent>

          <TabsContent value="income">
            <IncomeStatement data={financialSummary} />
          </TabsContent>

          <TabsContent value="cashflow">
            <CashFlowStatement data={cashFlowSummary} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
