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
  annualGrossSalary: number;
  companyCostCoefficient: number;
  hiringMonth: number;
}

export interface FixedCost {
  id: string;
  name: string;
  monthlyCost: number;
  startMonth: number;
}

export interface VariableCost {
  id: string;
  name: string;
  percentageOnRevenue: number;
}

export interface InitialInvestment {
  id: string;
  name: string;
  cost: number;
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
  taxes: number;
  netProfit: number;
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
  cashFlowFromFinancing: number;
  netCashFlow: number;
  startingCash: number;
  endingCash: number;
}
