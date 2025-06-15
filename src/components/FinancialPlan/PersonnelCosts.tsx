
import React, { useMemo } from 'react';
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
    const updatedData = data.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setData(updatedData);
  };

  const handleContractTypeChange = (index: number, value: PersonnelCost['contractType']) => {
    const updatedData = [...data];
    updatedData[index] = { 
        ...updatedData[index], 
        contractType: value,
        annualGrossSalary: value === 'Dipendente' ? (updatedData[index].annualGrossSalary || 0) : undefined,
        companyCostCoefficient: value === 'Dipendente' ? (updatedData[index].companyCostCoefficient || 1.6) : undefined,
        annualSalaryIncrease: updatedData[index].annualSalaryIncrease,
        bonusType: value === 'Dipendente' ? (updatedData[index].bonusType || 'Nessuno') : undefined,
        bonusValue: value === 'Dipendente' ? (updatedData[index].bonusValue || 0) : undefined,
        monthlyCost: value !== 'Dipendente' ? (updatedData[index].monthlyCost || 0) : undefined,
    };
    setData(updatedData);
  }

  const addRow = () => {
    setData([...data, { 
        id: crypto.randomUUID(), 
        role: '', 
        contractType: 'Dipendente', 
        hiringMonth: 1,
        annualGrossSalary: 30000,
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
                <TableHead className="min-w-[150px] text-right">RAL / Costo Mensile (€)</TableHead>
                <TableHead className="text-right">Coeff. Costo Az.</TableHead>
                <TableHead className="text-right">Aum. Salariale Annuo (%)</TableHead>
                <TableHead className="min-w-[200px]">Bonus</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
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
                    {item.contractType === 'Dipendente' ? (
                      <Input type="number" value={item.annualGrossSalary || ''} onChange={e => handleInputChange(index, 'annualGrossSalary', Number(e.target.value))} className="text-right" placeholder="RAL annua"/>
                    ) : (
                      <Input type="number" value={item.monthlyCost || ''} onChange={e => handleInputChange(index, 'monthlyCost', Number(e.target.value))} className="text-right" placeholder="Costo mensile"/>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.contractType === 'Dipendente' && <Input type="number" step="0.1" value={item.companyCostCoefficient || ''} onChange={e => handleInputChange(index, 'companyCostCoefficient', Number(e.target.value))} className="text-right" />}
                  </TableCell>
                  <TableCell>
                     {item.contractType === 'Dipendente' && <Input type="number" value={item.annualSalaryIncrease || ''} onChange={e => handleInputChange(index, 'annualSalaryIncrease', Number(e.target.value))} className="text-right" />}
                  </TableCell>
                  <TableCell>
                    {item.contractType === 'Dipendente' && (
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
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                  <TableCell colSpan={8}>
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
