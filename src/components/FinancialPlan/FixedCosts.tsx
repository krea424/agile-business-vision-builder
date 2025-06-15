
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
  const handleInputChange = (index: number, field: keyof FixedCost, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setData(updated);
  };

  const addRow = () => setData([...data, { id: crypto.randomUUID(), name: '', monthlyCost: 0, startMonth: 1, indexedToInflation: true, paymentFrequency: 'Mensile' }]);
  const removeRow = (id: string) => setData(data.filter(c => c.id !== id));
  
  const totalMonthly = data.reduce((acc, curr) => acc + Number(curr.monthlyCost || 0), 0);
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
              <TableHead className="w-[50px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cost, index) => (
              <TableRow key={cost.id}>
                <TableCell><Input value={cost.name} onChange={e => handleInputChange(index, 'name', e.target.value)} placeholder="Es. Affitto ufficio" /></TableCell>
                <TableCell><Input type="number" value={cost.monthlyCost} onChange={e => handleInputChange(index, 'monthlyCost', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={cost.startMonth} onChange={e => handleInputChange(index, 'startMonth', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Checkbox checked={cost.indexedToInflation} onCheckedChange={checked => handleInputChange(index, 'indexedToInflation', checked)} /></TableCell>
                <TableCell>
                  <Select value={cost.paymentFrequency} onValueChange={value => handleInputChange(index, 'paymentFrequency', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensile">Mensile</SelectItem>
                      <SelectItem value="Trimestrale">Trimestrale</SelectItem>
                      <SelectItem value="Semestrale">Semestrale</SelectItem>
                      <SelectItem value="Annuale">Annuale</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeRow(cost.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
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
