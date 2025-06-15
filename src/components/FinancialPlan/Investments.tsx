
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
  const handleInputChange = (index: number, field: keyof InitialInvestment, value: any) => {
    const updated = [...data];
    const item = { ...updated[index], [field]: value };
    if (field === 'paymentMethod' && value === 'Unica Soluzione') {
        delete item.installments;
    }
    updated[index] = item;
    setData(updated);
  };

  const addRow = () => setData([...data, { id: crypto.randomUUID(), name: '', cost: 0, investmentMonth: 1, amortizationYears: 5, paymentMethod: 'Unica Soluzione' }]);
  const removeRow = (id: string) => setData(data.filter(i => i.id !== id));

  const totalInvestment = useMemo(() => data.reduce((acc, curr) => acc + Number(curr.cost || 0), 0), [data]);
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
              <TableHead className="w-[50px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((investment, index) => (
              <TableRow key={investment.id}>
                <TableCell><Input value={investment.name} onChange={e => handleInputChange(index, 'name', e.target.value)} placeholder="Es. Hardware" /></TableCell>
                <TableCell><Input type="number" value={investment.cost} onChange={e => handleInputChange(index, 'cost', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={investment.investmentMonth} onChange={e => handleInputChange(index, 'investmentMonth', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={investment.amortizationYears} onChange={e => handleInputChange(index, 'amortizationYears', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select value={investment.paymentMethod} onValueChange={value => handleInputChange(index, 'paymentMethod', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unica Soluzione">Unica Soluzione</SelectItem>
                        <SelectItem value="Rateizzato">Rateizzato</SelectItem>
                      </SelectContent>
                    </Select>
                    {investment.paymentMethod === 'Rateizzato' && (
                      <Input type="number" value={investment.installments || ''} onChange={e => handleInputChange(index, 'installments', Number(e.target.value))} placeholder="Nr. rate" className="w-[100px]" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeRow(investment.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
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
