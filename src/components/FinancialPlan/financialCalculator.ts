
import { FinancialPlanState, YearlyData } from './types';

export function calculateFinancialSummary(plan: FinancialPlanState): YearlyData[] {
  const { general, recoverableClients, newClients, personnelCosts, fixedCosts, variableCosts, initialInvestments } = plan;
  if (!general || !recoverableClients || !newClients || !personnelCosts || !fixedCosts || !variableCosts || !initialInvestments) {
      return [];
  }
  
  const years = Array.from({ length: general.timeHorizon }, (_, i) => i + 1);
  
  const totalInvestment = initialInvestments.reduce((sum, item) => sum + item.cost, 0);
  const annualAmortization = totalInvestment / 5; // Assuming 5-year amortization period

  const monthMap: { [key: string]: number } = { gen: 1, feb: 2, mar: 3, apr: 4, mag: 5, giu: 6, lug: 7, ago: 8, set: 9, ott: 10, nov: 11, dic: 12 };
  const [monthStr] = general.startDate.split('-');
  const projectStartMonthOfYear = monthMap[monthStr.toLowerCase()] || 1;
  const monthsInFirstYear = 12 - projectStartMonthOfYear + 1;

  let cumulativeNewClientRevenue = 0;

  const summary = years.map(year => {
    const inflationFactor = Math.pow(1 + general.inflationRate / 100, year - 1);

    const firstMonthOfCurrentYear = (year === 1) ? 1 : monthsInFirstYear + (year - 2) * 12 + 1;
    const monthsInCurrentYear = (year === 1) ? monthsInFirstYear : 12;
    const lastMonthOfCurrentYear = firstMonthOfCurrentYear + monthsInCurrentYear - 1;
    
    const getMonthsOfActivity = (startMonth: number) => {
        if (startMonth > lastMonthOfCurrentYear) return 0;
        const effectiveStartMonth = Math.max(startMonth, firstMonthOfCurrentYear);
        return lastMonthOfCurrentYear - effectiveStartMonth + 1;
    };

    // --- REVENUES ---
    let recoverableRevenueThisYear = 0;
    recoverableClients.forEach(client => {
      const annualPotentialRevenue = client.previousAnnualRevenue * (client.recoveryAmountPercentage / 100) * (client.recoveryProbability / 100);
      const startMonth = client.contractStartDateMonth;
      
      if (client.serviceType === 'una_tantum') {
        let chargeYear = 1;
        let cumulativeMonths = monthsInFirstYear;
        while (startMonth > cumulativeMonths) {
            chargeYear++;
            cumulativeMonths += 12;
        }
        if (year === chargeYear) {
            recoverableRevenueThisYear += annualPotentialRevenue;
        }
      } else { // ricorrente
        const monthsOfActivity = getMonthsOfActivity(startMonth);
        recoverableRevenueThisYear += (annualPotentialRevenue / 12) * monthsOfActivity;
      }
    });

    let newClientRevenueGeneratedThisYear = 0;
    newClients.forEach(channel => {
        const monthsOfActivity = getMonthsOfActivity(channel.startMonth);
        const marketingInvestmentThisYear = channel.monthlyMarketingInvestment * monthsOfActivity;
        const leadsThisYear = (marketingInvestmentThisYear / 100) * channel.leadsPer100Invested;
        const newContractsThisYear = leadsThisYear * (channel.conversionRate / 100);
        newClientRevenueGeneratedThisYear += newContractsThisYear * channel.averageAnnualContractValue;
    });

    cumulativeNewClientRevenue += newClientRevenueGeneratedThisYear;
    
    const totalRevenues = recoverableRevenueThisYear + cumulativeNewClientRevenue;

    // --- COSTS ---
    let personnelCostThisYear = 0;
    personnelCosts.forEach(p => {
      const annualCost = p.annualGrossSalary * p.companyCostCoefficient;
      const monthsOfActivity = getMonthsOfActivity(p.hiringMonth);
      personnelCostThisYear += (annualCost / 12) * monthsOfActivity;
    });
    personnelCostThisYear *= inflationFactor;
    
    let fixedCostsThisYear = 0;
    fixedCosts.forEach(item => {
        const monthsOfActivity = getMonthsOfActivity(item.startMonth);
        fixedCostsThisYear += item.monthlyCost * monthsOfActivity;
    });
    fixedCostsThisYear *= inflationFactor;
    
    let marketingCostsThisYear = 0;
    newClients.forEach(channel => {
        const monthsOfActivity = getMonthsOfActivity(channel.startMonth);
        marketingCostsThisYear += channel.monthlyMarketingInvestment * monthsOfActivity;
    });
    marketingCostsThisYear *= inflationFactor;

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
