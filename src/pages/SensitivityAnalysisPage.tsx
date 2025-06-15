
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { SensitivityAnalysisSetup, VariableConfig } from '@/components/FinancialPlan/SensitivityAnalysis/SensitivityAnalysisSetup';
import { SensitivityAnalysisResults, AnalysisResults } from '@/components/FinancialPlan/SensitivityAnalysis/SensitivityAnalysisResults';
import { runSensitivityAnalysis } from '@/components/FinancialPlan/SensitivityAnalysis/sensitivityCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const LOCAL_STORAGE_KEY = 'financial-plan-data';

const SensitivityAnalysisPage = () => {
    const [planData, setPlanData] = useState<FinancialPlanState | null>(null);
    const [loading, setLoading] = useState(true);
    const [variables, setVariables] = useState<VariableConfig[]>([]);
    const [results, setResults] = useState<AnalysisResults | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData.general) {
                    setPlanData(parsedData);
                }
            }
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRunAnalysis = () => {
        if (!planData || variables.length === 0) return;
        setIsRunning(true);
        setResults(null);
        // Using setTimeout to simulate async calculation and allow UI to update
        setTimeout(() => {
            const analysisResults = runSensitivityAnalysis(planData, variables);
            setResults(analysisResults);
            setIsRunning(false);
        }, 50);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
    }

    if (!planData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p>Nessun dato del piano trovato. Creane uno prima.</p>
                <Button onClick={() => navigate('/plan')}>Crea Piano</Button>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-secondary via-background to-background dark:from-black/10 dark:via-background dark:to-background">
            <div className="container mx-auto p-4 md:p-8 lg:p-12">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Analisi di Sensitività</h1>
                        <p className="mt-2 text-lg text-muted-foreground">Valuta l'impatto delle variazioni delle ipotesi chiave.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/')}>
                        <Home className="mr-2 h-4 w-4" /> Torna alla Dashboard
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <SensitivityAnalysisSetup 
                            variables={variables} 
                            setVariables={setVariables} 
                            onRun={handleRunAnalysis}
                            isRunning={isRunning}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <SensitivityAnalysisResults results={results} isRunning={isRunning} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SensitivityAnalysisPage;
