import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import { FinancialPlanState, YearlyData, CashFlowYearlyData } from '@/components/FinancialPlan/types';
import { DashboardData, KpiData } from '@/components/FinancialPlan/dashboardCalculator';
import { formatCurrency } from '@/lib/utils';

export const exportToExcel = (planData: FinancialPlanState, financialSummary: YearlyData[], cashFlowSummary: CashFlowYearlyData[]) => {
    const wb = XLSX.utils.book_new();

    const generalData = Object.entries(planData.general).map(([key, value]) => ({ 'Proprietà': key, 'Valore': value }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generalData), "Assunzioni Generali");
    
    if(planData.recoverableClients.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.recoverableClients), "Clienti da Recuperare");
    if(planData.newClients.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.newClients), "Nuovi Clienti");
    if(planData.directlyAcquiredClients.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.directlyAcquiredClients), "Clienti Diretti");
    if(planData.personnelCosts.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.personnelCosts), "Costi Personale");
    if(planData.fixedCosts.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.fixedCosts), "Costi Fissi");
    if(planData.variableCosts.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.variableCosts), "Costi Variabili");
    if(planData.initialInvestments.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(planData.initialInvestments), "Investimenti");
    
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(financialSummary), "Conto Economico");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cashFlowSummary), "Flusso di Cassa");

    XLSX.writeFile(wb, `${planData.general.scenarioName.replace(/ /g, '_')}_Export.xlsx`);
};

