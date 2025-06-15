import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { FixedCost, VariableCost, InitialInvestment } from './types';

interface Props {
  fixedCosts: FixedCost[];
  variableCosts: VariableCost[];
  initialInvestments: InitialInvestment[];
  setFixedCosts: (costs: FixedCost[]) => void;
  setVariableCosts: (costs: VariableCost[]) => void;
  setInitialInvestments: (investments: InitialInvestment[]) => void;
}

export function OperationalInvestments({ fixedCosts, variableCosts, initialInvestments, setFixedCosts, setVariableCosts, setInitialInvestments }: Props) {

  const handleFixedChange = (index: number, field: keyof FixedCost, value: string | number) => {
    const updated = [...fixedCosts];
    updated[index] = { ...updated[index], [field]: value };
    setFixedCosts(updated);
  };
  
  const addFixedRow = () => setFixedCosts([...fixedCosts, { id: crypto.randomUUID(), name: '', monthlyCost: 0, startMonth: 1 }]);
  const removeFixedRow = (id: string) => setFixedCosts(fixedCosts.filter(c => c.id !== id));

  const handleVariableChange = (index: number, field: keyof VariableCost, value: string | number) => {
    const updated = [...variableCosts];
    updated[index] = { ...updated[index], [field]: value };
    setVariableCosts(updated);
  };

  const addVariableRow = () => setVariableCosts([...variableCosts, { id: crypto.randomUUID(), name: '', percentageOnRevenue: 0 }]);
  const removeVariableRow = (id: string) => setVariableCosts(variableCosts.filter(c => c.id !== id));

  const handleInvestmentChange = (index: number, field: keyof InitialInvestment, value: string | number) => {
    const updated = [...initialInvestments];
    updated[index] = { ...updated[index], [field]: value };
    setInitialInvestments(updated);
  };

  const addInvestmentRow = () => setInitialInvestments([...initialInvestments, { id: crypto.randomUUID(), name: '', cost: 0 }]);
  const removeInvestmentRow = (id: string) => setInitialInvestments(initialInvestments.filter(i => i.id !== id));

  const totalFixed = useMemo(() => fixedCosts.reduce((acc, curr) => acc + Number(curr.monthlyCost || 0), 0), [fixedCosts]);
  const totalInvestment = useMemo(() => initialInvestments.reduce((acc, curr) => acc + Number(curr.cost || 0), 0), [initialInvestments]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ipotesi Costi Operativi e Investimenti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Costi Fissi Mensili</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voce di Costo</TableHead>
                <TableHead className="text-right">Costo Mensile (€)</TableHead>
                <TableHead className="text-right">Mese Avvio (da inizio progetto)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedCosts.map((cost, index) => (
                <TableRow key={cost.id}>
                  <TableCell><Input value={cost.name} onChange={e => handleFixedChange(index, 'name', e.target.value)} placeholder="Es. Affitto ufficio" /></TableCell>
                  <TableCell><Input type="number" value={cost.monthlyCost} onChange={e => handleFixedChange(index, 'monthlyCost', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Input type="number" value={cost.startMonth} onChange={e => handleFixedChange(index, 'startMonth', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeFixedRow(cost.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>
                        <Button variant="outline" size="sm" onClick={addFixedRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Voce</Button>
                    </TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(totalFixed)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Costi Variabili</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voce di Costo</TableHead>
                <TableHead className="text-right">% su Fatturato</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variableCosts.map((cost, index) => (
                <TableRow key={cost.id}>
                  <TableCell><Input value={cost.name} onChange={e => handleVariableChange(index, 'name', e.target.value)} placeholder="Es. Commissioni" /></TableCell>
                  <TableCell><Input type="number" value={cost.percentageOnRevenue} onChange={e => handleVariableChange(index, 'percentageOnRevenue', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeVariableRow(cost.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3}>
                        <Button variant="outline" size="sm" onClick={addVariableRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Voce</Button>
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Investimenti Iniziali (One-Off)</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voce di Investimento</TableHead>
                <TableHead className="text-right">Costo (€)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialInvestments.map((investment, index) => (
                <TableRow key={investment.id}>
                  <TableCell><Input value={investment.name} onChange={e => handleInvestmentChange(index, 'name', e.target.value)} placeholder="Es. Sviluppo sito" /></TableCell>
                  <TableCell><Input type="number" value={investment.cost} onChange={e => handleInvestmentChange(index, 'cost', Number(e.target.value))} className="text-right" /></TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => removeInvestmentRow(investment.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>
                        <Button variant="outline" size="sm" onClick={addInvestmentRow}><PlusCircle className="h-4 w-4 mr-2" /> Aggiungi Voce</Button>
                    </TableCell>
                    <TableCell className="text-right font-bold" colSpan={2}>{formatCurrency(totalInvestment)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
