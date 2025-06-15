
import { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { GeneralAssumptions } from '@/components/FinancialPlan/GeneralAssumptions';
import { RecoverableClients } from '@/components/FinancialPlan/RecoverableClients';
import { NewClients } from '@/components/FinancialPlan/NewClients';
import { PersonnelCosts } from '@/components/FinancialPlan/PersonnelCosts';
import { OperationalInvestments } from '@/components/FinancialPlan/OperationalInvestments';
import { IncomeStatement } from '@/components/FinancialPlan/IncomeStatement';
import { calculateFinancialSummary } from '@/components/FinancialPlan/financialCalculator';
import { CashFlowStatement } from '@/components/FinancialPlan/CashFlowStatement';
import { calculateCashFlowSummary } from '@/components/FinancialPlan/cashFlowCalculator';

const initialPlanState: FinancialPlanState = {
  general: {
    timeHorizon: 5,
    startDate: 'set-25',
    inflationRate: 3.0,
    iresRate: 24.0,
    irapRate: 3.9,
    equityInjection: 100000,
    daysToCollectReceivables: 60,
    daysToPayPayables: 30,
  },
  recoverableClients: [
    { id: '1', name: 'yardreaas', previousAnnualRevenue: 400000, recoveryProbability: 80, contractStartDateMonth: 3, serviceType: 'ricorrente', recoveryAmountPercentage: 30 },
  ],
  newClients: [
      { id: '1', channel: 'Commerciale', monthlyMarketingInvestment: 1000, leadsPer100Invested: 5, conversionRate: 10, averageAnnualContractValue: 15000 },
  ],
  personnelCosts: [
    { id: '1', role: 'Visurista Esperto 1', annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '2', role: 'Visurista Esperto 2', annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '3', role: 'Visurista Esperto 3', annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '4', role: 'Visurista Esperto 4', annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 4 },
    { id: '5', role: 'Amministrativo', annualGrossSalary: 27800, companyCostCoefficient: 1.5, hiringMonth: 1 },
    { id: '6', role: 'Direttore Operativo (Founder)', annualGrossSalary: 18000, companyCostCoefficient: 1.0, hiringMonth: 7 },
    { id: '7', role: 'Commerciale (Founder)', annualGrossSalary: 18000, companyCostCoefficient: 1.0, hiringMonth: 7 },
  ],
  fixedCosts: [
    { id: '1', name: 'Affitto ufficio', monthlyCost: 1000 },
    { id: '2', name: 'Utenze', monthlyCost: 300 },
    { id: '3', name: 'Servizio Cloud', monthlyCost: 300 },
    { id: '4', name: 'Licenze Software', monthlyCost: 300 },
    { id: '5', name: 'Commercialista', monthlyCost: 250 },
    { id: '6', name: 'Consulente del Lavoro', monthlyCost: 150 },
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

const Index = () => {
  const [planData, setPlanData] = useState<FinancialPlanState>(initialPlanState);

  const setGeneral = (data: FinancialPlanState['general']) => setPlanData(prev => ({...prev, general: data}));
  const setRecoverableClients = (data: FinancialPlanState['recoverableClients']) => setPlanData(prev => ({...prev, recoverableClients: data}));
  const setNewClients = (data: FinancialPlanState['newClients']) => setPlanData(prev => ({...prev, newClients: data}));
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


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-background dark:from-black/10 dark:via-background dark:to-background">
      <div className="container mx-auto p-4 md:p-8 lg:p-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Financial Sustainability Plan</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Il suo simulatore di volo per testare le decisioni strategiche.</p>
        </header>
        
        <Accordion type="single" collapsible className="w-full space-y-6" defaultValue='item-1'>
          <AccordionItem value="item-1" className="border-none overflow-hidden rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="text-lg md:text-xl font-semibold px-6 py-4 hover:no-underline data-[state=open]:border-b">
              1. Ipotesi Generali
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <GeneralAssumptions data={planData.general} setData={setGeneral} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-none overflow-hidden rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="text-lg md:text-xl font-semibold px-6 py-4 hover:no-underline data-[state=open]:border-b">
              2. Ipotesi Ricavi
            </AccordionTrigger>
            <AccordionContent className="space-y-6 px-6 pb-6">
              <RecoverableClients data={planData.recoverableClients} setData={setRecoverableClients} />
              <NewClients data={planData.newClients} setData={setNewClients} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-none overflow-hidden rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="text-lg md:text-xl font-semibold px-6 py-4 hover:no-underline data-[state=open]:border-b">
              3. Ipotesi Costi
            </AccordionTrigger>
            <AccordionContent className="space-y-6 px-6 pb-6">
              <PersonnelCosts data={planData.personnelCosts} setData={setPersonnelCosts} />
              <OperationalInvestments 
                  fixedCosts={planData.fixedCosts}
                  variableCosts={planData.variableCosts}
                  initialInvestments={planData.initialInvestments}
                  setFixedCosts={setFixedCosts}
                  setVariableCosts={setVariableCosts}
                  setInitialInvestments={setInitialInvestments}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-none overflow-hidden rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="text-lg md:text-xl font-semibold px-6 py-4 hover:no-underline data-[state=open]:border-b">
              4. Conto Economico Proiettato
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <IncomeStatement data={financialSummary} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-none overflow-hidden rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="text-lg md:text-xl font-semibold px-6 py-4 hover:no-underline data-[state=open]:border-b">
              5. Rendiconto Finanziario Proiettato (Flusso di Cassa)
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <CashFlowStatement data={cashFlowSummary} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Index;
