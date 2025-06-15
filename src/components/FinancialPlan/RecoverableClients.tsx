
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import { RecoverableClient } from './types';

interface Props {
  data: RecoverableClient[];
  setData: (data: RecoverableClient[]) => void;
}

export function RecoverableClients({ data, setData }: Props) {
  
  const handleInputChange = (index: number, field: keyof RecoverableClient, value: string | number) => {
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
    setData([...data, { id: crypto.randomUUID(), name: '', previousAnnualRevenue: 0, recoveryProbability: 80, contractStartDateMonth: 1, serviceType: 'ricorrente', recoveryAmountPercentage: 30, annualIncreasePercentage: 0, contractDurationMonths: 12, renewalProbability: 50, activationRampUpMonths: 0, specificCollectionDays: 60 }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  const totalPregresso = useMemo(() => {
      return data.reduce((acc, curr) => acc + Number(curr.previousAnnualRevenue || 0), 0);
  }, [data]);

  const totalExpectedRecoveredRevenue = useMemo(() => {
    return data.reduce((acc, curr) => {
      const expectedRevenue = (Number(curr.previousAnnualRevenue) || 0) * (Number(curr.recoveryProbability) || 0) / 100 * (Number(curr.recoveryAmountPercentage) || 0) / 100;
      return acc + expectedRevenue;
    }, 0);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Ricavi: Clienti Recuperabili</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Cliente/Cluster</TableHead>
              <TableHead className="min-w-[150px]">Fatturato Annuo Pregresso</TableHead>
              <TableHead className="min-w-[120px]">Prob. di Recupero %</TableHead>
              <TableHead className="min-w-[120px]">Mese Partenza</TableHead>
              <TableHead className="min-w-[150px]">Tipo Servizio</TableHead>
              <TableHead className="min-w-[150px]">Durata Contratto (Mesi)</TableHead>
              <TableHead className="min-w-[150px]">Prob. Rinnovo (%)</TableHead>
              <TableHead className="min-w-[150px]">Rampa Attivazione (Mesi)</TableHead>
              <TableHead className="min-w-[150px]">Ritardo Incasso (gg)</TableHead>
              <TableHead className="min-w-[120px]">% Incremento Annuo</TableHead>
              <TableHead className="min-w-[120px]">% Importo di Recupero</TableHead>
              <TableHead className="min-w-[180px]">Fatturato Recuperato Atteso</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const expectedRecoveredRevenue = (item.previousAnnualRevenue || 0) * (item.recoveryProbability || 0) / 100 * (item.recoveryAmountPercentage || 0) / 100;
              const isRecurring = item.serviceType === 'ricorrente';
              return (
              <TableRow key={item.id}>
                <TableCell><Input value={item.name} onChange={e => handleInputChange(index, 'name', e.target.value)} placeholder="Es. Cliente A" /></TableCell>
                <TableCell><Input type="number" value={item.previousAnnualRevenue} onChange={e => handleInputChange(index, 'previousAnnualRevenue', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.recoveryProbability} onChange={e => handleInputChange(index, 'recoveryProbability', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.contractStartDateMonth} onChange={e => handleInputChange(index, 'contractStartDateMonth', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell>
                  <Select value={item.serviceType} onValueChange={(value: 'ricorrente' | 'una_tantum') => handleSelectChange(index, value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ricorrente">Ricorrente</SelectItem>
                      <SelectItem value="una_tantum">Una Tantum</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Input type="number" value={item.contractDurationMonths || ''} onChange={e => handleInputChange(index, 'contractDurationMonths', Number(e.target.value))} className="text-right" disabled={!isRecurring} /></TableCell>
                <TableCell><Input type="number" value={item.renewalProbability || ''} onChange={e => handleInputChange(index, 'renewalProbability', Number(e.target.value))} className="text-right" disabled={!isRecurring} /></TableCell>
                <TableCell><Input type="number" value={item.activationRampUpMonths || ''} onChange={e => handleInputChange(index, 'activationRampUpMonths', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.specificCollectionDays || ''} onChange={e => handleInputChange(index, 'specificCollectionDays', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.annualIncreasePercentage || 0} onChange={e => handleInputChange(index, 'annualIncreasePercentage', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell><Input type="number" value={item.recoveryAmountPercentage} onChange={e => handleInputChange(index, 'recoveryAmountPercentage', Number(e.target.value))} className="text-right" /></TableCell>
                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">{formatCurrency(expectedRecoveredRevenue)}</TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            )})}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell>
                    <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Cliente</Button>
                </TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalPregresso)}</TableCell>
                <TableCell colSpan={9}></TableCell>
                <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalExpectedRecoveredRevenue)}</TableCell>
                <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
