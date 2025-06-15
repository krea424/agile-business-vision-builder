
import { FinancialPlanState } from '../types';
import { calculateFinancialSummary } from '../financialCalculator';
import { calculateCashFlowSummary } from '../cashFlowCalculator';
import { calculateDashboardData, KpiData } from '../dashboardCalculator';
import { VariableConfig, SENSITIVITY_VARIABLES } from './SensitivityAnalysisSetup';
import { AnalysisResults, KpiResults } from './SensitivityAnalysisResults';

function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

function setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const match = key.match(/(\w+)\[(\d+)\]/);
        if (match) {
            current = current[match[1]][parseInt(match[2])];
        } else {
            current = current[key];
        }
        if (current === undefined) {
            return;
        }
    }

    const lastKey = keys[keys.length - 1];
    const lastMatch = lastKey.match(/(\w+)\[(\d+)\]/);
    if(lastMatch) {
         current[lastMatch[1]][parseInt(lastMatch[2])] = value;
    } else {
        current[lastKey] = value;
    }
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => {
        if (o === undefined || o === null) return undefined;
        const match = k.match(/(\w+)\[(\d+)\]/);
        if (match) {
            return o[match[1]] ? o[match[1]][parseInt(match[2])] : undefined;
        }
        return o[k];
    }, obj);
}

function runSingleScenario(plan: FinancialPlanState): KpiResults {
    try {
        const financialSummary = calculateFinancialSummary(plan);
        if (financialSummary.length === 0) throw new Error("Financial summary empty");

        const cashFlowSummary = calculateCashFlowSummary(plan, financialSummary);
        if (cashFlowSummary.length === 0) throw new Error("Cashflow summary empty");

        const dashboardData = calculateDashboardData(plan, financialSummary, cashFlowSummary);
        if (!('peakFundingRequirement' in dashboardData.kpis)) {
             throw new Error("Dashboard KPIs not calculated");
        }
        
        const kpis = dashboardData.kpis as KpiData;

        return {
            enterpriseValue: kpis.enterpriseValue,
            irr: kpis.irr,
            peakFundingRequirement: kpis.peakFundingRequirement,
            paybackPeriodYears: kpis.paybackPeriodYears,
        };
    } catch (error) {
        console.error("Error running scenario:", error);
        return {
            enterpriseValue: null,
            irr: null,
            peakFundingRequirement: null,
            paybackPeriodYears: null,
        };
    }
}

export const runSensitivityAnalysis = (basePlan: FinancialPlanState, variables: VariableConfig[]): AnalysisResults | null => {
    if (variables.length === 0) {
        return null;
    }
    
    const variableToTest = variables[0];
    const { path, variation } = variableToTest;

    const basePlanCopy = deepCopy(basePlan);
    const baseValue = getNestedValue(basePlanCopy, path);

    if (baseValue === undefined) {
        console.error(`Sensitivity analysis failed: path ${path} not found in plan data.`);
        return null;
    }

    const baseResult = runSingleScenario(basePlanCopy);

    const pessimisticPlan = deepCopy(basePlan);
    const pessimisticValue = baseValue * (1 - variation / 100);
    setNestedValue(pessimisticPlan, path, pessimisticValue);
    const pessimisticResult = runSingleScenario(pessimisticPlan);

    const optimisticPlan = deepCopy(basePlan);
    const optimisticValue = baseValue * (1 + variation / 100);
    setNestedValue(optimisticPlan, path, optimisticValue);
    const optimisticResult = runSingleScenario(optimisticPlan);
    
    const variableLabel = SENSITIVITY_VARIABLES.find(v => v.id === variableToTest.id)?.label || 'Variabile';

    return {
        variable: variableLabel,
        base: baseResult,
        pessimistic: pessimisticResult,
        optimistic: optimisticResult
    };
};
