
import { FinancialPlanState, YearlyData, CashFlowYearlyData } from './types';

export function calculateCashFlowSummary(plan: FinancialPlanState, incomeStatement: YearlyData[]): CashFlowYearlyData[] {
  if (!plan.general || incomeStatement.length === 0) {
    return [];
  }

  const { general, initialInvestments } = plan;
  const cashFlowSummary: CashFlowYearlyData[] = [];

  const totalInvestment = initialInvestments.reduce((sum, item) => sum + item.cost, 0);

  let previousYearEndingCash = 0;

  for (const yearData of incomeStatement) {
    const { year, netProfit, amortization } = yearData;

    // FLUSSO DI CASSA OPERATIVO LORDO
    const grossOperatingCashFlow = netProfit + amortization;
    
    // VARIAZIONE CAPITALE CIRCOLANTE
    // As per user request, this is 0 for now.
    const changeInWorkingCapital = 0;

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
  }

  return cashFlowSummary;
}
