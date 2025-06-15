
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { VariableCost } from './types';

interface Props {
  data: VariableCost[];
  setData: (data: VariableCost[]) => void;
}

export function VariableCosts({ data, setData }: Props) {
  const handleInputChange = (index: number, field: keyof VariableCost, value: any) => {
    const updated = [...data];
    const item = { ...updated[index], [field]: value };

    if (field === 'calculationMethod' && value !== '% su Ricavi Specifici') {
        delete item.linkedRevenueChannel;
    }
    updated[index] = item;
    setData(updated);
  };

  const addRow = () => setData([...data, { id: crypto.randomUUID(), name: '', calculationMethod: '% su Ricavi Totali', value: 0 }]);
  const removeRow = (id: string) => setData(data.filter(c => c.id !== id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costi Variabili / COGS</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voce di Costo</TableHead>
              <TableHead>Metodo di Calcolo</TableHead>
              <TableHead>Canale Ricavo</TableHead>
              <TableHead className="text-right">Valore (% o €)</TableHead>
              <TableHead className="w-[50px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cost, index) => (
              <TableRow key={cost.id}>
                <TableCell><Input value={cost.name} onChange={e => handleInputChange(index, 'name', e.target.value)} placeholder="Es. Commissioni" /></TableCell>
                <TableCell>
                  <Select value={cost.calculationMethod} onValueChange={value => handleInputChange(index, 'calculationMethod', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="% su Ricavi Totali">% su Ricavi Totali</SelectItem>
                      <SelectItem value="% su Ricavi Specifici">% su Ricavi Specifici</SelectItem>
                      <SelectItem value="€ per Contratto">€ per Contratto</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {cost.calculationMethod === '% su Ricavi Specifici' && (
                    <Select value={cost.linkedRevenueChannel} onValueChange={value => handleInputChange(index, 'linkedRevenueChannel', value)}>
                      <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recoverable">Clienti Recuperabili</SelectItem>
                        <SelectItem value="new">Nuovi Clienti (Marketing)</SelectItem>
                        <SelectItem value="direct">Clienti Diretti</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell><Input type="number" value={cost.value} onChange={e => handleInputChange(index, 'value', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeRow(cost.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
              <TableRow>
                  <TableCell colSpan={5}>
                      <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Voce</Button>
                  </TableCell>
              </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
