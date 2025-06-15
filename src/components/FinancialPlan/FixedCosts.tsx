
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { FixedCost } from './types';

interface Props {
  data: FixedCost[];
  setData: (data: FixedCost[]) => void;
}

export function FixedCosts({ data, setData }: Props) {
  const handleParentInputChange = (index: number, field: keyof Omit<FixedCost, 'subItems' | 'id'>, value: any) => {
    const updated = [...data];
    const item = { ...updated[index], [field]: value };
    if (field === 'monthlyCost' && item.subItems && item.subItems.length > 0) return;
    updated[index] = item;
    setData(updated);
  };
  
  const handleSubItemInputChange = (parentIndex: number, subIndex: number, field: 'name' | 'monthlyCost', value: any) => {
    const updated = [...data];
    const parentCost = updated[parentIndex];
    if (parentCost.subItems) {
        const updatedSubItems = [...parentCost.subItems];
        const val = field === 'monthlyCost' ? Number(value) : value;
        updatedSubItems[subIndex] = { ...updatedSubItems[subIndex], [field]: val };
        parentCost.subItems = updatedSubItems;
    }
    setData(updated);
  };

  const addRow = () => setData([...data, { id: crypto.randomUUID(), name: '', monthlyCost: 0, startMonth: 1, indexedToInflation: true, paymentFrequency: 'Mensile' }]);
  const removeRow = (id: string) => setData(data.filter(c => c.id !== id));
  
  const addSubItem = (parentIndex: number) => {
    const updated = [...data];
    const parentCost = updated[parentIndex];
    const newSubItem = { id: crypto.randomUUID(), name: '', monthlyCost: 0 };
    if (!parentCost.subItems) {
      parentCost.subItems = [];
    }
    parentCost.subItems.push(newSubItem);
    setData(updated);
  };

  const removeSubItem = (parentIndex: number, subItemId: string) => {
    const updated = [...data];
    const parentCost = updated[parentIndex];
    if (parentCost.subItems) {
      parentCost.subItems = parentCost.subItems.filter(si => si.id !== subItemId);
      if (parentCost.subItems.length === 0) {
        delete parentCost.subItems;
      }
      setData(updated);
    }
  };
  
  const totalMonthly = data.reduce((acc, curr) => {
      const cost = curr.subItems && curr.subItems.length > 0
          ? curr.subItems.reduce((subAcc, sub) => subAcc + Number(sub.monthlyCost || 0), 0)
          : Number(curr.monthlyCost || 0);
      return acc + cost;
  }, 0);
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costi Fissi Operativi (Overheads)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voce di Costo</TableHead>
              <TableHead className="text-right">Costo Mensile (€)</TableHead>
              <TableHead className="text-right">Mese Avvio</TableHead>
              <TableHead>Indicizzato</TableHead>
              <TableHead>Frequenza Pag.</TableHead>
              <TableHead className="w-[100px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cost, index) => {
                const hasSubItems = cost.subItems && cost.subItems.length > 0;
                const monthlyCost = hasSubItems 
                    ? cost.subItems.reduce((acc, si) => acc + Number(si.monthlyCost || 0), 0)
                    : cost.monthlyCost;

                return (
                  <React.Fragment key={cost.id}>
                    <TableRow>
                      <TableCell><Input value={cost.name} onChange={e => handleParentInputChange(index, 'name', e.target.value)} placeholder="Es. Affitto ufficio" /></TableCell>
                      <TableCell><Input type="number" value={monthlyCost} readOnly={hasSubItems} onChange={e => handleParentInputChange(index, 'monthlyCost', Number(e.target.value))} className="text-right" /></TableCell>
                      <TableCell><Input type="number" value={cost.startMonth} onChange={e => handleParentInputChange(index, 'startMonth', Number(e.target.value))} className="text-right" /></TableCell>
                      <TableCell><Checkbox checked={cost.indexedToInflation} onCheckedChange={checked => handleParentInputChange(index, 'indexedToInflation', checked)} /></TableCell>
                      <TableCell>
                        <Select value={cost.paymentFrequency} onValueChange={value => handleParentInputChange(index, 'paymentFrequency', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mensile">Mensile</SelectItem>
                            <SelectItem value="Trimestrale">Trimestrale</SelectItem>
                            <SelectItem value="Semestrale">Semestrale</SelectItem>
                            <SelectItem value="Annuale">Annuale</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => addSubItem(index)} aria-label="Aggiungi sotto-voce"><PlusCircle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => removeRow(cost.id)} aria-label="Rimuovi voce"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                    {hasSubItems && cost.subItems.map((subItem, subIndex) => (
                      <TableRow key={subItem.id} className="bg-muted/50">
                          <TableCell className="pl-12">
                              <Input value={subItem.name} onChange={e => handleSubItemInputChange(index, subIndex, 'name', e.target.value)} placeholder="Sotto-voce di costo" />
                          </TableCell>
                          <TableCell>
                              <Input type="number" value={subItem.monthlyCost} onChange={e => handleSubItemInputChange(index, subIndex, 'monthlyCost', e.target.value)} className="text-right" />
                          </TableCell>
                          <TableCell colSpan={3}></TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => removeSubItem(index, subItem.id)} aria-label="Rimuovi sotto-voce"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
            })}
          </TableBody>
          <TableFooter>
              <TableRow>
                  <TableCell>
                      <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Voce</Button>
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalMonthly)}</TableCell>
                  <TableCell colSpan={4}></TableCell>
              </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
