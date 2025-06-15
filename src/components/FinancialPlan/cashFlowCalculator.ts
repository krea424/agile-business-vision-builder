
import { FinancialPlanState, YearlyData, CashFlowYearlyData } from './types';

export function calculateCashFlowSummary(plan: FinancialPlanState, incomeStatement: YearlyData[]): CashFlowYearlyData[] {
  if (!plan.general || incomeStatement.length === 0) {
    return [];
  }

  const { general, initialInvestments } = plan;
  const cashFlowSummary: CashFlowYearlyData[] = [];

  const totalInvestment = initialInvestments.reduce((sum, item) => sum + item.cost, 0);

  let previousYearEndingCash = 0;
  let previousYearAccountsReceivable = 0;
  let previousYearAccountsPayable = 0;

  for (const yearData of incomeStatement) {
    const { year, netProfit, amortization, revenues, fixedCosts, variableCosts, marketingCosts } = yearData;

    // FLUSSO DI CASSA OPERATIVO LORDO
    const grossOperatingCashFlow = netProfit + amortization;
    
    // VARIAZIONE CAPITALE CIRCOLANTE
    // Calcolo dei crediti verso clienti per l'anno corrente
    const currentAccountsReceivable = revenues * (general.daysToCollectReceivables / 365);
    
    // Calcolo dei debiti verso fornitori per l'anno corrente
    // I costi verso fornitori includono costi fissi, variabili e di marketing
    const supplierCosts = fixedCosts + variableCosts + marketingCosts;
    const currentAccountsPayable = supplierCosts * (general.daysToPayPayables / 365);

    // Variazione dei componenti del capitale circolante
    const changeInReceivables = currentAccountsReceivable - previousYearAccountsReceivable;
    const changeInPayables = currentAccountsPayable - previousYearAccountsPayable;
    
    // Un aumento dei crediti è un impiego di cassa (impatto negativo).
    // Un aumento dei debiti è una fonte di cassa (impatto positivo).
    const changeInWorkingCapital = changeInPayables - changeInReceivables;


    // FLUSSO DI CASSA DA ATTIVITÀ OPERATIVA (A)
    const cashFlowFromOperations = grossOperatingCashFlow + changeInWorkingCapital;

    // FLUSSO DI CASSA DA ATTIVITÀ DI INVESTIMENTO (B)
    // Capex is a cash outflow, happens in year 1
    const capex = (year === 1) ? -totalInvestment : 0;
    const cashFlowFromInvesting = capex;
    
    // FLUSSO DI CASSA DA ATTIVITÀ FINANZIARIA (C)
    // Equity injection happens in year 1
    const equityInjectionInYear = (year === 1) ? general.equityInjection : 0;
    const cashFlowFromFinancing = equityInjectionInYear; // Will add debt later if needed

    // FLUSSO DI CASSA NETTO DEL PERIODO (A+B+C)
    const netCashFlow = cashFlowFromOperations + cashFlowFromInvesting + cashFlowFromFinancing;

    // CASSA INIZIALE E FINALE
    const startingCash = previousYearEndingCash;
    const endingCash = startingCash + netCashFlow;

    cashFlowSummary.push({
      year,
      netProfit,
      amortization,
      grossOperatingCashFlow,
      changeInWorkingCapital,
      cashFlowFromOperations,
      capex,
      cashFlowFromInvesting,
      equityInjection: equityInjectionInYear,
      cashFlowFromFinancing,
      netCashFlow,
      startingCash,
      endingCash,
    });

    // Update for next iteration
    previousYearEndingCash = endingCash;
    previousYearAccountsReceivable = currentAccountsReceivable;
    previousYearAccountsPayable = currentAccountsPayable;
  }

  return cashFlowSummary;
}
