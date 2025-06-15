
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  data: GeneralAssumptionsType;
  setData: (data: GeneralAssumptionsType) => void;
}

export function GeneralAssumptions({ data, setData }: Props) {
  
  const handleChange = (field: keyof GeneralAssumptionsType, value: string | number) => {
    setData({ ...data, [field]: value });
  };
  
  const handleSelectChange = (field: keyof GeneralAssumptionsType, value: string) => {
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scenarioName">Nome dello Scenario</Label>
          <Input id="scenarioName" type="text" value={data.scenarioName || ''} onChange={e => handleChange('scenarioName', e.target.value)} />
        </div>
        
        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Ipotesi Generali e Fiscali</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                <div className="space-y-2 md:col-span-2 lg:col-span-4">
                  <Label htmlFor="companyName">Nome Azienda</Label>
                  <Input id="companyName" type="text" value={data.companyName || ''} onChange={e => handleChange('companyName', e.target.value)} />
                </div>
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
                  <Label htmlFor="iresRate">Aliquota IRES (%)</Label>
                  <Input id="iresRate" type="number" value={data.iresRate} onChange={e => handleChange('iresRate', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="irapRate">Aliquota IRAP (%)</Label>
                  <Input id="irapRate" type="number" value={data.irapRate} onChange={e => handleChange('irapRate', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averageVatRate">Aliquota IVA media (%)</Label>
                  <Input id="averageVatRate" type="number" value={data.averageVatRate} onChange={e => handleChange('averageVatRate', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Periodicità Liquidazione IVA</Label>
                  <Select onValueChange={(value) => handleSelectChange('vatPaymentFrequency', value)} defaultValue={data.vatPaymentFrequency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensile">Mensile</SelectItem>
                      <SelectItem value="Trimestrale">Trimestrale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label>Valuta</Label>
                  <Select onValueChange={(value) => handleSelectChange('currency', value)} defaultValue={data.currency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="GBP">£ GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Struttura Finanziaria e di Cassa</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="equityInjection">Apporto Capitale Proprio Iniziale</Label>
                  <Input id="equityInjection" type="number" value={data.equityInjection} onChange={e => handleChange('equityInjection', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialLoanAmount">Importo Finanziamento Iniziale</Label>
                  <Input id="initialLoanAmount" type="number" value={data.initialLoanAmount} onChange={e => handleChange('initialLoanAmount', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanInterestRate">Tasso Interesse Annuo (TAN) %</Label>
                  <Input id="loanInterestRate" type="number" value={data.loanInterestRate} onChange={e => handleChange('loanInterestRate', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanDurationMonths">Durata Finanziamento (Mesi)</Label>
                  <Input id="loanDurationMonths" type="number" value={data.loanDurationMonths} onChange={e => handleChange('loanDurationMonths', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daysToCollectReceivables">Giorni medi incasso clienti</Label>
                  <Input id="daysToCollectReceivables" type="number" value={data.daysToCollectReceivables} onChange={e => handleChange('daysToCollectReceivables', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daysToPayPayables">Giorni medi pagamento fornitori</Label>
                  <Input id="daysToPayPayables" type="number" value={data.daysToPayPayables} onChange={e => handleChange('daysToPayPayables', Number(e.target.value))} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="minimumCashBuffer">Fondo Cassa Minimo / Buffer</Label>
                  <Input id="minimumCashBuffer" type="number" value={data.minimumCashBuffer} onChange={e => handleChange('minimumCashBuffer', Number(e.target.value))} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Driver di Crescita e Valutazione</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="annualNewRevenueGrowthRate">Tasso Crescita Annuo Nuovi Ricavi %</Label>
                  <Input id="annualNewRevenueGrowthRate" type="number" value={data.annualNewRevenueGrowthRate} onChange={e => handleChange('annualNewRevenueGrowthRate', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerChurnRate">Tasso Attrito Clienti (Churn) %</Label>
                  <Input id="customerChurnRate" type="number" value={data.customerChurnRate} onChange={e => handleChange('customerChurnRate', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividendDistributionPolicy">Politica Distribuzione Dividendi %</Label>
                  <Input id="dividendDistributionPolicy" type="number" value={data.dividendDistributionPolicy} onChange={e => handleChange('dividendDistributionPolicy', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dividendDistributionStartYear">Anno Inizio Distribuzione Dividendi</Label>
                  <Input id="dividendDistributionStartYear" type="number" value={data.dividendDistributionStartYear} onChange={e => handleChange('dividendDistributionStartYear', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Metodo Calcolo Terminal Value</Label>
                  <Select onValueChange={(value) => handleSelectChange('terminalValueMethod', value)} defaultValue={data.terminalValueMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Multiplo EBITDA">Multiplo EBITDA</SelectItem>
                      <SelectItem value="Crescita Perpetua">Crescita Perpetua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {data.terminalValueMethod === 'Multiplo EBITDA' && (
                  <div className="space-y-2">
                    <Label htmlFor="exitMultiple">Multiplo di Uscita (x EBITDA)</Label>
                    <Input id="exitMultiple" type="number" value={data.exitMultiple} onChange={e => handleChange('exitMultiple', Number(e.target.value))} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="wacc">WACC / Tasso di Sconto %</Label>
                  <Input id="wacc" type="number" value={data.wacc} onChange={e => handleChange('wacc', Number(e.target.value))} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
