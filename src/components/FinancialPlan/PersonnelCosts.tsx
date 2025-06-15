
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { PersonnelCost } from './types';

interface Props {
  data: PersonnelCost[];
  setData: (data: PersonnelCost[]) => void;
}

export function PersonnelCosts({ data, setData }: Props) {
  
  const handleInputChange = (index: number, field: keyof PersonnelCost, value: string | number) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);
  };

  const addRow = () => {
    setData([...data, { id: crypto.randomUUID(), role: '', annualGrossSalary: 0, companyCostCoefficient: 1.5, hiringMonth: 1 }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const totalCompanyCost = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.annualGrossSalary || 0) * Number(curr.companyCostCoefficient || 0)), 0);
  }, [data]);

  const totalFirstYearCost = useMemo(() => {
    return data.reduce((acc, curr) => {
      const annualCost = (Number(curr.annualGrossSalary || 0) * Number(curr.companyCostCoefficient || 0));
      const hiringMonth = Number(curr.hiringMonth || 1);
      
      if (hiringMonth < 1 || hiringMonth > 12) {
        return acc;
      }
      
      const monthsInFirstYear = 12 - (hiringMonth - 1);
      const firstYearCost = (annualCost / 12) * monthsInFirstYear;
      return acc + firstYearCost;
    }, 0);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Costi: Personale</CardTitle>
        <CardDescription>
          Il "Costo Azienda Annuo" rappresenta il costo a regime per un anno intero. Il "Costo Effettivo Anno 1" è il costo riproporzionato in base al mese di assunzione e coincide con il valore nel Conto Economico per l'Anno 1.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ruolo</TableHead>
              <TableHead>Stipendio Lordo Annuo (RAL)</TableHead>
              <TableHead>Coeff. Costo Azienda</TableHead>
              <TableHead>Mese di Assunzione</TableHead>
              <TableHead>Costo Azienda Annuo</TableHead>
              <TableHead>Costo Effettivo Anno 1</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const annualCompanyCost = item.annualGrossSalary * item.companyCostCoefficient;
              const hiringMonth = Number(item.hiringMonth || 1);
              let firstYearCost = 0;
              if (hiringMonth >= 1 && hiringMonth <= 12) {
                  const monthsInFirstYear = 12 - (hiringMonth - 1);
                  firstYearCost = (annualCompanyCost / 12) * monthsInFirstYear;
              }

              return (
              <TableRow key={item.id}>
                <TableCell><Input value={item.role} onChange={e => handleInputChange(index, 'role', e.target.value)} placeholder="Es. Founder 1" /></TableCell>
                <TableCell><Input type="number" value={item.annualGrossSalary} onChange={e => handleInputChange(index, 'annualGrossSalary', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" step="0.1" value={item.companyCostCoefficient} onChange={e => handleInputChange(index, 'companyCostCoefficient', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.hiringMonth} onChange={e => handleInputChange(index, 'hiringMonth', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(annualCompanyCost)}</TableCell>
                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">{formatCurrency(firstYearCost)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            )})}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={4}>
                    <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Ruolo</Button>
                </TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalCompanyCost)}</TableCell>
                <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalFirstYearCost)}</TableCell>
                <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
