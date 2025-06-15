
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GeneralAssumptions as GeneralAssumptionsType } from './types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';

interface Props {
  data: GeneralAssumptionsType;
  setData: (data: GeneralAssumptionsType) => void;
}

export function GeneralAssumptions({ data, setData }: Props) {
  
  const handleChange = (field: keyof GeneralAssumptionsType, value: string | number) => {
    setData({ ...data, [field]: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // The format must be `MMM-yy` like `set-25` for the financial calculator
      const formattedDate = format(date, 'MMM-yy', { locale: it }).toLowerCase();
      handleChange('startDate', formattedDate);
    }
  };

  const monthMap: { [key: string]: number } = {
    gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5, lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11
  };

  const parseStartDate = (startDate: string): Date | undefined => {
    try {
      if (!startDate || typeof startDate !== 'string' || !startDate.includes('-')) {
        return undefined;
      }
      const [monthStr, yearStr] = startDate.split('-');
      if (monthStr && yearStr) {
        const month = monthMap[monthStr.toLowerCase()];
        const year = 2000 + parseInt(yearStr, 10);
        if (month !== undefined && !isNaN(year)) {
          return new Date(year, month, 1);
        }
      }
    } catch (e) {
      console.error("Error parsing start date:", startDate, e);
    }
    return undefined;
  };

  const selectedDate = parseStartDate(data.startDate);

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
          <Label>Mese di Partenza</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: it }) : <span>Scegli una data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear() - 5}
                  toYear={new Date().getFullYear() + 10}
                />
              </PopoverContent>
            </Popover>
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
