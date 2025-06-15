
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { InitialInvestment } from './types';

interface Props {
  data: InitialInvestment[];
  setData: (data: InitialInvestment[]) => void;
}

export function Investments({ data, setData }: Props) {
  const handleParentInputChange = (index: number, field: keyof Omit<InitialInvestment, 'subItems' | 'id'>, value: any) => {
    const updated = [...data];
    const item = { ...updated[index], [field]: value };

    if (field === 'cost' && item.subItems && item.subItems.length > 0) {
        return;
    }

    if (field === 'paymentMethod' && value === 'Unica Soluzione') {
        delete item.installments;
    }
    updated[index] = item;
    setData(updated);
  };

  const handleSubItemInputChange = (parentIndex: number, subIndex: number, field: 'name' | 'cost', value: any) => {
    const updated = [...data];
    const parentInvestment = updated[parentIndex];
    if (parentInvestment.subItems) {
      const updatedSubItems = [...parentInvestment.subItems];
      const val = field === 'cost' ? Number(value) : value;
      updatedSubItems[subIndex] = { ...updatedSubItems[subIndex], [field]: val };
      parentInvestment.subItems = updatedSubItems;
      setData(updated);
    }
  };

  const addRow = () => setData([...data, { id: crypto.randomUUID(), name: '', cost: 0, investmentMonth: 1, amortizationYears: 5, paymentMethod: 'Unica Soluzione' }]);
  const removeRow = (id: string) => setData(data.filter(i => i.id !== id));
  
  const addSubItem = (parentIndex: number) => {
    const updated = [...data];
    const parentInvestment = updated[parentIndex];
    const newSubItem = { id: crypto.randomUUID(), name: '', cost: 0 };
    if (!parentInvestment.subItems) {
      parentInvestment.subItems = [];
    }
    parentInvestment.subItems.push(newSubItem);
    setData(updated);
  };
  
  const removeSubItem = (parentIndex: number, subItemId: string) => {
    const updated = [...data];
    const parentInvestment = updated[parentIndex];
    if (parentInvestment.subItems) {
      parentInvestment.subItems = parentInvestment.subItems.filter(si => si.id !== subItemId);
      if (parentInvestment.subItems.length === 0) {
        delete parentInvestment.subItems;
      }
      setData(updated);
    }
  };

  const getInvestmentCost = (investment: InitialInvestment) => {
      if (investment.subItems && investment.subItems.length > 0) {
          return investment.subItems.reduce((acc, sub) => acc + Number(sub.cost || 0), 0);
      }
      return Number(investment.cost || 0);
  };

  const totalInvestment = useMemo(() => data.reduce((acc, curr) => acc + getInvestmentCost(curr), 0), [data]);
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investimenti (CapEx)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voce di Investimento</TableHead>
              <TableHead className="text-right">Costo (€)</TableHead>
              <TableHead className="text-right">Mese Invest.</TableHead>
              <TableHead className="text-right">Anni Ammort.</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="w-[100px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((investment, index) => {
              const hasSubItems = investment.subItems && investment.subItems.length > 0;
              const parentCost = getInvestmentCost(investment);

              return (
              <React.Fragment key={investment.id}>
                <TableRow>
                  <TableCell><Input value={investment.name} onChange={e => handleParentInputChange(index, 'name', e.target.value)} placeholder="Es. Hardware" /></TableCell>
                  <TableCell><Input type="number" value={parentCost} readOnly={hasSubItems} onChange={e => handleParentInputChange(index, 'cost', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Input type="number" value={investment.investmentMonth} onChange={e => handleParentInputChange(index, 'investmentMonth', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Input type="number" value={investment.amortizationYears} onChange={e => handleParentInputChange(index, 'amortizationYears', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Select value={investment.paymentMethod} onValueChange={value => handleParentInputChange(index, 'paymentMethod', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unica Soluzione">Unica Soluzione</SelectItem>
                          <SelectItem value="Rateizzato">Rateizzato</SelectItem>
                        </SelectContent>
                      </Select>
                      {investment.paymentMethod === 'Rateizzato' && (
                        <Input type="number" value={investment.installments || ''} onChange={e => handleParentInputChange(index, 'installments', Number(e.target.value))} placeholder="Nr. rate" className="w-[100px]" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => addSubItem(index)} aria-label="Aggiungi sotto-voce"><PlusCircle className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeRow(investment.id)} aria-label="Rimuovi voce"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
                {hasSubItems && investment.subItems.map((subItem, subIndex) => (
                    <TableRow key={subItem.id} className="bg-muted/50">
                        <TableCell className="pl-12">
                            <Input value={subItem.name} onChange={e => handleSubItemInputChange(index, subIndex, 'name', e.target.value)} placeholder="Sotto-voce di costo" />
                        </TableCell>
                         <TableCell>
                            <Input type="number" value={subItem.cost} onChange={e => handleSubItemInputChange(index, subIndex, 'cost', Number(e.target.value))} className="text-right" />
                        </TableCell>
                        <TableCell colSpan={3}></TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => removeSubItem(index, subItem.id)} aria-label="Rimuovi sotto-voce"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                    </TableRow>
                ))}
              </React.Fragment>
            )})}
          </TableBody>
          <TableFooter>
              <TableRow>
                  <TableCell>
                      <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Voce</Button>
                  </TableCell>
                  <TableCell className="text-right font-bold" colSpan={5}>{formatCurrency(totalInvestment)}</TableCell>
              </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
