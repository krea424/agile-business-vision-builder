
import { FinancialPlanState, YearlyData, CashFlowYearlyData } from './types';

export function calculateCashFlowSummary(plan: FinancialPlanState, incomeStatement: YearlyData[]): CashFlowYearlyData[] {
  if (!plan.general || incomeStatement.length === 0) {
    return [];
  }

  const { general, initialInvestments } = plan;
  const cashFlowSummary: CashFlowYearlyData[] = [];

  const totalInvestment = initialInvestments.reduce((total, item) => {
    const itemCost = item.subItems && item.subItems.length > 0
      ? item.subItems.reduce((sum, sub) => sum + sub.cost, 0)
      : item.cost;
    return total + itemCost;
  }, 0);

  let previousYearEndingCash = 0;
  let previousYearAccountsReceivable = 0;
  let previousYearAccountsPayable = 0;

  for (const yearData of incomeStatement) {
    const { year, netProfit, amortization, revenues, fixedCosts, variableCosts, marketingCosts, loanPrincipalRepayment } = yearData;

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
    const capex = (year === 1) ? -totalInvestment : 0;
    const cashFlowFromInvesting = capex;
    
    // FLUSSO DI CASSA DA ATTIVITÀ FINANZIARIA (C)
    const equityInjectionInYear = (year === 1) ? (general.equityInjection || 0) : 0;
    const loanProceedsInYear = (year === 1) ? (general.initialLoanAmount || 0) : 0;
    const loanPrincipalRepaymentInYear = -(loanPrincipalRepayment || 0);
    
    let dividendsPaidInYear = 0;
    if (year >= (general.dividendDistributionStartYear || 99) && netProfit > 0) {
        dividendsPaidInYear = -netProfit * ((general.dividendDistributionPolicy || 0) / 100);
    }
    
    const cashFlowFromFinancing = equityInjectionInYear + loanProceedsInYear + loanPrincipalRepaymentInYear + dividendsPaidInYear;

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
      loanProceeds: loanProceedsInYear,
      loanPrincipalRepayment: loanPrincipalRepaymentInYear,
      dividendsPaid: dividendsPaidInYear,
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
