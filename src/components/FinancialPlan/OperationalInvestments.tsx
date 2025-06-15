import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, ChevronRight } from 'lucide-react';
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
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({...prev, [id]: !prev[id]}));
  };

  // --- Fixed Costs Handlers ---
  const handleFixedChange = (index: number, field: keyof FixedCost, value: string | number) => {
    const updated = [...fixedCosts];
    const item = updated[index];
    if (field === 'monthlyCost' && item.subItems && item.subItems.length > 0) return;
    updated[index] = { ...item, [field]: value };
    setFixedCosts(updated);
  };
  
  const addFixedRow = () => setFixedCosts([...fixedCosts, { id: crypto.randomUUID(), name: '', monthlyCost: 0, startMonth: 1 }]);
  const removeFixedRow = (id: string) => setFixedCosts(fixedCosts.filter(c => c.id !== id));

  const addFixedSubItem = (itemIndex: number) => {
    const updated = [...fixedCosts];
    const item = { ...updated[itemIndex] };
    if (!item.subItems) item.subItems = [];
    item.subItems.push({ id: crypto.randomUUID(), name: '', monthlyCost: 0 });
    updated[itemIndex] = item;
    setFixedCosts(updated);
  };

  const removeFixedSubItem = (itemIndex: number, subItemIndex: number) => {
    const updated = [...fixedCosts];
    const item = { ...updated[itemIndex] };
    item.subItems?.splice(subItemIndex, 1);
    item.monthlyCost = item.subItems?.reduce((acc, curr) => acc + (Number(curr.monthlyCost) || 0), 0) || 0;
    updated[itemIndex] = item;
    setFixedCosts(updated);
  };

  const handleFixedSubItemChange = (itemIndex: number, subItemIndex: number, field: 'name' | 'monthlyCost', value: string | number) => {
    const updated = [...fixedCosts];
    const item = { ...updated[itemIndex] };
    if (item.subItems) {
      const subItem = { ...item.subItems[subItemIndex] };
      (subItem as any)[field] = value;
      item.subItems[subItemIndex] = subItem;
      item.monthlyCost = item.subItems.reduce((acc, curr) => acc + (Number(curr.monthlyCost) || 0), 0);
      updated[itemIndex] = item;
      setFixedCosts(updated);
    }
  };

  // --- Variable Costs Handlers ---
  const handleVariableChange = (index: number, field: keyof VariableCost, value: string | number) => {
    const updated = [...variableCosts];
    const item = updated[index];
    if (field === 'percentageOnRevenue' && item.subItems && item.subItems.length > 0) return;
    updated[index] = { ...item, [field]: value };
    setVariableCosts(updated);
  };

  const addVariableRow = () => setVariableCosts([...variableCosts, { id: crypto.randomUUID(), name: '', percentageOnRevenue: 0 }]);
  const removeVariableRow = (id: string) => setVariableCosts(variableCosts.filter(c => c.id !== id));

  const addVariableSubItem = (itemIndex: number) => {
    const updated = [...variableCosts];
    const item = { ...updated[itemIndex] };
    if (!item.subItems) item.subItems = [];
    item.subItems.push({ id: crypto.randomUUID(), name: '', percentageOnRevenue: 0 });
    updated[itemIndex] = item;
    setVariableCosts(updated);
  };

  const removeVariableSubItem = (itemIndex: number, subItemIndex: number) => {
    const updated = [...variableCosts];
    const item = { ...updated[itemIndex] };
    item.subItems?.splice(subItemIndex, 1);
    item.percentageOnRevenue = item.subItems?.reduce((acc, curr) => acc + (Number(curr.percentageOnRevenue) || 0), 0) || 0;
    updated[itemIndex] = item;
    setVariableCosts(updated);
  };

  const handleVariableSubItemChange = (itemIndex: number, subItemIndex: number, field: 'name' | 'percentageOnRevenue', value: string | number) => {
    const updated = [...variableCosts];
    const item = { ...updated[itemIndex] };
    if (item.subItems) {
      const subItem = { ...item.subItems[subItemIndex] };
      (subItem as any)[field] = value;
      item.subItems[subItemIndex] = subItem;
      item.percentageOnRevenue = item.subItems.reduce((acc, curr) => acc + (Number(curr.percentageOnRevenue) || 0), 0);
      updated[itemIndex] = item;
      setVariableCosts(updated);
    }
  };

  // --- Initial Investments Handlers ---
  const handleInvestmentChange = (index: number, field: 'name' | 'cost', value: string | number) => {
    const updated = [...initialInvestments];
    const investment = updated[index];
    if (field === 'cost' && investment.subItems && investment.subItems.length > 0) return;

    updated[index] = { ...investment, [field]: value };
    setInitialInvestments(updated);
  };

  const addInvestmentRow = () => setInitialInvestments([...initialInvestments, { id: crypto.randomUUID(), name: '', cost: 0 }]);
  const removeInvestmentRow = (id: string) => setInitialInvestments(initialInvestments.filter(i => i.id !== id));

  const addSubItem = (investmentIndex: number) => {
    const updated = [...initialInvestments];
    const investment = { ...updated[investmentIndex] };
    if (!investment.subItems) {
      investment.subItems = [];
    }
    investment.subItems.push({ id: crypto.randomUUID(), name: '', cost: 0 });
    updated[investmentIndex] = investment;
    setInitialInvestments(updated);
  };

  const removeSubItem = (investmentIndex: number, subItemIndex: number) => {
    const updated = [...initialInvestments];
    const investment = { ...updated[investmentIndex] };
    investment.subItems?.splice(subItemIndex, 1);
    investment.cost = investment.subItems?.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0) || 0;
    updated[investmentIndex] = investment;
    setInitialInvestments(updated);
  };

  const handleSubItemChange = (investmentIndex: number, subItemIndex: number, field: 'name' | 'cost', value: string | number) => {
    const updated = [...initialInvestments];
    const investment = { ...updated[investmentIndex] };
    if (investment.subItems) {
      const subItem = { ...investment.subItems[subItemIndex] };
      (subItem as any)[field] = value;
      investment.subItems[subItemIndex] = subItem;
      investment.cost = investment.subItems.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
      updated[investmentIndex] = investment;
      setInitialInvestments(updated);
    }
  };

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
                <TableHead className="text-right">Mese Avvio</TableHead>
                <TableHead className="w-[170px] text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fixedCosts.map((cost, index) => {
                const hasSubItems = cost.subItems && cost.subItems.length > 0;
                const isExpanded = openItems[cost.id];
                const itemCost = hasSubItems ? cost.subItems.reduce((acc, curr) => acc + Number(curr.monthlyCost || 0), 0) : cost.monthlyCost;

                return (
                  <React.Fragment key={cost.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => toggleItem(cost.id)} className="mr-2">
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                          <Input value={cost.name} onChange={e => handleFixedChange(index, 'name', e.target.value)} placeholder="Es. Affitto ufficio" />
                        </div>
                      </TableCell>
                      <TableCell><Input type="number" value={itemCost} onChange={e => handleFixedChange(index, 'monthlyCost', Number(e.target.value))} className="text-right" disabled={hasSubItems} /></TableCell>
                      <TableCell><Input type="number" value={cost.startMonth} onChange={e => handleFixedChange(index, 'startMonth', Number(e.target.value))} className="text-right" /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => addFixedSubItem(index)} className="mr-2">Sottovoce</Button>
                        <Button variant="ghost" size="icon" onClick={() => removeFixedRow(cost.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && cost.subItems?.map((subItem, subIndex) => (
                      <TableRow key={subItem.id} className="bg-muted/50">
                        <TableCell className="pl-16">
                          <Input value={subItem.name} onChange={e => handleFixedSubItemChange(index, subIndex, 'name', e.target.value)} placeholder="Dettaglio" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={subItem.monthlyCost} onChange={e => handleFixedSubItemChange(index, subIndex, 'monthlyCost', Number(e.target.value))} className="text-right" />
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeFixedSubItem(index, subIndex)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
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
                <TableHead className="w-[170px] text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variableCosts.map((cost, index) => {
                const hasSubItems = cost.subItems && cost.subItems.length > 0;
                const isExpanded = openItems[cost.id];
                const itemCost = hasSubItems ? cost.subItems.reduce((acc, curr) => acc + Number(curr.percentageOnRevenue || 0), 0) : cost.percentageOnRevenue;

                return (
                  <React.Fragment key={cost.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center">
                           <Button variant="ghost" size="icon" onClick={() => toggleItem(cost.id)} className="mr-2">
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                          <Input value={cost.name} onChange={e => handleVariableChange(index, 'name', e.target.value)} placeholder="Es. Commissioni" />
                        </div>
                      </TableCell>
                      <TableCell><Input type="number" value={itemCost} onChange={e => handleVariableChange(index, 'percentageOnRevenue', Number(e.target.value))} className="text-right" disabled={hasSubItems}/></TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => addVariableSubItem(index)} className="mr-2">Sottovoce</Button>
                        <Button variant="ghost" size="icon" onClick={() => removeVariableRow(cost.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && cost.subItems?.map((subItem, subIndex) => (
                       <TableRow key={subItem.id} className="bg-muted/50">
                        <TableCell className="pl-16">
                          <Input value={subItem.name} onChange={e => handleVariableSubItemChange(index, subIndex, 'name', e.target.value)} placeholder="Dettaglio" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={subItem.percentageOnRevenue} onChange={e => handleVariableSubItemChange(index, subIndex, 'percentageOnRevenue', Number(e.target.value))} className="text-right" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeVariableSubItem(index, subIndex)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                )
              })}
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
                <TableHead className="w-[170px] text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialInvestments.map((investment, index) => {
                const hasSubItems = investment.subItems && investment.subItems.length > 0;
                const isExpanded = openItems[investment.id];
                const investmentCost = hasSubItems
                  ? investment.subItems.reduce((acc, curr) => acc + Number(curr.cost || 0), 0)
                  : investment.cost;

                return (
                  <React.Fragment key={investment.id}>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => toggleItem(investment.id)} className="mr-2">
                            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                          <Input value={investment.name} onChange={e => handleInvestmentChange(index, 'name', e.target.value)} placeholder="Es. Sviluppo sito" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={investmentCost} onChange={e => handleInvestmentChange(index, 'cost', Number(e.target.value))} className="text-right" disabled={hasSubItems} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => addSubItem(index)} className="mr-2">Sottovoce</Button>
                        <Button variant="ghost" size="icon" onClick={() => removeInvestmentRow(investment.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && hasSubItems && investment.subItems.map((subItem, subIndex) => (
                      <TableRow key={subItem.id} className="bg-muted/50">
                        <TableCell className="pl-16">
                          <Input value={subItem.name} onChange={e => handleSubItemChange(index, subIndex, 'name', e.target.value)} placeholder="Dettaglio" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={subItem.cost} onChange={e => handleSubItemChange(index, subIndex, 'cost', Number(e.target.value))} className="text-right" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => removeSubItem(index, subIndex)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
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
