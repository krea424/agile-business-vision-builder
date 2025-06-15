
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { NewClientAcquisition } from './types';

interface Props {
  data: NewClientAcquisition[];
  setData: (data: NewClientAcquisition[]) => void;
}

export function NewClients({ data, setData }: Props) {
  
  const handleInputChange = (index: number, field: keyof NewClientAcquisition, value: string | number) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);
  };

  const addRow = () => {
    setData([...data, { id: crypto.randomUUID(), channel: '', monthlyMarketingInvestment: 0, leadsPer100Invested: 0, conversionRate: 0, averageAnnualContractValue: 0 }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Ricavi: Nuovi Clienti</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Canale/Servizio</TableHead>
              <TableHead>Investimento Marketing Mensile</TableHead>
              <TableHead>Lead generati per 100€ investiti</TableHead>
              <TableHead>Tasso Conversione (Lead-&gt;Contratto) %</TableHead>
              <TableHead>Valore Medio Contratto Annuo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell><Input value={item.channel} onChange={e => handleInputChange(index, 'channel', e.target.value)} placeholder="Es. Networking" /></TableCell>
                <TableCell><Input type="number" value={item.monthlyMarketingInvestment} onChange={e => handleInputChange(index, 'monthlyMarketingInvestment', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.leadsPer100Invested} onChange={e => handleInputChange(index, 'leadsPer100Invested', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.conversionRate} onChange={e => handleInputChange(index, 'conversionRate', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.averageAnnualContractValue} onChange={e => handleInputChange(index, 'averageAnnualContractValue', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={6}>
                    <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Canale</Button>
                </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
