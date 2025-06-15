
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinancialPlanState } from '@/components/FinancialPlan/types';
import { ExecutiveDashboard } from '@/components/FinancialPlan/ExecutiveDashboard';
import { Button } from '@/components/ui/button';

const LOCAL_STORAGE_KEY = 'financial-plan-data';

const Index = () => {
  const [planData, setPlanData] = useState<FinancialPlanState | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.general && parsedData.recoverableClients) {
          setPlanData(parsedData);
        }
      }
    } catch (error) {
      console.error("Error reading financial plan data from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-xl">Caricamento dati...</div>
        </div>
    );
  }
  
  if (!planData) {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="text-xl text-center">Nessun piano finanziario trovato.</div>
            <Button onClick={() => navigate('/plan')}>Crea un nuovo piano</Button>
        </div>
    );
  }

  return <ExecutiveDashboard planData={planData} />;
};

export default Index;
