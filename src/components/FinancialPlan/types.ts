
export interface GeneralAssumptions {
  companyName: string;
  timeHorizon: number;
  startDate: string;
  inflationRate: number;
  iresRate: number;
  irapRate: number;
  equityInjection: number;
  daysToCollectReceivables: number;
  daysToPayPayables: number;

  // Campi aggiunti
  scenarioName: string;
  initialLoanAmount: number;
  loanInterestRate: number;
  loanDurationMonths: number;
  minimumCashBuffer: number;
  annualNewRevenueGrowthRate: number;
  customerChurnRate: number;
  averageVatRate: number;
  vatPaymentFrequency: 'Mensile' | 'Trimestrale';
  dividendDistributionPolicy: number;
  dividendDistributionStartYear: number;
  terminalValueMethod: 'Multiplo EBITDA' | 'Crescita Perpetua';
  exitMultiple: number;
  wacc: number;
  currency: 'EUR' | 'USD' | 'GBP';
}

export interface RecoverableClient {
  id: string;
  name: string;
  previousAnnualRevenue: number;
  recoveryProbability: number;
  contractStartDateMonth: number;
  serviceType: 'ricorrente' | 'una_tantum';
  recoveryAmountPercentage: number;
  annualIncreasePercentage: number;
  contractDurationMonths?: number;
  renewalProbability?: number;
  activationRampUpMonths?: number;
  specificCollectionDays?: number;
}

export interface NewClientAcquisition {
  id: string;
  channel: string;
  monthlyMarketingInvestment: number;
  leadsPer100Invested: number;
  conversionRate: number;
  averageAnnualContractValue: number;
  startMonth: number;
}

export interface DirectlyAcquiredClient {
  id: string;
  name: string;
  numberOfClients: number;
  startMonth: number;
  serviceType: 'ricorrente' | 'una_tantum';
  annualContractValue: number;
  monthlyContractValue: number;
}

export interface PersonnelCost {
  id: string;
  role: string;
  contractType: 'Dipendente' | 'Freelance/P.IVA' | 'Compenso Amministratore';
  hiringMonth: number;
  endMonth?: number;

  // For 'Dipendente'
  annualGrossSalary?: number;
  companyCostCoefficient?: number;
  annualSalaryIncrease?: number;
  bonusType?: 'Nessuno' | '% su EBITDA' | '% su Utile Netto' | 'Importo Fisso Annuo';
  bonusValue?: number;

  // For 'Freelance/P.IVA' & 'Compenso Amministratore'
  monthlyCost?: number;
}

export interface FixedCost {
  id: string;
  name: string;
  monthlyCost: number;
  startMonth: number;
  indexedToInflation: boolean;
  paymentFrequency: 'Mensile' | 'Trimestrale' | 'Semestrale' | 'Annuale';
  subItems?: {
    id: string;
    name: string;
    monthlyCost: number;
  }[];
}

export interface VariableCost {
  id: string;
  name: string;
  calculationMethod: '% su Ricavi Totali' | '% su Ricavi Specifici' | '€ per Contratto';
  value: number;
  linkedRevenueChannel?: 'recoverable' | 'new' | 'direct';
  subItems?: {
    id: string;
    name: string;
    value: number; // Changed from percentageOnRevenue
  }[];
}

export interface InitialInvestment {
  id: string;
  name: string;
  cost: number;
  investmentMonth: number;
  amortizationYears: number;
  paymentMethod: 'Unica Soluzione' | 'Rateizzato';
  installments?: number;
  subItems?: {
    id: string;
    name: string;
    cost: number;
  }[];
}

export interface FinancialPlanState {
  general: GeneralAssumptions;
  recoverableClients: RecoverableClient[];
  newClients: NewClientAcquisition[];
  directlyAcquiredClients: DirectlyAcquiredClient[];
  personnelCosts: PersonnelCost[];
  fixedCosts: FixedCost[];
  variableCosts: VariableCost[];
  initialInvestments: InitialInvestment[];
}

export interface YearlyData {
  year: number;
  revenues: number;
  recoverableClientRevenues: number;
  newClientRevenues: number;
  directlyAcquiredClientRevenues: number;
  personnelCosts: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  ebitda: number;
  amortization: number;
  ebit: number;
  interestExpense: number;
  ebt: number;
  taxes: number;
  netProfit: number;
  loanPrincipalRepayment: number;
  weightedAverageCollectionDays?: number;
  contributionMarginPercentage: number;
  ebitdaMargin: number;
  ebitMargin: number;
  netProfitMargin: number;
}

export interface CashFlowYearlyData {
  year: number;
  netProfit: number;
  amortization: number;
  grossOperatingCashFlow: number;
  changeInWorkingCapital: number;
  cashFlowFromOperations: number;
  capex: number;
  cashFlowFromInvesting: number;
  equityInjection: number;
  loanProceeds: number;
  loanPrincipalRepayment: number;
  dividendsPaid: number;
  cashFlowFromFinancing: number;
  netCashFlow: number;
  startingCash: number;
  endingCash: number;
}
