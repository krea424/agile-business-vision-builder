import { FinancialPlanState, YearlyData, CashFlowYearlyData } from './types';

// Simple IRR calculation using the Newton-Raphson method
function calculateIRR(cashFlows: number[], guess = 0.1): number {
    const maxIterations = 100;
    const tolerance = 1e-7;
    let x0 = guess;

    for (let i = 0; i < maxIterations; i++) {
        const npv = cashFlows.reduce((acc, val, j) => acc + val / Math.pow(1 + x0, j), 0);
        const derivative = cashFlows.reduce((acc, val, j) => {
            if (j === 0) return acc;
            return acc - (j * val) / Math.pow(1 + x0, j + 1);
        }, 0);

        if (Math.abs(derivative) < tolerance) break;
        
        const x1 = x0 - npv / derivative;
        if (Math.abs(x1 - x0) <= tolerance) return x1;
        x0 = x1;
    }
    return x0;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export type Insight = {
    key: string;
    variant: "default" | "destructive";
    title: string;
    description: string;
};

export type KpiData = {
  peakFundingRequirement: number;
  paybackPeriodYears: number | null;
  irr: number;
  enterpriseValue: number;
  breakEvenMonth: number | null;
  lowestCashPoint: { value: number; month: number; };
};

export type DashboardData = {
    kpis: KpiData | {};
    monthlyChartData: { name: string; Ricavi: number; EBITDA: number; 'Cassa Finale': number; }[];
    automatedInsights: Insight[];
};

export const generateAutomatedInsights = (plan: FinancialPlanState, kpis: any, yearlyFinancials: YearlyData[]): Insight[] => {
    const insights: Insight[] = [];

    if (!plan || !kpis || !yearlyFinancials || yearlyFinancials.length === 0) {
      return [];
    }

    const year1Summary = yearlyFinancials[0];

    // Insight 1: Liquidity Risk
    const equityInjection = plan.general.equityInjection || 0;
    if (kpis.peakFundingRequirement && kpis.peakFundingRequirement > equityInjection) {
      const shortfall = kpis.peakFundingRequirement - equityInjection;
      insights.push({
        key: "liquidity-risk",
        variant: "destructive",
        title: "Rischio di Liquidità",
        description: `Il capitale versato (${formatCurrency(equityInjection)}) non basta a coprire il fabbisogno di ${formatCurrency(kpis.peakFundingRequirement)}. Necessario un ulteriore finanziamento di ${formatCurrency(shortfall)} o una revisione dei costi.`
      });
    }
    
    // Insight 2: Cash Cycle
    const netTradeCycle = (plan.general.daysToCollectReceivables || 0) - (plan.general.daysToPayPayables || 0);
    if (netTradeCycle > 60) {
        insights.push({
            key: "cash-cycle",
            variant: "default",
            title: "Insight: Ciclo di Cassa",
            description: `Il ciclo di cassa (${netTradeCycle.toFixed(0)} giorni) è lungo. Valutare di ritardare i pagamenti o accelerare gli incassi per migliorare la liquidità.`
        });
    }

    // Insight 3: Cost Structure
    if (year1Summary) {
        const totalCosts1 = year1Summary.personnelCosts + year1Summary.fixedCosts + year1Summary.variableCosts + year1Summary.marketingCosts;
        if (totalCosts1 > 0) {
            const personnelCostRatio = year1Summary.personnelCosts / totalCosts1;
            if (personnelCostRatio > 0.7) {
                insights.push({
                    key: "cost-structure",
                    variant: "default",
                    title: "Insight: Struttura dei Costi",
                    description: `I costi del personale rappresentano il ${(personnelCostRatio * 100).toFixed(0)}% dei costi totali. Valutare l'impatto di aumenti salariali inattesi.`
                });
            }
        }
    }

    // Insight 4: Sustainability Risk
    if (yearlyFinancials.length > 1) {
        const year2Summary = yearlyFinancials[1];
        if (year1Summary && year2Summary) {
            const totalCosts1 = year1Summary.personnelCosts + year1Summary.fixedCosts + year1Summary.variableCosts + year1Summary.marketingCosts;
            const totalCosts2 = year2Summary.personnelCosts + year2Summary.fixedCosts + year2Summary.variableCosts + year2Summary.marketingCosts;

            if (year1Summary.revenues > 0 && totalCosts1 > 0) {
                const revenueGrowth = (year2Summary.revenues - year1Summary.revenues) / year1Summary.revenues;
                const costGrowth = (totalCosts2 - totalCosts1) / totalCosts1;
                
                if (costGrowth > revenueGrowth) {
                    insights.push({
                        key: "sustainability-risk",
                        variant: "destructive",
                        title: "Rischio di Sostenibilità",
                        description: `I costi (${(costGrowth * 100).toFixed(1)}%) crescono più dei ricavi (${(revenueGrowth * 100).toFixed(1)}%). Rivedere il pricing o l'efficienza dei costi.`
                    });
                }
            }
        }
    }

    return insights;
};

export const calculateDashboardData = (plan: FinancialPlanState, yearlyFinancials: YearlyData[], yearlyCashFlow: CashFlowYearlyData[]): DashboardData => {
    if (!plan || yearlyFinancials.length === 0 || yearlyCashFlow.length === 0) {
        return {
            kpis: {},
            monthlyChartData: [],
            automatedInsights: []
        };
    }
    
    const { general } = plan;

    // --- Enterprise Value ---
    const lastYearEbitda = yearlyFinancials[yearlyFinancials.length - 1].ebitda;
    const enterpriseValue = lastYearEbitda * (general.exitMultiple || 0);

    // --- IRR ---
    const fcfes = yearlyCashFlow.map(cf => cf.cashFlowFromOperations + cf.cashFlowFromInvesting + cf.loanProceeds + cf.loanPrincipalRepayment);
    const terminalValue = enterpriseValue;
    const irrCashFlows = [
        -general.equityInjection,
        ...fcfes.slice(0, -1),
        fcfes[fcfes.length - 1] + terminalValue
    ];
    const irr = calculateIRR(irrCashFlows);

    // --- Monthly Breakdown for other KPIs ---
    const totalMonths = general.timeHorizon * 12;
    const monthlyData = Array.from({ length: totalMonths }, (_, i) => ({
        month: i + 1,
        revenue: 0,
        ebitda: 0,
        endingCash: 0,
        cumulativeEbitda: 0,
        cumulativeFcf: 0,
    }));
    
    let cumulativeEbitda = 0;
    let cumulativeFcf = 0;
    let endingCash = 0;

    // Simplified monthly calculation based on yearly averages
    for(let i = 0; i < totalMonths; i++) {
        const yearIndex = Math.floor(i / 12);
        const yearFinancials = yearlyFinancials[yearIndex];
        const yearCashFlow = yearlyCashFlow[yearIndex];

        if (!yearFinancials || !yearCashFlow) continue;

        const monthlyRevenue = yearFinancials.revenues / 12;
        const monthlyEbitda = yearFinancials.ebitda / 12;
        const monthlyFcf = (yearCashFlow.cashFlowFromOperations + yearCashFlow.cashFlowFromInvesting) / 12;
        const monthlyFinancing = (yearCashFlow.cashFlowFromFinancing) / 12;
        
        // Adjust for first month injections
        if (i === 0) {
            endingCash += general.equityInjection + general.initialLoanAmount;
        }

        cumulativeEbitda += monthlyEbitda;
        cumulativeFcf += monthlyFcf;
        endingCash += monthlyFcf + monthlyFinancing;

        monthlyData[i] = {
            month: i + 1,
            revenue: monthlyRevenue,
            ebitda: monthlyEbitda,
            endingCash: endingCash,
            cumulativeEbitda: cumulativeEbitda,
            cumulativeFcf: cumulativeFcf,
        };
    }
    
    // --- Break-Even Point ---
    const breakEvenMonth = monthlyData.find(d => d.cumulativeEbitda > 0)?.month || null;

    // --- Lowest Cash Point ---
    const lowestCashData = monthlyData.reduce((min, p) => p.endingCash < min.endingCash ? p : min, monthlyData[0]);
    const lowestCashPoint = { value: lowestCashData.endingCash, month: lowestCashData.month };

    // --- Peak Funding Requirement ---
    const peakFundingReq = Math.abs(Math.min(0, ...monthlyData.map(d => d.cumulativeFcf)));

    // --- Payback Period ---
    const paybackMonthData = monthlyData.find(d => d.cumulativeFcf > 0);
    const paybackPeriodYears = paybackMonthData ? paybackMonthData.month / 12 : null;

    const kpis: KpiData = {
        peakFundingRequirement: peakFundingReq,
        paybackPeriodYears: paybackPeriodYears,
        irr: irr,
        enterpriseValue: enterpriseValue,
        breakEvenMonth: breakEvenMonth,
        lowestCashPoint: lowestCashPoint,
    };
    
    const automatedInsights = generateAutomatedInsights(plan, kpis, yearlyFinancials);

    return {
        kpis,
        monthlyChartData: monthlyData.map(d => ({ name: `M${d.month}`, Ricavi: d.revenue, EBITDA: d.ebitda, 'Cassa Finale': d.endingCash })),
        automatedInsights,
    };
};
