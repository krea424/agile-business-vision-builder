
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GeneralAssumptions as GeneralAssumptionsType } from './types';

interface Props {
  data: GeneralAssumptionsType;
  setData: (data: GeneralAssumptionsType) => void;
}

export function GeneralAssumptions({ data, setData }: Props) {
  
  const handleChange = (field: keyof GeneralAssumptionsType, value: string | number) => {
    setData({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Generali</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeHorizon">Orizzonte Temporale (Anni)</Label>
          <Input id="timeHorizon" type="number" value={data.timeHorizon} onChange={e => handleChange('timeHorizon', Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Mese di Partenza</Label>
          <Input id="startDate" type="text" value={data.startDate} onChange={e => handleChange('startDate', e.target.value)} placeholder="Es. gen-25" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inflationRate">Tasso di Inflazione (%)</Label>
          <Input id="inflationRate" type="number" value={data.inflationRate} onChange={e => handleChange('inflationRate', Number(e.target.value))} />
        </div>
         <div className="space-y-2">
          <Label htmlFor="equityInjection">Apporto Capitale Proprio Iniziale (€)</Label>
          <Input id="equityInjection" type="number" value={data.equityInjection} onChange={e => handleChange('equityInjection', Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="iresRate">Aliquota IRES (%)</Label>
          <Input id="iresRate" type="number" value={data.iresRate} onChange={e => handleChange('iresRate', Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="irapRate">Aliquota IRAP (%)</Label>
          <Input id="irapRate" type="number" value={data.irapRate} onChange={e => handleChange('irapRate', Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="daysToCollectReceivables">Giorni medi incasso clienti</Label>
          <Input id="daysToCollectReceivables" type="number" value={data.daysToCollectReceivables} onChange={e => handleChange('daysToCollectReceivables', Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="daysToPayPayables">Giorni medi pagamento fornitori</Label>
          <Input id="daysToPayPayables" type="number" value={data.daysToPayPayables} onChange={e => handleChange('daysToPayPayables', Number(e.target.value))} />
        </div>
      </CardContent>
    </Card>
  );
}
