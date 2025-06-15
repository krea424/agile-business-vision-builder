import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PersonnelCost } from './types';
import { PersonnelCostRow } from './PersonnelCostRow';

interface Props {
  data: PersonnelCost[];
  setData: (data: PersonnelCost[]) => void;
}

export function PersonnelCosts({ data, setData }: Props) {
  
  const handleInputChange = (index: number, field: keyof PersonnelCost, value: any) => {
    const updatedData = data.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value };
        
        if (newItem.contractType === 'Dipendente' && (field === 'monthlyNetSalary' || field === 'ralCoefficient')) {
            const netSalary = newItem.monthlyNetSalary || 0;
            const coefficient = newItem.ralCoefficient || 0;
            newItem.annualGrossSalary = netSalary * coefficient;
        }
        return newItem;
      }
      return item;
    });
    setData(updatedData);
  };

  const handleContractTypeChange = (index: number, value: PersonnelCost['contractType']) => {
    const updatedData = [...data];
    const item = updatedData[index];
    const newItem = { ...item, contractType: value };

    if (value === 'Dipendente') {
        const monthlyNetSalary = item.monthlyNetSalary || 1500;
        const ralCoefficient = item.ralCoefficient || 18;
        
        newItem.monthlyNetSalary = monthlyNetSalary;
        newItem.ralCoefficient = ralCoefficient;
        newItem.annualGrossSalary = monthlyNetSalary * ralCoefficient;
        newItem.companyCostCoefficient = item.companyCostCoefficient ?? 1.6;
        newItem.annualSalaryIncrease = item.annualSalaryIncrease ?? 2;
        newItem.bonusType = item.bonusType || 'Nessuno';
        newItem.bonusValue = item.bonusValue ?? 0;
        newItem.monthlyCost = undefined;
    } else { // Freelance or Amministratore
        newItem.monthlyCost = item.monthlyCost ?? 0;
        newItem.monthlyNetSalary = undefined;
        newItem.ralCoefficient = undefined;
        newItem.annualGrossSalary = undefined;
        newItem.companyCostCoefficient = undefined;
        newItem.annualSalaryIncrease = undefined;
        newItem.bonusType = undefined;
        newItem.bonusValue = undefined;
    }
    
    updatedData[index] = newItem;
    setData(updatedData);
}

  const addRow = () => {
    const monthlyNetSalary = 1500;
    const ralCoefficient = 18;
    setData([...data, { 
        id: crypto.randomUUID(), 
        role: '', 
        contractType: 'Dipendente', 
        hiringMonth: 1,
        monthlyNetSalary,
        ralCoefficient,
        annualGrossSalary: monthlyNetSalary * ralCoefficient,
        companyCostCoefficient: 1.6,
        annualSalaryIncrease: 2,
        bonusType: 'Nessuno',
        bonusValue: 0,
    }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const totals = data.reduce((acc, item) => {
    let annualCompanyCost = 0;
    if (item.contractType === 'Dipendente') {
      annualCompanyCost = (item.annualGrossSalary || 0) * (item.companyCostCoefficient || 0);
      if (item.bonusType === 'Importo Fisso Annuo') {
        annualCompanyCost += (item.bonusValue || 0);
      }
    } else if (item.contractType === 'Freelance/P.IVA' || item.contractType === 'Compenso Amministratore') {
      annualCompanyCost = (item.monthlyCost || 0) * 12;
    }
    
    acc.totalAnnualCost += annualCompanyCost;
    acc.totalMonthlyCost += annualCompanyCost / 12;
    
    return acc;
  }, { totalAnnualCost: 0, totalMonthlyCost: 0 });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Costi: Personale</CardTitle>
        <CardDescription>
          Definisci i costi del personale, distinguendo tra dipendenti, freelance e amministratori.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Ruolo</TableHead>
                <TableHead className="min-w-[200px]">Tipo Contratto</TableHead>
                <TableHead className="text-right">Mese Avvio</TableHead>
                <TableHead className="text-right">Mese Fine</TableHead>
                <TableHead className="min-w-[150px] text-right">Stipendio Netto Mensile (€)</TableHead>
                <TableHead className="min-w-[120px] text-right">Coeff. per RAL</TableHead>
                <TableHead className="min-w-[150px] text-right">RAL / Costo Mensile (€)</TableHead>
                <TableHead className="min-w-[120px] text-right">Coeff. Costo Az.</TableHead>
                <TableHead className="min-w-[150px] text-right">Costo Annuo Azienda (€)</TableHead>
                <TableHead className="min-w-[150px] text-right">Costo Mensile Azienda (€)</TableHead>
                <TableHead className="text-right">Aum. Salariale Annuo (%)</TableHead>
                <TableHead className="min-w-[200px]">Bonus</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <PersonnelCostRow
                  key={item.id}
                  item={item}
                  index={index}
                  onInputChange={handleInputChange}
                  onContractTypeChange={handleContractTypeChange}
                  onRemove={removeRow}
                  formatCurrency={formatCurrency}
                />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8} className="text-right font-bold">Totale</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totals.totalAnnualCost)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totals.totalMonthlyCost)}</TableCell>
                <TableCell colSpan={3} />
              </TableRow>
              <TableRow>
                  <TableCell colSpan={13}>
                      <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Ruolo</Button>
                  </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
