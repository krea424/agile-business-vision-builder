
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinancialPlanState, YearlyData, CashFlowYearlyData } from '@/components/FinancialPlan/types';
import { DashboardData } from '@/components/FinancialPlan/dashboardCalculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Presentation, FileDown } from 'lucide-react';
import { exportToExcel, exportToPptx } from '@/lib/export';

type ExportDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  planData: FinancialPlanState;
  financialSummary: YearlyData[];
  cashFlowSummary: CashFlowYearlyData[];
  dashboardData: DashboardData;
};

export const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, planData, financialSummary, cashFlowSummary, dashboardData }) => {
    const navigate = useNavigate();
    const [isGenerating, setIsGenerating] = useState<null | 'excel' | 'pptx'>(null);

    const handleExport = async (type: 'excel' | 'pptx') => {
        setIsGenerating(type);
        // a small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 100));
        try {
            if (type === 'excel') {
                exportToExcel(planData, financialSummary, cashFlowSummary);
            } else if (type === 'pptx') {
                exportToPptx(planData, dashboardData);
            }
        } catch (error) {
            console.error(`Error generating ${type} file:`, error);
        } finally {
            setIsGenerating(null);
            onClose();
        }
    };
    
    const handlePdfExport = () => {
        navigate('/report', { state: { planData, financialSummary, cashFlowSummary, dashboardData, autoPrint: true } });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Esporta Scenario Professionale</DialogTitle>
                    <DialogDescription>
                        Scegli il formato per il tuo report. Questa è una funzionalità premium per presentare i tuoi dati in modo efficace.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 py-4">
                    <Button onClick={handlePdfExport} variant="outline"><FileText className="mr-2"/> PDF Executive Summary</Button>
                    <Button onClick={() => handleExport('pptx')} variant="outline" disabled={isGenerating !== null}>
                        {isGenerating === 'pptx' ? <Loader2 className="mr-2 animate-spin" /> : <Presentation className="mr-2" />}
                        Presentazione PowerPoint (.pptx)
                    </Button>
                    <Button onClick={() => handleExport('excel')} variant="outline" disabled={isGenerating !== null}>
                        {isGenerating === 'excel' ? <Loader2 className="mr-2 animate-spin" /> : <FileDown className="mr-2" />}
                        File Excel Dettagliato (.xlsx)
                    </Button>
                </div>
                <DialogFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">L'esportazione di PPTX e Excel potrebbe richiedere alcuni secondi.</p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
