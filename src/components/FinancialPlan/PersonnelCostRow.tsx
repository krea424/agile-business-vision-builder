
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { PersonnelCost } from './types';

interface PersonnelCostRowProps {
  item: PersonnelCost;
  index: number;
  onInputChange: (index: number, field: keyof PersonnelCost, value: any) => void;
  onContractTypeChange: (index: number, value: PersonnelCost['contractType']) => void;
  onRemove: (id: string) => void;
  formatCurrency: (value: number) => string;
}

export function PersonnelCostRow({ item, index, onInputChange, onContractTypeChange, onRemove, formatCurrency }: PersonnelCostRowProps) {
  const isDipendente = item.contractType === 'Dipendente';
  
  const annualGrossSalary = item.annualGrossSalary || 0;
  const companyCostCoefficient = item.companyCostCoefficient || 1;
  const monthlyCost = item.monthlyCost || 0;

  let costoAnnuoAzienda = isDipendente 
    ? annualGrossSalary * companyCostCoefficient
    : monthlyCost * 12;
  
  if (isDipendente && item.bonusType === 'Importo Fisso Annuo') {
      costoAnnuoAzienda += (item.bonusValue || 0);
  }
    
  const costoMensileAzienda = isDipendente
    ? costoAnnuoAzienda / 12
    : monthlyCost;

  return (
    <TableRow>
      <TableCell><Input value={item.role} onChange={e => onInputChange(index, 'role', e.target.value)} placeholder="Es. Sviluppatore" /></TableCell>
      <TableCell>
        <Select value={item.contractType} onValueChange={(value: PersonnelCost['contractType']) => onContractTypeChange(index, value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Dipendente">Dipendente</SelectItem>
            <SelectItem value="Freelance/P.IVA">Freelance/P.IVA</SelectItem>
            <SelectItem value="Compenso Amministratore">Compenso Amministratore</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell><Input type="number" value={item.hiringMonth} onChange={e => onInputChange(index, 'hiringMonth', Number(e.target.value))} className="text-right" /></TableCell>
      <TableCell><Input type="number" value={item.endMonth || ''} onChange={e => onInputChange(index, 'endMonth', Number(e.target.value) || undefined)} className="text-right" placeholder="Opz." /></TableCell>
      <TableCell>
        {isDipendente ? (
          <Input type="number" value={item.monthlyNetSalary || ''} onChange={e => onInputChange(index, 'monthlyNetSalary', Number(e.target.value))} className="text-right" placeholder="Netto mensile"/>
        ) : (
          <Input disabled className="text-right bg-gray-100" value="N/A" />
        )}
      </TableCell>
      <TableCell>
        {isDipendente ? (
          <Input type="number" step="0.1" value={item.ralCoefficient || ''} onChange={e => onInputChange(index, 'ralCoefficient', Number(e.target.value))} className="text-right" placeholder="Coeff. RAL"/>
        ) : (
          <Input disabled className="text-right bg-gray-100" value="N/A" />
        )}
      </TableCell>
      <TableCell>
        {isDipendente ? (
        <Input type="number" value={item.annualGrossSalary || 0} readOnly className="text-right bg-gray-100" placeholder="RAL annua"/>
        ) : (
        <Input type="number" value={item.monthlyCost || ''} onChange={e => onInputChange(index, 'monthlyCost', Number(e.target.value))} className="text-right" placeholder="Costo mensile"/>
        )}
      </TableCell>
      <TableCell>
        {isDipendente ? (
          <Input type="number" step="0.1" value={item.companyCostCoefficient || ''} onChange={e => onInputChange(index, 'companyCostCoefficient', Number(e.target.value))} className="text-right" />
        ) : (
          <Input disabled className="text-right bg-gray-100" value="N/A" />
        )}
      </TableCell>
      <TableCell>
        <Input type="text" value={formatCurrency(costoAnnuoAzienda)} readOnly className="text-right bg-gray-100" />
      </TableCell>
      <TableCell>
        <Input type="text" value={formatCurrency(costoMensileAzienda)} readOnly className="text-right bg-gray-100" />
      </TableCell>
      <TableCell>
        {isDipendente ? (
          <Input type="number" value={item.annualSalaryIncrease || ''} onChange={e => onInputChange(index, 'annualSalaryIncrease', Number(e.target.value))} className="text-right" />
        ) : (
          <Input disabled className="text-right bg-gray-100" value="N/A" />
        )}
      </TableCell>
      <TableCell>
        {isDipendente ? (
            <div className="flex gap-2">
            <Select value={item.bonusType || 'Nessuno'} onValueChange={(value) => onInputChange(index, 'bonusType', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                <SelectItem value="Nessuno">Nessuno</SelectItem>
                <SelectItem value="% su EBITDA">% su EBITDA</SelectItem>
                <SelectItem value="% su Utile Netto">% su Utile Netto</SelectItem>
                <SelectItem value="Importo Fisso Annuo">Importo Fisso Annuo</SelectItem>
                </SelectContent>
            </Select>
            {(item.bonusType && item.bonusType !== 'Nessuno') && 
                <Input type="number" value={item.bonusValue || ''} onChange={e => onInputChange(index, 'bonusValue', Number(e.target.value))} className="w-[80px]" />
            }
            </div>
        ) : (
            <Input disabled className="bg-gray-100 w-full" value="N/A" />
        )}
      </TableCell>
      <TableCell><Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
    </TableRow>
  );
}
