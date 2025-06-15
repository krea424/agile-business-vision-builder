import { FinancialPlanState, YearlyData } from './types';

export function calculateFinancialSummary(plan: FinancialPlanState): YearlyData[] {
  const { general, recoverableClients, newClients, directlyAcquiredClients, personnelCosts, fixedCosts, variableCosts, initialInvestments } = plan;
  if (!general || !recoverableClients || !newClients || !directlyAcquiredClients || !personnelCosts || !fixedCosts || !variableCosts || !initialInvestments) {
      return [];
  }
  
  const years = Array.from({ length: general.timeHorizon }, (_, i) => i + 1);
  
  const monthMap: { [key: string]: number } = { gen: 1, feb: 2, mar: 3, apr: 4, mag: 5, giu: 6, lug: 7, ago: 8, set: 9, ott: 10, nov: 11, dic: 12 };
  const [monthStr] = general.startDate.split('-');
  const projectStartMonthOfYear = monthMap[monthStr.toLowerCase()] || 1;
  const monthsInFirstYear = 12 - projectStartMonthOfYear + 1;

  let outstandingLoanBalance = general.initialLoanAmount || 0;
  const annualPrincipalPayment = general.loanDurationMonths > 0 ? (general.initialLoanAmount || 0) / (general.loanDurationMonths / 12) : 0;
  
  let recurringRevenueFromNewClients = 0;
  
  const summary: YearlyData[] = [];

  for (const year of years) {
    const inflationFactor = Math.pow(1 + general.inflationRate / 100, year - 1);

    const firstMonthOfCurrentYear = (year === 1) ? 1 : monthsInFirstYear + (year - 2) * 12 + 1;
    const monthsInCurrentYear = (year === 1) ? monthsInFirstYear : 12;
    const lastMonthOfCurrentYear = firstMonthOfCurrentYear + monthsInCurrentYear - 1;
    
    const getMonthsOfActivity = (startMonth: number, endMonth?: number) => {
        const effectiveEndMonth = endMonth || Infinity;
        if (startMonth > lastMonthOfCurrentYear || effectiveEndMonth < firstMonthOfCurrentYear) return 0;
        
        const effectiveStartMonth = Math.max(startMonth, firstMonthOfCurrentYear);
        const effectiveLastMonth = Math.min(effectiveEndMonth, lastMonthOfCurrentYear);
        
        return Math.max(0, effectiveLastMonth - effectiveStartMonth + 1);
    };
    
    // --- REVENUES ---
    let recoverableRevenueThisYear = 0;
    let recoverableContractsThisYear = 0;
    recoverableClients.forEach(client => {
      let clientRevenueThisYear = 0;
      
      if (client.serviceType === 'una_tantum') {
        const annualPotentialRevenue = client.previousAnnualRevenue * (client.recoveryAmountPercentage / 100) * (client.recoveryProbability / 100);
        const startMonth = client.contractStartDateMonth;
        let chargeYear = 1;
        let cumulativeMonths = monthsInFirstYear;
        while (startMonth > cumulativeMonths) {
            chargeYear++;
            cumulativeMonths += 12;
        }
        if (year === chargeYear) {
            clientRevenueThisYear += annualPotentialRevenue;
        }
      } else { // ricorrente
        let currentAnnualPotentialRevenue = client.previousAnnualRevenue * (client.recoveryAmountPercentage / 100) * (client.recoveryProbability / 100);
        let contractInstanceStartMonth = client.contractStartDateMonth;
        let keepCalculating = true;
        
        while(keepCalculating && currentAnnualPotentialRevenue > 0.01) {
            const durationMonths = client.contractDurationMonths || (general.timeHorizon * 12);
            const contractInstanceEndMonth = contractInstanceStartMonth + durationMonths - 1;
            
            const firstActiveMonthInYear = Math.max(contractInstanceStartMonth, firstMonthOfCurrentYear);
            const lastActiveMonthInYear = Math.min(contractInstanceEndMonth, lastMonthOfCurrentYear);

            if (firstActiveMonthInYear <= lastActiveMonthInYear) {
                const monthlyPotentialRevenue = currentAnnualPotentialRevenue / 12;
                const rampUpMonths = client.activationRampUpMonths || 0;
                
                for (let m = firstActiveMonthInYear; m <= lastActiveMonthInYear; m++) {
                    let revenueForThisMonth = monthlyPotentialRevenue;
                    const monthInContract = m - contractInstanceStartMonth + 1;

                    if (rampUpMonths > 0 && monthInContract <= rampUpMonths) {
                        revenueForThisMonth *= (monthInContract / rampUpMonths);
                    }
                    clientRevenueThisYear += revenueForThisMonth;
                }
            }

            if (contractInstanceEndMonth < lastMonthOfCurrentYear) {
                const renewalProbability = (client.renewalProbability || 0) / 100;
                if (renewalProbability > 0) {
                    contractInstanceStartMonth = contractInstanceEndMonth + 1;
                    currentAnnualPotentialRevenue *= renewalProbability;
                } else {
                    keepCalculating = false;
                }
            } else {
                keepCalculating = false;
            }
        }
      }
      recoverableRevenueThisYear += clientRevenueThisYear;
      if (clientRevenueThisYear > 0) {
        recoverableContractsThisYear++;
      }
    });
    recurringRevenueFromNewClients *= (1 - (general.customerChurnRate || 0) / 100);

    let totalWeightedCollectionDaysNumerator = 0;

    let directlyAcquiredClientRevenuesThisYear = 0;
    let directlyAcquiredContractsThisYear = 0;
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
              directlyAcquiredContractsThisYear += client.numberOfClients;
          }
        } else { // ricorrente
          const annualRevenue = client.numberOfClients * client.monthlyContractValue * 12;
          directlyAcquiredClientRevenuesThisYear += (annualRevenue / 12) * monthsOfActivity;
          if (monthsOfActivity > 0) {
            directlyAcquiredContractsThisYear += client.numberOfClients;
          }
        }
      });
    }

    totalWeightedCollectionDaysNumerator += directlyAcquiredClientRevenuesThisYear * general.daysToCollectReceivables;

    let newClientRevenueGeneratedThisYear = 0;
    let newContractsThisYear = 0;
    newClients.forEach(channel => {
        const monthsOfActivity = getMonthsOfActivity(channel.startMonth);
        const effectiveMonthlyInvestment = channel.monthlyMarketingInvestment * Math.pow(1 + (general.annualNewRevenueGrowthRate || 0) / 100, year - 1);
        const marketingInvestmentThisYear = effectiveMonthlyInvestment * monthsOfActivity;
        const leadsThisYear = (marketingInvestmentThisYear / 100) * channel.leadsPer100Invested;
        const _newContractsThisYear = leadsThisYear * (channel.conversionRate / 100);
        newClientRevenueGeneratedThisYear += _newContractsThisYear * channel.averageAnnualContractValue;
        newContractsThisYear += _newContractsThisYear;
    });
    
    const totalNewClientRevenueThisYear = recurringRevenueFromNewClients + newClientRevenueGeneratedThisYear;
    recurringRevenueFromNewClients = totalNewClientRevenueThisYear;
    totalWeightedCollectionDaysNumerator += totalNewClientRevenueThisYear * general.daysToCollectReceivables;

    const totalRevenues = recoverableRevenueThisYear + totalNewClientRevenueThisYear + directlyAcquiredClientRevenuesThisYear;
    
    const weightedAverageCollectionDays = totalRevenues > 0
        ? totalWeightedCollectionDaysNumerator / totalRevenues
        : general.daysToCollectReceivables;
    
    const previousYearSummary = year > 1 ? summary[year - 2] : undefined;

    // --- COSTS ---
    let personnelCostThisYear = 0;
    personnelCosts.forEach(p => {
      const monthsOfActivity = getMonthsOfActivity(p.hiringMonth, p.endMonth);
      if (monthsOfActivity === 0) return;

      let annualCost = 0;
      if (p.contractType === 'Dipendente') {
        const salaryIncreaseFactor = p.annualSalaryIncrease ? Math.pow(1 + p.annualSalaryIncrease / 100, year - 1) : 1;
        const currentRAL = (p.annualGrossSalary || 0) * salaryIncreaseFactor;
        annualCost = currentRAL * (p.companyCostCoefficient || 1);

        if (p.bonusType && p.bonusType !== 'Nessuno' && previousYearSummary) {
          let bonusBase = 0;
          if (p.bonusType === '% su EBITDA') bonusBase = previousYearSummary.ebitda;
          if (p.bonusType === '% su Utile Netto') bonusBase = previousYearSummary.netProfit;
          
          if (bonusBase > 0) {
            annualCost += bonusBase * ((p.bonusValue || 0) / 100);
          }
        }
        if (p.bonusType === 'Importo Fisso Annuo') {
          annualCost += (p.bonusValue || 0);
        }

      } else { // Freelance or Amministratore
        annualCost = (p.monthlyCost || 0) * 12;
      }
      
      personnelCostThisYear += (annualCost / 12) * monthsOfActivity;
    });
    
    let fixedCostsThisYear = 0;
    fixedCosts.forEach(item => {
        const monthsOfActivity = getMonthsOfActivity(item.startMonth);
        const totalMonthlyCost = item.subItems && item.subItems.length > 0
            ? item.subItems.reduce((sum, sub) => sum + sub.monthlyCost, 0)
            : item.monthlyCost;
        const currentYearCost = totalMonthlyCost * monthsOfActivity;
        const inflation = item.indexedToInflation ? inflationFactor : 1;
        fixedCostsThisYear += currentYearCost * inflation;
    });
    
    let marketingCostsThisYear = 0;
    newClients.forEach(channel => {
        const monthsOfActivity = getMonthsOfActivity(channel.startMonth);
        const effectiveMonthlyInvestment = channel.monthlyMarketingInvestment * Math.pow(1 + (general.annualNewRevenueGrowthRate || 0) / 100, year - 1);
        marketingCostsThisYear += effectiveMonthlyInvestment * monthsOfActivity;
    });
    marketingCostsThisYear *= inflationFactor;

    const totalContractsThisYear = newContractsThisYear + directlyAcquiredContractsThisYear + recoverableContractsThisYear;
    let variableCostsThisYear = 0;
    variableCosts.forEach(item => {
        const itemValue = item.subItems && item.subItems.length > 0
            ? item.subItems.reduce((sum, sub) => sum + sub.value, 0)
            : item.value;

        switch(item.calculationMethod) {
            case '% su Ricavi Totali':
                variableCostsThisYear += (itemValue / 100) * totalRevenues;
                break;
            case '% su Ricavi Specifici':
                let specificRevenue = 0;
                if (item.linkedRevenueChannel === 'recoverable') specificRevenue = recoverableRevenueThisYear;
                else if (item.linkedRevenueChannel === 'new') specificRevenue = totalNewClientRevenueThisYear;
                else if (item.linkedRevenueChannel === 'direct') specificRevenue = directlyAcquiredClientRevenuesThisYear;
                variableCostsThisYear += (itemValue / 100) * specificRevenue;
                break;
            case '€ per Contratto':
                variableCostsThisYear += itemValue * totalContractsThisYear;
                break;
        }
    });
    
    // --- AMORTIZATION ---
    let annualAmortization = 0;
    initialInvestments.forEach(inv => {
        const investmentStartYear = Math.ceil(inv.investmentMonth / 12);
        const amortizationEndYear = investmentStartYear + (inv.amortizationYears || 0) - 1;
        if (year >= investmentStartYear && year <= amortizationEndYear) {
            const itemCost = inv.subItems && inv.subItems.length > 0
              ? inv.subItems.reduce((sum, sub) => sum + sub.cost, 0)
              : inv.cost;
            annualAmortization += itemCost / (inv.amortizationYears || 1);
        }
    });

    // --- CALCULATIONS ---
    const ebitda = totalRevenues - (personnelCostThisYear + fixedCostsThisYear + variableCostsThisYear + marketingCostsThisYear);
    const ebit = ebitda - annualAmortization;

    const interestExpenseThisYear = outstandingLoanBalance * ((general.loanInterestRate || 0) / 100);
    const ebt = ebit - interestExpenseThisYear;
    const taxBase = ebt > 0 ? ebt : 0;
    const taxes = taxBase * (general.iresRate / 100 + general.irapRate / 100);
    const netProfit = ebt - taxes;

    const principalPaymentThisYear = (year * 12 <= general.loanDurationMonths && outstandingLoanBalance > 0) ? Math.min(annualPrincipalPayment, outstandingLoanBalance) : 0;
    outstandingLoanBalance -= principalPaymentThisYear;
    
    const contributionMarginPercentage = totalRevenues > 0 ? ((totalRevenues - variableCostsThisYear) / totalRevenues) * 100 : 0;
    const ebitdaMargin = totalRevenues > 0 ? (ebitda / totalRevenues) * 100 : 0;
    const ebitMargin = totalRevenues > 0 ? (ebit / totalRevenues) * 100 : 0;
    const netProfitMargin = totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 0;

    summary.push({
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
      amortization: annualAmortization,
      ebit,
      interestExpense: interestExpenseThisYear,
      ebt,
      taxes,
      netProfit,
      loanPrincipalRepayment: principalPaymentThisYear,
      weightedAverageCollectionDays,
      contributionMarginPercentage,
      ebitdaMargin,
      ebitMargin,
      netProfitMargin,
      newContracts: newContractsThisYear,
      directlyAcquiredContracts: directlyAcquiredContractsThisYear,
    });
  }
  
  return summary;
}
