
import { useState, useEffect, useCallback } from 'react';
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { initialPlanState } from '@/components/FinancialPlan/initialPlanState';

const LOCAL_STORAGE_KEY = 'financial-plan-data';

export const usePlanData = () => {
    const [planData, setPlanData] = useState<FinancialPlanState>(() => {
        if (typeof window === 'undefined') {
            return initialPlanState;
        }
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // A simple check to ensure data is somewhat valid before using
                if (parsedData.general && parsedData.recoverableClients) {
                    return parsedData;
                }
            }
        } catch (error) {
            console.error("Error reading financial plan data from localStorage", error);
        }
        return initialPlanState;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planData));
        }
    }, [planData]);

    const setGeneral = useCallback((data: FinancialPlanState['general']) => setPlanData(prev => ({ ...prev, general: data })), []);
    const setRecoverableClients = useCallback((data: FinancialPlanState['recoverableClients']) => setPlanData(prev => ({ ...prev, recoverableClients: data })), []);
    const setNewClients = useCallback((data: FinancialPlanState['newClients']) => setPlanData(prev => ({ ...prev, newClients: data })), []);
    const setDirectlyAcquiredClients = useCallback((data: FinancialPlanState['directlyAcquiredClients']) => setPlanData(prev => ({ ...prev, directlyAcquiredClients: data })), []);
    const setPersonnelCosts = useCallback((data: FinancialPlanState['personnelCosts']) => setPlanData(prev => ({ ...prev, personnelCosts: data })), []);
    const setFixedCosts = useCallback((data: FinancialPlanState['fixedCosts']) => setPlanData(prev => ({ ...prev, fixedCosts: data })), []);
    const setVariableCosts = useCallback((data: FinancialPlanState['variableCosts']) => setPlanData(prev => ({ ...prev, variableCosts: data })), []);
    const setInitialInvestments = useCallback((data: FinancialPlanState['initialInvestments']) => setPlanData(prev => ({ ...prev, initialInvestments: data })), []);

    return {
        planData,
        setGeneral,
        setRecoverableClients,
        setNewClients,
        setDirectlyAcquiredClients,
        setPersonnelCosts,
        setFixedCosts,
        setVariableCosts,
        setInitialInvestments,
    };
};
