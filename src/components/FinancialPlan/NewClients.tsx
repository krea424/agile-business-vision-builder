import React, { useMemo } from 'react';
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

const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const calculateGeneratedRevenue = (item: NewClientAcquisition): number => {
    if (!item.monthlyMarketingInvestment || !item.leadsPer100Invested || !item.conversionRate || !item.averageAnnualContractValue) {
        return 0;
    }
    const annualMarketingInvestment = item.monthlyMarketingInvestment * 12;
    const annualLeads = (annualMarketingInvestment / 100) * item.leadsPer100Invested;
    const annualNewContracts = annualLeads * (item.conversionRate / 100);
    const annualRevenue = annualNewContracts * item.averageAnnualContractValue;
    return annualRevenue;
};

export function NewClients({ data, setData }: Props) {
  
  const handleInputChange = (index: number, field: keyof NewClientAcquisition, value: string | number) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);
  };

  const addRow = () => {
    setData([...data, { id: crypto.randomUUID(), channel: '', monthlyMarketingInvestment: 0, leadsPer100Invested: 0, conversionRate: 0, averageAnnualContractValue: 0, startMonth: 1 }]);
  };

  const removeRow = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  const totalGeneratedRevenue = useMemo(() => {
    return data.reduce((acc, curr) => acc + calculateGeneratedRevenue(curr), 0);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Ricavi: Nuovi Clienti (da Marketing)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Canale/Servizio</TableHead>
              <TableHead>Investimento Marketing Mensile (€)</TableHead>
              <TableHead>Lead / 100€ investiti</TableHead>
              <TableHead>Tasso Conversione (%)</TableHead>
              <TableHead>Valore Medio Contratto Annuo (€)</TableHead>
              <TableHead className="text-right">Mese Partenza (da inizio progetto)</TableHead>
              <TableHead className="text-right">Ricavi Annui Ricorrenti Generati</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const generatedRevenue = calculateGeneratedRevenue(item);
              return (
                <TableRow key={item.id}>
                  <TableCell><Input value={item.channel} onChange={e => handleInputChange(index, 'channel', e.target.value)} placeholder="Es. Networking" /></TableCell>
                  <TableCell><Input type="number" value={item.monthlyMarketingInvestment} onChange={e => handleInputChange(index, 'monthlyMarketingInvestment', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Input type="number" value={item.leadsPer100Invested} onChange={e => handleInputChange(index, 'leadsPer100Invested', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Input type="number" value={item.conversionRate} onChange={e => handleInputChange(index, 'conversionRate', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Input type="number" value={item.averageAnnualContractValue} onChange={e => handleInputChange(index, 'averageAnnualContractValue', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Input type="number" value={item.startMonth} onChange={e => handleInputChange(index, 'startMonth', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(generatedRevenue)}
                  </TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
                <TableCell colSpan={6}>
                    <Button variant="outline" size="sm" onClick={addRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Canale</Button>
                </TableCell>
                <TableCell className="text-right font-bold tabular-nums">
                    {formatCurrency(totalGeneratedRevenue)}
                </TableCell>
                <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
