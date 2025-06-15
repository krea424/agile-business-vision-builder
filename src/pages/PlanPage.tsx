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
import { Save, Home, ArrowLeft, ArrowRight, Info, FileText, Presentation, FileDown, Loader2 } from "lucide-react";
import { Stepper } from '@/components/ui/stepper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';

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

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(value)) return "N/A";
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};

const exportToExcel = (planData: FinancialPlanState, financialSummary: any[], cashFlowSummary: any[]) => {
    const wb = XLSX.utils.book_new();

    const generalData = Object.entries(planData.general).map(([key, value]) => ({ 'Proprietà': key, 'Valore': value }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generalData), "Assunzioni Generali");
    
    if(planData.recoverableClients.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.recoverableClients), "Clienti da Recuperare");
    if(planData.newClients.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.newClients), "Nuovi Clienti");
    if(planData.directlyAcquiredClients.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.directlyAcquiredClients), "Clienti Diretti");
    if(planData.personnelCosts.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.personnelCosts), "Costi Personale");
    if(planData.fixedCosts.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.fixedCosts), "Costi Fissi");
    if(planData.variableCosts.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.variableCosts), "Costi Variabili");
    if(planData.initialInvestments.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.initialInvestments), "Investimenti");
    
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(financialSummary), "Conto Economico");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cashFlowSummary), "Flusso di Cassa");

    XLSX.writeFile(wb, `${planData.general.scenarioName.replace(/ /g, '_')}_Export.xlsx`);
};

const exportToPptx = (planData: FinancialPlanState, dashboardData: any) => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    const slide1 = pptx.addSlide();
    slide1.addText(`Report Finanziario: ${planData.general.companyName}`, { x: 0.5, y: 1.5, fontSize: 32, bold: true, color: '003366' });
    slide1.addText(`Scenario: ${planData.general.scenarioName}`, { x: 0.5, y: 2.5, fontSize: 22, color: '333333' });
    slide1.addText(`Data: ${new Date().toLocaleDateString('it-IT')}`, { x: 0.5, y: 5.0, fontSize: 14, color: '888888' });

    const slide2 = pptx.addSlide();
    slide2.addText('Executive Summary - Metriche Chiave', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: '003366' });
    const kpis = dashboardData.kpis;
    const kpiText = [
        { text: 'Fabbisogno Finanziario: ', options: { bold: true } },
        { text: formatCurrency(kpis.peakFundingRequirement) },
        { text: '\nValore d\'Impresa (a 5 anni): ', options: { bold: true } },
        { text: formatCurrency(kpis.enterpriseValue) },
        { text: '\nIRR: ', options: { bold: true } },
        { text: `${kpis.irr ? (kpis.irr * 100).toFixed(1) : 'N/A'}%` },
        { text: '\nPayback Period: ', options: { bold: true } },
        { text: kpis.paybackPeriodYears ? `${kpis.paybackPeriodYears.toFixed(1)} Anni` : 'N/A' },
        { text: '\nBreak-Even Point (EBITDA): ', options: { bold: true } },
        { text: kpis.breakEvenMonth ? `Mese ${kpis.breakEvenMonth}` : 'Non raggiunto' },
    ];
    slide2.addText(kpiText, { x: 1, y: 1.5, w: '80%', h: 3, fontSize: 16, charSpacing: 1, lineSpacing: 28 });
    slide2.addText('Nota: I grafici e le tabelle dettagliate non sono inclusi in questa esportazione base.', { x: 0.5, y: 5, fontSize: 12, color: 'C00000' });
    
    pptx.writeFile({ fileName: `${planData.general.scenarioName.replace(/ /g, '_')}_Report.pptx` });
};

const ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  planData: FinancialPlanState;
  financialSummary: any[];
  cashFlowSummary: any[];
  dashboardData: any;
};

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, planData, financialSummary, cashFlowSummary, dashboardData }) => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState<null | 'excel' | 'pptx'>(null);

    const handleExport = async (type: 'excel' | 'pptx') => {
        setIsGenerating(type);
        // a small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
            if (type === 'excel') {
                exportToExcel(planData, financialSummary, cashFlowSummary);
            } else if (type === 'pptx') {
                exportToPptx(planData, dashboardData);
            }
        } catch (error) {
            console.error(`Error generating ${type} file:`, error);
        } finally {
            setIsGenerating(null);
            onClose();
        }
    };
    
    const handlePdfExport = () => {
        navigate('/report', { state: { planData, financialSummary, cashFlowSummary, dashboardData, autoPrint: true } });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Esporta Scenario Professionale</DialogTitle>
                    <DialogDescription>
                        Scegli il formato per il tuo report. Questa è una funzionalità premium per presentare i tuoi dati in modo efficace.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                    <Button onClick={handlePdfExport} variant="outline"><FileText className="mr-2"/> PDF Executive Summary</Button>
                    <Button onClick={() => handleExport('pptx')} variant="outline" disabled={isGenerating !== null}>
                        {isGenerating === 'pptx' ? <Loader2 className="mr-2 animate-spin" /> : <Presentation className="mr-2" />}
                        Presentazione PowerPoint (.pptx)
                    </Button>
                    <Button onClick={() => handleExport('excel')} variant="outline" disabled={isGenerating !== null}>
                        {isGenerating === 'excel' ? <Loader2 className="mr-2 animate-spin" /> : <FileDown className="mr-2" />}
                        File Excel Dettagliato (.xlsx)
                    </Button>
                </div>
                <DialogFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">L'esportazione di PPTX e Excel potrebbe richiedere alcuni secondi.</p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

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
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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
  const handleExport = () => setIsExportDialogOpen(true);

  return (
    <>
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
      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        planData={planData}
        financialSummary={financialSummary}
        cashFlowSummary={cashFlowSummary}
        dashboardData={dashboardData}
      />
    </>
  );
};

export default PlanPage;
