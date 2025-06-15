
import { FinancialPlanState, YearlyData } from './types';

export function calculateFinancialSummary(plan: FinancialPlanState): YearlyData[] {
  const { general, recoverableClients, newClients, personnelCosts, fixedCosts, variableCosts, initialInvestments } = plan;
  if (!general || !recoverableClients || !newClients || !personnelCosts || !fixedCosts || !variableCosts || !initialInvestments) {
      return [];
  }
  
  const years = Array.from({ length: general.timeHorizon }, (_, i) => i + 1);
  
  const totalInvestment = initialInvestments.reduce((sum, item) => sum + item.cost, 0);
  const annualAmortization = totalInvestment / 5; // Assuming 5-year amortization period

  let cumulativeNewClientRevenue = 0;

  const summary = years.map(year => {
    const inflationFactor = Math.pow(1 + general.inflationRate / 100, year - 1);

    // --- REVENUES ---
    let recoverableRevenueThisYear = 0;
    recoverableClients.forEach(client => {
      const annualPotentialRevenue = client.previousAnnualRevenue * (client.recoveryAmountPercentage / 100) * (client.recoveryProbability / 100);
      const startYear = Math.ceil(client.contractStartDateMonth / 12);
      
      if (year < startYear) return;

      if (client.serviceType === 'una_tantum') {
        if (year === startYear) {
          recoverableRevenueThisYear += annualPotentialRevenue;
        }
      } else { // ricorrente
        if (year === startYear) {
          const monthsInFirstYear = 12 - (client.contractStartDateMonth - 1) % 12;
          recoverableRevenueThisYear += (annualPotentialRevenue / 12) * monthsInFirstYear;
        } else {
          recoverableRevenueThisYear += annualPotentialRevenue;
        }
      }
    });

    let newClientRevenueGeneratedThisYear = 0;
    newClients.forEach(channel => {
        const annualMarketingInvestment = channel.monthlyMarketingInvestment * 12;
        const annualLeads = (annualMarketingInvestment / 100) * channel.leadsPer100Invested;
        const annualNewContracts = annualLeads * (channel.conversionRate / 100);
        newClientRevenueGeneratedThisYear += annualNewContracts * channel.averageAnnualContractValue;
    });

    cumulativeNewClientRevenue += newClientRevenueGeneratedThisYear;
    
    const totalRevenues = recoverableRevenueThisYear + cumulativeNewClientRevenue;

    // --- COSTS ---
    let personnelCostThisYear = 0;
    personnelCosts.forEach(p => {
      const startYear = Math.ceil(p.hiringMonth / 12);
      if (year < startYear) return;

      const annualCost = p.annualGrossSalary * p.companyCostCoefficient;
      if (year === startYear) {
        const monthsInFirstYear = 12 - (p.hiringMonth - 1) % 12;
        personnelCostThisYear += (annualCost / 12) * monthsInFirstYear;
      } else {
        personnelCostThisYear += annualCost;
      }
    });
    personnelCostThisYear *= inflationFactor;

    const fixedCostsThisYear = fixedCosts.reduce((sum, item) => sum + item.monthlyCost * 12, 0) * inflationFactor;
    const marketingCostsThisYear = newClients.reduce((sum, item) => sum + item.monthlyMarketingInvestment * 12, 0) * inflationFactor;
    const variableCostsThisYear = variableCosts.reduce((sum, item) => sum + (item.percentageOnRevenue / 100), 0) * totalRevenues;
    
    // --- CALCULATIONS ---
    const ebitda = totalRevenues - (personnelCostThisYear + fixedCostsThisYear + variableCostsThisYear + marketingCostsThisYear);
    const ebit = ebitda - (year <= 5 ? annualAmortization : 0);
    const taxBase = ebit > 0 ? ebit : 0;
    const taxes = taxBase * (general.iresRate / 100 + general.irapRate / 100);
    const netProfit = ebit - taxes;

    return {
      year,
      revenues: totalRevenues,
      recoverableClientRevenues: recoverableRevenueThisYear,
      newClientRevenues: cumulativeNewClientRevenue,
      personnelCosts: personnelCostThisYear,
      fixedCosts: fixedCostsThisYear,
      variableCosts: variableCostsThisYear,
      marketingCosts: marketingCostsThisYear,
      ebitda,
      amortization: year <= 5 ? annualAmortization : 0,
      ebit,
      taxes,
      netProfit,
    };
  });
  
  return summary;
}
