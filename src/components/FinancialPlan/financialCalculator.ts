import { FinancialPlanState, YearlyData } from './types';

export function calculateFinancialSummary(plan: FinancialPlanState): YearlyData[] {
  const { general, recoverableClients, newClients, directlyAcquiredClients, personnelCosts, fixedCosts, variableCosts, initialInvestments } = plan;
  if (!general || !recoverableClients || !newClients || !directlyAcquiredClients || !personnelCosts || !fixedCosts || !variableCosts || !initialInvestments) {
      return [];
  }
  
  const years = Array.from({ length: general.timeHorizon }, (_, i) => i + 1);
  
  const totalInvestment = initialInvestments.reduce((total, item) => {
    const itemCost = item.subItems && item.subItems.length > 0
        ? item.subItems.reduce((sum, sub) => sum + sub.cost, 0)
        : item.cost;
    return total + itemCost;
  }, 0);
  const annualAmortization = totalInvestment / 5; // Assuming 5-year amortization period

  const monthMap: { [key: string]: number } = { gen: 1, feb: 2, mar: 3, apr: 4, mag: 5, giu: 6, lug: 7, ago: 8, set: 9, ott: 10, nov: 11, dic: 12 };
  const [monthStr] = general.startDate.split('-');
  const projectStartMonthOfYear = monthMap[monthStr.toLowerCase()] || 1;
  const monthsInFirstYear = 12 - projectStartMonthOfYear + 1;

  let outstandingLoanBalance = general.initialLoanAmount || 0;
  const annualPrincipalPayment = general.loanDurationMonths > 0 ? (general.initialLoanAmount || 0) / (general.loanDurationMonths / 12) : 0;
  
  let recurringRevenueFromNewClients = 0;

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
    
    recurringRevenueFromNewClients *= (1 - (general.customerChurnRate || 0) / 100);

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
        // Implement logic for contract duration
        const durationMonths = client.contractDurationMonths || (general.timeHorizon * 12);
        const contractEndMonth = startMonth + durationMonths - 1;

        const firstMonthOfActivity = Math.max(startMonth, firstMonthOfCurrentYear);
        const lastMonthOfActivity = Math.min(contractEndMonth, lastMonthOfCurrentYear);

        if (lastMonthOfActivity >= firstMonthOfActivity) {
            const monthsOfActivity = lastMonthOfActivity - firstMonthOfActivity + 1;
            recoverableRevenueThisYear += (annualPotentialRevenue / 12) * monthsOfActivity;
        }
        // NOTE: Renewal, ramp-up and other complex logic will be added in next steps.
      }
    });

    let directlyAcquiredClientRevenuesThisYear = 0;
    if (directlyAcquiredClients) {
      directlyAcquiredClients.forEach(client => {
        const startMonth = client.startMonth;
        const monthsOfActivity = getMonthsOfActivity(startMonth);
        if (client.serviceType === 'una_tantum') {
          let chargeYear = 1;
          let cumulativeMonths = monthsInFirstYear;
          while (startMonth > cumulativeMonths) {
              chargeYear++;
              cumulativeMonths += 12;
          }
          if (year === chargeYear) {
              directlyAcquiredClientRevenuesThisYear += client.numberOfClients * client.annualContractValue;
          }
        } else { // ricorrente
          const annualRevenue = client.numberOfClients * client.monthlyContractValue * 12;
          directlyAcquiredClientRevenuesThisYear += (annualRevenue / 12) * monthsOfActivity;
        }
      });
    }

    let newClientRevenueGeneratedThisYear = 0;
    newClients.forEach(channel => {
        const monthsOfActivity = getMonthsOfActivity(channel.startMonth);
        const effectiveMonthlyInvestment = channel.monthlyMarketingInvestment * Math.pow(1 + (general.annualNewRevenueGrowthRate || 0) / 100, year - 1);
        const marketingInvestmentThisYear = effectiveMonthlyInvestment * monthsOfActivity;
        const leadsThisYear = (marketingInvestmentThisYear / 100) * channel.leadsPer100Invested;
        const newContractsThisYear = leadsThisYear * (channel.conversionRate / 100);
        newClientRevenueGeneratedThisYear += newContractsThisYear * channel.averageAnnualContractValue;
    });
    
    const totalNewClientRevenueThisYear = recurringRevenueFromNewClients + newClientRevenueGeneratedThisYear;
    recurringRevenueFromNewClients = totalNewClientRevenueThisYear;

    const totalRevenues = recoverableRevenueThisYear + totalNewClientRevenueThisYear + directlyAcquiredClientRevenuesThisYear;

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
        const totalMonthlyCost = item.subItems && item.subItems.length > 0
            ? item.subItems.reduce((sum, sub) => sum + sub.monthlyCost, 0)
            : item.monthlyCost;
        fixedCostsThisYear += totalMonthlyCost * monthsOfActivity;
    });
    fixedCostsThisYear *= inflationFactor;
    
    let marketingCostsThisYear = 0;
    newClients.forEach(channel => {
        const monthsOfActivity = getMonthsOfActivity(channel.startMonth);
        const effectiveMonthlyInvestment = channel.monthlyMarketingInvestment * Math.pow(1 + (general.annualNewRevenueGrowthRate || 0) / 100, year - 1);
        marketingCostsThisYear += effectiveMonthlyInvestment * monthsOfActivity;
    });
    marketingCostsThisYear *= inflationFactor;

    const totalVariablePercentage = variableCosts.reduce((total, item) => {
        const itemPercentage = item.subItems && item.subItems.length > 0
            ? item.subItems.reduce((sum, sub) => sum + sub.percentageOnRevenue, 0)
            : item.percentageOnRevenue;
        return total + itemPercentage;
    }, 0);
    const variableCostsThisYear = (totalVariablePercentage / 100) * totalRevenues;
    
    // --- CALCULATIONS ---
    const ebitda = totalRevenues - (personnelCostThisYear + fixedCostsThisYear + variableCostsThisYear + marketingCostsThisYear);
    const ebit = ebitda - (year <= 5 ? annualAmortization : 0);

    const interestExpenseThisYear = outstandingLoanBalance * ((general.loanInterestRate || 0) / 100);
    const ebt = ebit - interestExpenseThisYear;
    const taxBase = ebt > 0 ? ebt : 0;
    const taxes = taxBase * (general.iresRate / 100 + general.irapRate / 100);
    const netProfit = ebt - taxes;

    const principalPaymentThisYear = (year * 12 <= general.loanDurationMonths && outstandingLoanBalance > 0) ? Math.min(annualPrincipalPayment, outstandingLoanBalance) : 0;
    outstandingLoanBalance -= principalPaymentThisYear;

    return {
      year,
      revenues: totalRevenues,
      recoverableClientRevenues: recoverableRevenueThisYear,
      newClientRevenues: totalNewClientRevenueThisYear,
      directlyAcquiredClientRevenues: directlyAcquiredClientRevenuesThisYear,
      personnelCosts: personnelCostThisYear,
      fixedCosts: fixedCostsThisYear,
      variableCosts: variableCostsThisYear,
      marketingCosts: marketingCostsThisYear,
      ebitda,
      amortization: year <= 5 ? annualAmortization : 0,
      ebit,
      interestExpense: interestExpenseThisYear,
      ebt,
      taxes,
      netProfit,
      loanPrincipalRepayment: principalPaymentThisYear,
    };
  });
  
  return summary;
}