export const exportToPptx = (planData: FinancialPlanState, dashboardData: DashboardData) => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    // SLIDE 1: Title
    const slide1 = pptx.addSlide();
    slide1.background = { color: 'F8F9FA' };
    slide1.addText(planData.general.companyName, { x: 0.5, y: 1.5, w:'90%', fontSize: 36, fontFace: 'Inter', bold: true, color: '0B132B', align: 'center' });
    slide1.addText(`Financial Sustainability Plan`, { x: 0.5, y: 2.5, w:'90%', fontSize: 24, fontFace: 'Inter', color: '3A506B', align: 'center' });
    slide1.addText(`Scenario: ${planData.general.scenarioName}`, { x: 0.5, y: 3.0, w:'90%', fontSize: 18, fontFace: 'Inter', color: '5BC0BE', align: 'center', bold: true });
    slide1.addText(`Data: ${new Date().toLocaleDateString('it-IT')}`, { x: 0.5, y: 5.0, w:'90%', fontSize: 14, fontFace: 'Inter', color: '6C757D', align: 'center' });

    // SLIDE 2: KPIs
    const slide2 = pptx.addSlide();
    slide2.background = { color: 'F8F9FA' };
    const { kpis } = dashboardData;

    const kpiRows: (string | { text: string; options: any })[][] = [];
    const headerOptions = { fill: '0B132B', color: 'FFFFFF', bold: true, valign: 'middle' as const, align: 'left' as const, fontSize: 12, fontFace: 'Inter' };
    kpiRows.push([{ text: 'Metrica Chiave', options: headerOptions }, { text: 'Valore', options: headerOptions }]);

    const cellStyle = { valign: 'middle' as const, border: { type: 'solid' as const, pt: 1, color: 'E9ECEF' }, fontSize: 11, fontFace: 'Inter', margin:[5,10,5,10] };
    const metricCellStyle = { ...cellStyle, align: 'left' as const, bold: true, color: '3A506B' };
    const valueCellStyle = { ...cellStyle, align: 'right' as const, color: '0B132B', bold: true };

    const addRow = (metric: string, value: string) => {
        kpiRows.push([{ text: metric, options: metricCellStyle }, { text: value, options: valueCellStyle }]);
    };

    if (kpis) {
        addRow('Fabbisogno Finanziario di Picco', formatCurrency(kpis.peakFundingRequirement));
        addRow(`Valore d'Impresa (a ${planData.general.timeHorizon} anni)`, formatCurrency(kpis.enterpriseValue));
        addRow('IRR (Internal Rate of Return)', `${kpis.irr ? (kpis.irr * 100).toFixed(1) : 'N/A'}%`);
        addRow('Tempo di Rientro (Payback)', kpis.paybackPeriodYears ? `${kpis.paybackPeriodYears.toFixed(1)} Anni` : 'N/A');
        addRow('Break-Even Point (EBITDA)', kpis.breakEvenMonth ? `Mese ${kpis.breakEvenMonth}` : 'Non raggiunto');
        addRow('Punto di Cassa più Basso', kpis.lowestCashPoint ? `${formatCurrency(kpis.lowestCashPoint.value)} (Mese ${kpis.lowestCashPoint.month})` : 'N/A');
        
        // Add a spacer row for visual separation
        kpiRows.push([{ text: 'Unit Economics', options: { ...headerOptions, align: 'center' as const, colspan: 2, fill: '3A506B' } }]);
        
        addRow('Valore Cliente (LTV)', formatCurrency(kpis.ltv));
        addRow('Costo Acquisizione (CAC)', formatCurrency(kpis.cac));
        addRow('Rapporto LTV:CAC', kpis.ltvToCacRatio ? `${kpis.ltvToCacRatio.toFixed(1)}:1` : 'N/A');
    } else {
        kpiRows.push([{ text: 'Dati KPI non disponibili.', options: { ...metricCellStyle, colspan: 2, align: 'center' as const } }]);
    }
    
    slide2.addTable(kpiRows as any, { x: 0.5, y: 1.0, w: 9, autoPage: true, rowH: 0.5, colW: [4.5, 4.5] });
    
    // SLIDE 3: Chart
    if (dashboardData.monthlyChartData && dashboardData.monthlyChartData.length > 0) {
        const slide3 = pptx.addSlide();
        slide3.background = { color: 'F8F9FA' };
        slide3.addText('Andamento Economico e Finanziario', { x: 0.5, y: 0.25, w:'90%', fontSize: 24, fontFace: 'Inter', bold: true, color: '0B132B' });

        const chartLabels = dashboardData.monthlyChartData.map((d: any) => d.name);
        
        const chartData = [
            {
                name: 'Ricavi (€k)',
                labels: chartLabels,
                values: dashboardData.monthlyChartData.map((d: any) => Math.round((d.Ricavi || 0) / 1000)),
            },
            {
                name: 'EBITDA (€k)',
                labels: chartLabels,
                values: dashboardData.monthlyChartData.map((d: any) => Math.round((d.EBITDA || 0) / 1000)),
            },
            {
                name: 'Cassa Finale (€k)',
                labels: chartLabels,
                values: dashboardData.monthlyChartData.map((d: any) => Math.round((d['Cassa Finale'] || 0) / 1000)),
            },
        ];

        const chartOptions: PptxGenJS.IChartOpts = {
            x: 0.5, y: 1.0, w: 9, h: 4.5,
            showLegend: true, legendPos: 'b',
            catAxisLabelFontBold: true,
            valAxisLabelFormatCode: '#,##0',
            valAxisTitle: 'Importo (€k)',
            catAxisLabelFontFace: 'Inter',
            valAxisLabelFontFace: 'Inter',
            legendFontFace: 'Inter',
        };
        
        const chartTypes: PptxGenJS.IChartMulti[] = [
            {
                type: 'bar',
                data: chartData.slice(0, 1),
                options: { barDir: 'col', dataLabelColor: 'FFFFFF', dataLabelPosition: 'ctr',
                fill: '4A86E8',
              },
            },
            {
                type: 'line',
                data: chartData.slice(1, 2),
                options: { lineSmooth: true, lineSize: 3, lineDataSymbol: 'circle', lineDataSymbolSize: 6,
                color: 'F6B26B',
              },
            },
            {
                type: 'line',
                data: chartData.slice(2, 3),
                options: { lineSmooth: true, lineSize: 3, lineDataSymbol: 'triangle', lineDataSymbolSize: 6, secondaryValAxis: true, valAxisTitle: 'Cassa (€k)', valAxisLabelFormatCode: '#,##0',
                color: '6AA84F',
              },
            },
        ];
        
        slide3.addChart(chartTypes, chartOptions as any);
    }
    
    // SLIDE 4: Insights
    if (dashboardData.automatedInsights && dashboardData.automatedInsights.length > 0) {
        let insightSlide = pptx.addSlide();
        insightSlide.background = { color: 'F8F9FA' };
        insightSlide.addText('Insight Strategici', { x: 0.5, y: 0.25, w:'90%', fontSize: 24, fontFace: 'Inter', bold: true, color: '0B132B' });
        
        let yPos = 1.2;
        dashboardData.automatedInsights.forEach((insight: any) => {
            const descriptionLines = Math.ceil(insight.description.length / 90); // simple wrap estimation
            const insightHeight = (descriptionLines * 0.2) + 0.6;

            if (yPos + insightHeight > 5.5) {
                insightSlide = pptx.addSlide();
                insightSlide.background = { color: 'F8F9FA' };
                insightSlide.addText('Insight Strategici (continua)', { x: 0.5, y: 0.25, w:'90%', fontSize: 24, fontFace: 'Inter', bold: true, color: '0B132B' });
                yPos = 1.2;
            }
            
            insightSlide.addShape(pptx.ShapeType.rect, { x: 0.5, y: yPos - 0.2, w: 9, h: insightHeight, fill: { color: 'FFFFFF' }, shadow: { type: 'outer', color: 'E9ECEF', blur: 5, offset: 2, opacity: 0.7 }});

            insightSlide.addText(insight.title, {
                x: 0.7, y: yPos, w: '85%',
                fontFace: 'Inter', fontSize: 14, bold: true,
                color: insight.variant === 'destructive' ? 'D9534F' : '5BC0BE',
            });
            yPos += 0.4;
            insightSlide.addText(insight.description, {
                x: 0.7, y: yPos, w: 8.6,
                fontFace: 'Inter', fontSize: 12, color: '3A506B',
                autoFit: true,
            });
            yPos += insightHeight;
        });
    }

    pptx.writeFile({ fileName: `${planData.general.scenarioName.replace(/ /g, '_')}_Report.pptx` });
};
