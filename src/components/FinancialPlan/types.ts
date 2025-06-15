export interface GeneralAssumptions {
  timeHorizon: number;
  startDate: string;
  inflationRate: number;
  iresRate: number;
  irapRate: number;
}

export interface RecoverableClient {
  id: string;
  name: string;
  previousAnnualRevenue: number;
  recoveryProbability: number;
  contractStartDateMonth: number;
  serviceType: 'ricorrente' | 'una_tantum';
  recoveryAmountPercentage: number;
}

export interface NewClientAcquisition {
  id: string;
  channel: string;
  monthlyMarketingInvestment: number;
  leadsPer100Invested: number;
  conversionRate: number;
  averageAnnualContractValue: number;
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
}

export interface FinancialPlanState {
  general: GeneralAssumptions;
  recoverableClients: RecoverableClient[];
  newClients: NewClientAcquisition[];
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
