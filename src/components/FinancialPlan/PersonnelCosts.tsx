
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { PersonnelCost } from './types';

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
                <TableHead className="text-right">Mese Inizio</TableHead>
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
              {data.map((item, index) => {
                const isDipendente = item.contractType === 'Dipendente';
                const annualGrossSalary = item.annualGrossSalary || 0;
                const companyCostCoefficient = item.companyCostCoefficient || 1;
                const monthlyCost = item.monthlyCost || 0;

                const costoAnnuoAzienda = isDipendente 
                  ? annualGrossSalary * companyCostCoefficient
                  : monthlyCost * 12;
                  
                const costoMensileAzienda = isDipendente
                  ? (annualGrossSalary * companyCostCoefficient) / 12
                  : monthlyCost;

                return (
                    <TableRow key={item.id}>
                    <TableCell><Input value={item.role} onChange={e => handleInputChange(index, 'role', e.target.value)} placeholder="Es. Sviluppatore" /></TableCell>
                    <TableCell>
                        <Select value={item.contractType} onValueChange={(value: PersonnelCost['contractType']) => handleContractTypeChange(index, value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Dipendente">Dipendente</SelectItem>
                            <SelectItem value="Freelance/P.IVA">Freelance/P.IVA</SelectItem>
                            <SelectItem value="Compenso Amministratore">Compenso Amministratore</SelectItem>
                        </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell><Input type="number" value={item.hiringMonth} onChange={e => handleInputChange(index, 'hiringMonth', Number(e.target.value))} className="text-right" /></TableCell>
                    <TableCell><Input type="number" value={item.endMonth || ''} onChange={e => handleInputChange(index, 'endMonth', Number(e.target.value) || undefined)} className="text-right" placeholder="Opz." /></TableCell>
                    <TableCell>
                        {isDipendente && <Input type="number" value={item.monthlyNetSalary || ''} onChange={e => handleInputChange(index, 'monthlyNetSalary', Number(e.target.value))} className="text-right" placeholder="Netto mensile"/>}
                    </TableCell>
                    <TableCell>
                        {isDipendente && <Input type="number" step="0.1" value={item.ralCoefficient || ''} onChange={e => handleInputChange(index, 'ralCoefficient', Number(e.target.value))} className="text-right" placeholder="Coeff. RAL"/>}
                    </TableCell>
                    <TableCell>
                        {isDipendente ? (
                        <Input type="number" value={item.annualGrossSalary || 0} readOnly className="text-right bg-gray-100" placeholder="RAL annua"/>
                        ) : (
                        <Input type="number" value={item.monthlyCost || ''} onChange={e => handleInputChange(index, 'monthlyCost', Number(e.target.value))} className="text-right" placeholder="Costo mensile"/>
                        )}
                    </TableCell>
                    <TableCell>
                        {isDipendente && <Input type="number" step="0.1" value={item.companyCostCoefficient || ''} onChange={e => handleInputChange(index, 'companyCostCoefficient', Number(e.target.value))} className="text-right" />}
                    </TableCell>
                    <TableCell>
                        <Input type="text" value={formatCurrency(costoAnnuoAzienda)} readOnly className="text-right bg-gray-100" />
                    </TableCell>
                    <TableCell>
                        <Input type="text" value={formatCurrency(costoMensileAzienda)} readOnly className="text-right bg-gray-100" />
                    </TableCell>
                    <TableCell>
                        {isDipendente && <Input type="number" value={item.annualSalaryIncrease || ''} onChange={e => handleInputChange(index, 'annualSalaryIncrease', Number(e.target.value))} className="text-right" />}
                    </TableCell>
                    <TableCell>
                        {isDipendente && (
                            <div className="flex gap-2">
                            <Select value={item.bonusType || 'Nessuno'} onValueChange={(value) => handleInputChange(index, 'bonusType', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="Nessuno">Nessuno</SelectItem>
                                <SelectItem value="% su EBITDA">% su EBITDA</SelectItem>
                                <SelectItem value="% su Utile Netto">% su Utile Netto</SelectItem>
                                <SelectItem value="Importo Fisso Annuo">Importo Fisso Annuo</SelectItem>
                                </SelectContent>
                            </Select>
                            {(item.bonusType && item.bonusType !== 'Nessuno') && 
                                <Input type="number" value={item.bonusValue || ''} onChange={e => handleInputChange(index, 'bonusValue', Number(e.target.value))} className="w-[80px]" />
                            }
                            </div>
                        )}
                    </TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
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
