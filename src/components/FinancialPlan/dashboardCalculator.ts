
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

export const calculateDashboardData = (plan: FinancialPlanState, yearlyFinancials: YearlyData[], yearlyCashFlow: CashFlowYearlyData[]) => {
    if (!plan || yearlyFinancials.length === 0 || yearlyCashFlow.length === 0) {
        return {
            kpis: {},
            monthlyChartData: []
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

    return {
        kpis: {
            peakFundingRequirement: peakFundingReq,
            paybackPeriodYears: paybackPeriodYears,
            irr: irr,
            enterpriseValue: enterpriseValue,
            breakEvenMonth: breakEvenMonth,
            lowestCashPoint: lowestCashPoint,
        },
        monthlyChartData: monthlyData.map(d => ({ name: `M${d.month}`, Ricavi: d.revenue, EBITDA: d.ebitda, 'Cassa Finale': d.endingCash })),
    };
};
