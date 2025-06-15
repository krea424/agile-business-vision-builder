
import { FinancialPlanState } from './types';

export const initialPlanState: FinancialPlanState = {
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
