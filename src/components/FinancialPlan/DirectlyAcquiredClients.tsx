import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { DirectlyAcquiredClient } from './types';

interface Props {
  data: DirectlyAcquiredClient[];
  setData: (data: DirectlyAcquiredClient[]) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const calculateExpectedAnnualRevenue = (item: DirectlyAcquiredClient): number => {
    if (item.serviceType === 'ricorrente') {
        return (item.numberOfClients || 0) * (item.monthlyContractValue || 0) * 12;
    }
    return (item.numberOfClients || 0) * (item.annualContractValue || 0);
};

export function DirectlyAcquiredClients({ data, setData }: Props) {
  
  const handleInputChange = (index: number, field: keyof DirectlyAcquiredClient, value: string | number) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);
  };

  const handleSelectChange = (index: number, value: 'ricorrente' | 'una_tantum') => {
    const updatedData = [...data];
    updatedData[index].serviceType = value;
    setData(updatedData);
  };

  const addRow = () => {
    setData([...data, { id: crypto.randomUUID(), name: '', numberOfClients: 1, startMonth: 1, serviceType: 'ricorrente', annualContractValue: 0, monthlyContractValue: 0 }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };
  
  const totalExpectedRevenue = useMemo(() => {
    return data.reduce((acc, curr) => acc + calculateExpectedAnnualRevenue(curr), 0);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Ricavi: Clienti Acquisiti Direttamente</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Cliente/Gruppo Clienti</TableHead>
              <TableHead className="text-right">Nr. Clienti</TableHead>
              <TableHead className="text-right min-w-[180px]">Mese Partenza (da inizio progetto)</TableHead>
              <TableHead className="min-w-[150px]">Tipo Servizio</TableHead>
              <TableHead className="text-right min-w-[180px]">Importo Annuo (€)</TableHead>
              <TableHead className="text-right min-w-[180px]">Importo Mensile (€)</TableHead>
              <TableHead className="text-right min-w-[200px]">Fatturato Annuo Atteso</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const expectedRevenue = calculateExpectedAnnualRevenue(item);
              const isRecurring = item.serviceType === 'ricorrente';
              return (
              <TableRow key={item.id}>
                <TableCell><Input value={item.name} onChange={e => handleInputChange(index, 'name', e.target.value)} placeholder="Es. Passaparola" /></TableCell>
                <TableCell><Input type="number" value={item.numberOfClients} onChange={e => handleInputChange(index, 'numberOfClients', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.startMonth} onChange={e => handleInputChange(index, 'startMonth', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell>
                  <Select value={item.serviceType} onValueChange={(value: 'ricorrente' | 'una_tantum') => handleSelectChange(index, value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ricorrente">Ricorrente</SelectItem>
                      <SelectItem value="una_tantum">Una Tantum</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input type="number" value={item.annualContractValue} onChange={e => handleInputChange(index, 'annualContractValue', Number(e.target.value))} className="text-right" placeholder="Per Una Tantum" disabled={isRecurring} /></TableCell>
                <TableCell><Input type="number" value={item.monthlyContractValue} onChange={e => handleInputChange(index, 'monthlyContractValue', Number(e.target.value))} className="text-right" placeholder="Per Ricorrente" disabled={!isRecurring} /></TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-green-600">
                    {formatCurrency(expectedRevenue)}
                </TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            )})}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell>
                    <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Cliente</Button>
                </TableCell>
                <TableCell colSpan={5}></TableCell>
                <TableCell className="text-right font-bold text-green-600">{formatCurrency(totalExpectedRevenue)}</TableCell>
                <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
