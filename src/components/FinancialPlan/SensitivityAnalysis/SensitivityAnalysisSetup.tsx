
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Loader2 } from 'lucide-react';

export const SENSITIVITY_VARIABLES = [
  { id: 'exitMultiple', label: 'Multiplo di Uscita', path: 'general.exitMultiple' },
  { id: 'inflationRate', label: 'Tasso di Inflazione', path: 'general.inflationRate' },
  { id: 'customerChurnRate', label: 'Tasso di Abbandono Clienti', path: 'general.customerChurnRate' },
  { id: 'conversionRate', label: 'Tasso Conversione (Nuovi Clienti)', path: 'newClients[0].conversionRate' },
];

export type VariableConfig = {
    id: string;
    path: string;
    variation: number;
};

type Props = {
    variables: VariableConfig[];
    setVariables: (vars: VariableConfig[]) => void;
    onRun: () => void;
    isRunning: boolean;
};

export const SensitivityAnalysisSetup = ({ variables, setVariables, onRun, isRunning }: Props) => {
    
    const selectedVariable = variables[0];

    const handleVariableChange = (newId: string) => {
        const selectedVar = SENSITIVITY_VARIABLES.find(v => v.id === newId);
        if (selectedVar) {
            setVariables([{ ...selectedVariable, id: selectedVar.id, path: selectedVar.path }]);
        }
    };

    const handleVariationChange = (value: string) => {
        setVariables([{ ...selectedVariable, variation: Number(value) }]);
    };
    
    if (!selectedVariable) {
        const firstVar = SENSITIVITY_VARIABLES[0];
        if(variables.length === 0) {
            setVariables([{ id: firstVar.id, path: firstVar.path, variation: 10 }]);
        }
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurazione Analisi</CardTitle>
                <CardDescription>Seleziona una variabile chiave e la sua % di variazione.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="variable-select">Variabile Chiave</Label>
                    <Select value={selectedVariable.id} onValueChange={handleVariableChange}>
                        <SelectTrigger id="variable-select">
                            <SelectValue placeholder="Seleziona..." />
                        </SelectTrigger>
                        <SelectContent>
                            {SENSITIVITY_VARIABLES.map(opt => (
                                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="variation-input">Variazione (%)</Label>
                    <Input 
                        id="variation-input" 
                        type="number" 
                        value={selectedVariable.variation}
                        onChange={(e) => handleVariationChange(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={onRun} disabled={isRunning}>
                    {isRunning ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            In Esecuzione...
                        </>
                    ) : (
                        <>
                           <Zap className="mr-2 h-4 w-4" /> Esegui Analisi
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};
