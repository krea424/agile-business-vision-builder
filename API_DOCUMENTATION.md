# Financial Planning Application - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Core Data Types](#core-data-types)
3. [Hooks API](#hooks-api)
4. [Utility Functions](#utility-functions)
5. [Financial Calculators](#financial-calculators)
6. [Export Functions](#export-functions)
7. [UI Components](#ui-components)
8. [Page Components](#page-components)
9. [Financial Plan Components](#financial-plan-components)
10. [Usage Examples](#usage-examples)

## Overview

This is a comprehensive React TypeScript application for financial planning and analysis. The application provides tools for creating financial projections, sensitivity analysis, and generating reports in multiple formats.

### Key Features
- Financial plan creation and management
- Real-time calculations and projections
- Sensitivity analysis
- Export to Excel and PowerPoint
- Interactive dashboards and charts
- Comprehensive reporting

## Core Data Types

### `FinancialPlanState`

The main state interface that holds all financial planning data.

```typescript
interface FinancialPlanState {
  general: GeneralAssumptions;
  recoverableClients: RecoverableClient[];
  newClients: NewClientAcquisition[];
  directlyAcquiredClients: DirectlyAcquiredClient[];
  personnelCosts: PersonnelCost[];
  fixedCosts: FixedCost[];
  variableCosts: VariableCost[];
  initialInvestments: InitialInvestment[];
}
```

### `GeneralAssumptions`

Core assumptions for the financial plan.

```typescript
interface GeneralAssumptions {
  companyName: string;
  timeHorizon: number;
  startDate: string;
  inflationRate: number;
  iresRate: number;
  irapRate: number;
  equityInjection: number;
  daysToCollectReceivables: number;
  daysToPayPayables: number;
  scenarioName: string;
  initialLoanAmount: number;
  loanInterestRate: number;
  loanDurationMonths: number;
  minimumCashBuffer: number;
  annualNewRevenueGrowthRate: number;
  customerChurnRate: number;
  averageVatRate: number;
  vatPaymentFrequency: 'Mensile' | 'Trimestrale';
  dividendDistributionPolicy: number;
  dividendDistributionStartYear: number;
  terminalValueMethod: 'Multiplo EBITDA' | 'Crescita Perpetua';
  exitMultiple: number;
  wacc: number;
  currency: 'EUR' | 'USD' | 'GBP';
}
```

### `RecoverableClient`

Represents clients that can be recovered from previous operations.

```typescript
interface RecoverableClient {
  id: string;
  name: string;
  previousAnnualRevenue: number;
  recoveryProbability: number;
  contractStartDateMonth: number;
  serviceType: 'ricorrente' | 'una_tantum';
  recoveryAmountPercentage: number;
  annualIncreasePercentage: number;
  contractDurationMonths?: number;
  renewalProbability?: number;
  activationRampUpMonths?: number;
  specificCollectionDays?: number;
}
```

### `YearlyData`

Represents calculated financial data for a specific year.

```typescript
interface YearlyData {
  year: number;
  revenues: number;
  recoverableClientRevenues: number;
  newClientRevenues: number;
  directlyAcquiredClientRevenues: number;
  personnelCosts: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  ebitda: number;
  amortization: number;
  ebit: number;
  interestExpense: number;
  ebt: number;
  taxes: number;
  netProfit: number;
  loanPrincipalRepayment: number;
  weightedAverageCollectionDays?: number;
  contributionMarginPercentage: number;
  ebitdaMargin: number;
  ebitMargin: number;
  netProfitMargin: number;
  newContracts: number;
  directlyAcquiredContracts: number;
}
```

## Hooks API

### `usePlanData()`

The main hook for managing financial plan data with localStorage persistence.

```typescript
const usePlanData = () => {
  // Returns
  return {
    planData: FinancialPlanState;
    setGeneral: (data: GeneralAssumptions) => void;
    setRecoverableClients: (data: RecoverableClient[]) => void;
    setNewClients: (data: NewClientAcquisition[]) => void;
    setDirectlyAcquiredClients: (data: DirectlyAcquiredClient[]) => void;
    setPersonnelCosts: (data: PersonnelCost[]) => void;
    setFixedCosts: (data: FixedCost[]) => void;
    setVariableCosts: (data: VariableCost[]) => void;
    setInitialInvestments: (data: InitialInvestment[]) => void;
  };
};
```

**Usage Example:**
```typescript
import { usePlanData } from '@/hooks/usePlanData';

function MyComponent() {
  const { planData, setGeneral } = usePlanData();
  
  const updateCompanyName = (name: string) => {
    setGeneral({
      ...planData.general,
      companyName: name
    });
  };
  
  return <div>{planData.general.companyName}</div>;
}
```

### `use-toast`

Hook for displaying toast notifications.

```typescript
const { toast } = useToast();

// Usage
toast({
  title: "Success",
  description: "Data saved successfully",
  variant: "default" | "destructive"
});
```

### `use-mobile`

Hook for detecting mobile viewport.

```typescript
const isMobile = useMobile();

// Returns boolean indicating if viewport is mobile size
```

## Utility Functions

### `cn()`

Utility function for merging CSS class names conditionally.

```typescript
import { cn } from "@/lib/utils";

// Usage
const className = cn("base-class", {
  "conditional-class": condition,
  "another-class": anotherCondition
});
```

### `formatCurrency()`

Formats numbers as currency values.

```typescript
import { formatCurrency } from "@/lib/utils";

const formatted = formatCurrency(1234.56); // Returns formatted currency string
```

## Financial Calculators

### `calculateFinancialSummary()`

Main function for calculating comprehensive financial projections.

```typescript
import { calculateFinancialSummary } from '@/components/FinancialPlan/financialCalculator';

function calculateFinancialSummary(plan: FinancialPlanState): YearlyData[]
```

**Parameters:**
- `plan`: Complete financial plan state

**Returns:**
- Array of `YearlyData` objects containing calculated financial metrics for each year

**Usage Example:**
```typescript
const { planData } = usePlanData();
const financialSummary = calculateFinancialSummary(planData);

// Access yearly data
financialSummary.forEach(yearData => {
  console.log(`Year ${yearData.year}: Revenue ${yearData.revenues}`);
});
```

### `calculateCashFlow()`

Calculates cash flow projections.

```typescript
import { calculateCashFlow } from '@/components/FinancialPlan/cashFlowCalculator';

function calculateCashFlow(
  plan: FinancialPlanState, 
  financialSummary: YearlyData[]
): CashFlowYearlyData[]
```

### `calculateDashboardData()`

Calculates comprehensive dashboard metrics and KPIs.

```typescript
import { calculateDashboardData } from '@/components/FinancialPlan/dashboardCalculator';

function calculateDashboardData(
  plan: FinancialPlanState
): DashboardData
```

### `calculateSensitivityAnalysis()`

Performs sensitivity analysis on key variables.

```typescript
import { calculateSensitivityAnalysis } from '@/components/FinancialPlan/SensitivityAnalysis/sensitivityCalculator';

function calculateSensitivityAnalysis(
  basePlan: FinancialPlanState,
  variableToAnalyze: string,
  minValue: number,
  maxValue: number,
  steps: number
): SensitivityResult[]
```

## Export Functions

### `exportToExcel()`

Exports financial plan data to Excel format.

```typescript
import { exportToExcel } from '@/lib/export';

function exportToExcel(
  planData: FinancialPlanState,
  financialSummary: YearlyData[],
  cashFlowSummary: CashFlowYearlyData[]
): void
```

**Usage Example:**
```typescript
const { planData } = usePlanData();
const financialSummary = calculateFinancialSummary(planData);
const cashFlowSummary = calculateCashFlow(planData, financialSummary);

exportToExcel(planData, financialSummary, cashFlowSummary);
// Downloads Excel file with scenario name
```

### `exportToPptx()`

Exports financial plan data to PowerPoint presentation.

```typescript
import { exportToPptx } from '@/lib/export';

function exportToPptx(
  planData: FinancialPlanState,
  dashboardData: DashboardData
): void
```

**Usage Example:**
```typescript
const { planData } = usePlanData();
const dashboardData = calculateDashboardData(planData);

exportToPptx(planData, dashboardData);
// Downloads PowerPoint presentation
```

## UI Components

### `Button`

Versatile button component with multiple variants and sizes.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}
```

**Usage Example:**
```typescript
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg" onClick={handleClick}>
  Save Plan
</Button>

<Button variant="outline" size="sm">
  Cancel
</Button>

<Button variant="destructive">
  Delete
</Button>
```

### `Card`

Container component for grouping related content.

```typescript
// Components: Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent

<Card>
  <CardHeader>
    <CardTitle>Financial Summary</CardTitle>
    <CardDescription>Key metrics and projections</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

### `Table`

Data table components for displaying structured data.

```typescript
// Components: Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption

<Table>
  <TableCaption>Financial projections by year</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Year</TableHead>
      <TableHead>Revenue</TableHead>
      <TableHead>EBITDA</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.year}>
        <TableCell>{row.year}</TableCell>
        <TableCell>{formatCurrency(row.revenue)}</TableCell>
        <TableCell>{formatCurrency(row.ebitda)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### `Form`

Form components with validation support.

```typescript
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const form = useForm<FormData>();

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="companyName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### `Dialog`

Modal dialog components.

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

### `Tabs`

Tab navigation components.

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="revenue">Revenue</TabsTrigger>
    <TabsTrigger value="costs">Costs</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    {/* General assumptions form */}
  </TabsContent>
  <TabsContent value="revenue">
    {/* Revenue configuration */}
  </TabsContent>
  <TabsContent value="costs">
    {/* Cost configuration */}
  </TabsContent>
</Tabs>
```

## Page Components

### `Index`

Landing page component.

```typescript
// Route: "/"
// Description: Main landing page with navigation to different sections
```

### `PlanPage`

Main financial planning interface.

```typescript
// Route: "/plan"
// Description: Comprehensive financial planning interface with tabs for different sections
// Features: General assumptions, revenue streams, cost management, investments
```

### `ScenarioReport`

Detailed financial report and analysis.

```typescript
// Route: "/report"
// Description: Comprehensive financial analysis and reporting interface
// Features: Income statement, cash flow, dashboard metrics, automated insights
```

### `SensitivityAnalysisPage`

Sensitivity analysis interface.

```typescript
// Route: "/sensitivity"
// Description: Tool for performing sensitivity analysis on key variables
// Features: Variable selection, range configuration, results visualization
```

## Financial Plan Components

### `GeneralAssumptions`

Form component for entering basic plan assumptions.

```typescript
interface GeneralAssumptionsProps {
  data: GeneralAssumptions;
  onChange: (data: GeneralAssumptions) => void;
}

<GeneralAssumptions data={planData.general} onChange={setGeneral} />
```

### `RecoverableClients`

Component for managing recoverable client data.

```typescript
interface RecoverableClientsProps {
  data: RecoverableClient[];
  onChange: (data: RecoverableClient[]) => void;
}

<RecoverableClients data={planData.recoverableClients} onChange={setRecoverableClients} />
```

### `PersonnelCosts`

Component for managing personnel cost projections.

```typescript
interface PersonnelCostsProps {
  data: PersonnelCost[];
  onChange: (data: PersonnelCost[]) => void;
}

<PersonnelCosts data={planData.personnelCosts} onChange={setPersonnelCosts} />
```

### `ExecutiveDashboard`

High-level dashboard component with key metrics.

```typescript
interface ExecutiveDashboardProps {
  planData: FinancialPlanState;
}

<ExecutiveDashboard planData={planData} />
```

### `IncomeStatement`

Income statement visualization component.

```typescript
interface IncomeStatementProps {
  data: YearlyData[];
}

<IncomeStatement data={financialSummary} />
```

### `CashFlowStatement`

Cash flow visualization component.

```typescript
interface CashFlowStatementProps {
  data: CashFlowYearlyData[];
}

<CashFlowStatement data={cashFlowSummary} />
```

## Usage Examples

### Complete Financial Plan Setup

```typescript
import { usePlanData } from '@/hooks/usePlanData';
import { calculateFinancialSummary } from '@/components/FinancialPlan/financialCalculator';
import { exportToExcel } from '@/lib/export';

function FinancialPlanningApp() {
  const { planData, setGeneral } = usePlanData();
  
  // Update general assumptions
  const updateGeneralAssumptions = (updates: Partial<GeneralAssumptions>) => {
    setGeneral({
      ...planData.general,
      ...updates
    });
  };
  
  // Calculate projections
  const financialSummary = calculateFinancialSummary(planData);
  
  // Export to Excel
  const handleExport = () => {
    const cashFlowSummary = calculateCashFlow(planData, financialSummary);
    exportToExcel(planData, financialSummary, cashFlowSummary);
  };
  
  return (
    <div>
      <GeneralAssumptions 
        data={planData.general} 
        onChange={setGeneral} 
      />
      <Button onClick={handleExport}>
        Export to Excel
      </Button>
    </div>
  );
}
```

### Sensitivity Analysis

```typescript
import { calculateSensitivityAnalysis } from '@/components/FinancialPlan/SensitivityAnalysis/sensitivityCalculator';

function SensitivityAnalysisExample() {
  const { planData } = usePlanData();
  
  const runSensitivityAnalysis = () => {
    const results = calculateSensitivityAnalysis(
      planData,
      'inflationRate',  // Variable to analyze
      0.01,            // Min value (1%)
      0.05,            // Max value (5%)
      10               // Number of steps
    );
    
    results.forEach(result => {
      console.log(`Inflation Rate: ${result.variableValue}, NPV: ${result.npv}`);
    });
  };
  
  return (
    <Button onClick={runSensitivityAnalysis}>
      Run Sensitivity Analysis
    </Button>
  );
}
```

### Dashboard with Charts

```typescript
import { calculateDashboardData } from '@/components/FinancialPlan/dashboardCalculator';
import { Chart } from '@/components/ui/chart';

function DashboardExample() {
  const { planData } = usePlanData();
  const dashboardData = calculateDashboardData(planData);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Peak Funding: {formatCurrency(dashboardData.kpis?.peakFundingRequirement)}</div>
            <div>Enterprise Value: {formatCurrency(dashboardData.kpis?.enterpriseValue)}</div>
            <div>IRR: {dashboardData.kpis?.irr ? (dashboardData.kpis.irr * 100).toFixed(1) : 'N/A'}%</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={dashboardData.monthlyChartData} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Form Validation Example

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  timeHorizon: z.number().min(1).max(10),
  inflationRate: z.number().min(0).max(0.2)
});

function ValidatedForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: '',
      timeHorizon: 5,
      inflationRate: 0.02
    }
  });
  
  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log('Form data:', data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

## Error Handling

Most components include built-in error handling:

```typescript
// In usePlanData hook
try {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    return parsedData;
  }
} catch (error) {
  console.error("Error reading financial plan data from localStorage", error);
  return initialPlanState;
}
```

## Performance Considerations

- All state updates use `useCallback` for performance optimization
- Financial calculations are memoized where appropriate
- Large datasets are handled efficiently in the calculation functions
- Charts and tables implement virtualization for large datasets

## Browser Compatibility

- Modern browsers supporting ES2015+
- React 18+ features
- localStorage support required for data persistence
- Canvas support required for charts

## Security Considerations

- All user inputs are validated using Zod schemas
- Financial calculations include boundary checks
- Export functions sanitize file names
- No sensitive data is stored in localStorage beyond user session