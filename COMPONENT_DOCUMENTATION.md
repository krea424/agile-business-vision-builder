# UI Components Documentation

## Table of Contents

1. [Layout Components](#layout-components)
2. [Form Components](#form-components)
3. [Navigation Components](#navigation-components)
4. [Data Display Components](#data-display-components)
5. [Feedback Components](#feedback-components)
6. [Overlay Components](#overlay-components)
7. [Chart Components](#chart-components)

## Layout Components

### `Card`

A flexible container component for grouping related content.

```typescript
// Sub-components
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";

// Basic usage
<Card className="w-full">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Financial metrics card example
<Card>
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Revenue Projections</CardTitle>
    <CardDescription>5-year financial forecast</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Year 1:</span>
        <span>{formatCurrency(revenue1)}</span>
      </div>
      <div className="flex justify-between">
        <span>Year 2:</span>
        <span>{formatCurrency(revenue2)}</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### `Resizable`

Resizable panel components for flexible layouts.

```typescript
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

<ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
  <ResizablePanel defaultSize={30} minSize={20}>
    <div className="p-4">
      <h3>Sidebar Content</h3>
    </div>
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={70}>
    <div className="p-4">
      <h3>Main Content</h3>
    </div>
  </ResizablePanel>
</ResizablePanelGroup>
```

### `Sidebar`

Complex sidebar component with navigation and collapsible sections.

```typescript
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

<Sidebar>
  <SidebarHeader>
    <h2>Financial Planning</h2>
  </SidebarHeader>
  <SidebarContent>
    <SidebarMenu>
      <SidebarMenuItem>
        <a href="/plan">Plan Configuration</a>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <a href="/report">Financial Reports</a>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarContent>
</Sidebar>
```

## Form Components

### `Button`

Versatile button component with multiple variants.

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

// Basic buttons
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="link">Link Style</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><PlusIcon /></Button>

// With loading state
<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : "Save Plan"}
</Button>

// As child (renders as different element)
<Button asChild>
  <a href="/external">External Link</a>
</Button>
```

### `Input`

Text input component with various configurations.

```typescript
import { Input } from "@/components/ui/input";

// Basic input
<Input 
  type="text" 
  placeholder="Enter company name"
  value={companyName}
  onChange={(e) => setCompanyName(e.target.value)}
/>

// Number input with validation
<Input 
  type="number" 
  placeholder="0.00"
  min="0"
  step="0.01"
  value={amount}
  onChange={(e) => setAmount(parseFloat(e.target.value))}
/>

// With form integration
<FormField
  control={form.control}
  name="inflationRate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Inflation Rate (%)</FormLabel>
      <FormControl>
        <Input 
          type="number" 
          placeholder="2.5"
          step="0.1"
          {...field}
          onChange={(e) => field.onChange(parseFloat(e.target.value))}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### `Textarea`

Multi-line text input component.

```typescript
import { Textarea } from "@/components/ui/textarea";

<Textarea 
  placeholder="Enter scenario description..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  className="resize-none"
/>
```

### `Select`

Dropdown selection component.

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select value={currency} onValueChange={setCurrency}>
  <SelectTrigger className="w-32">
    <SelectValue placeholder="Select currency" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="EUR">EUR (€)</SelectItem>
    <SelectItem value="USD">USD ($)</SelectItem>
    <SelectItem value="GBP">GBP (£)</SelectItem>
  </SelectContent>
</Select>

// With form integration
<FormField
  control={form.control}
  name="vatPaymentFrequency"
  render={({ field }) => (
    <FormItem>
      <FormLabel>VAT Payment Frequency</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="Mensile">Monthly</SelectItem>
          <SelectItem value="Trimestrale">Quarterly</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### `Checkbox`

Checkbox input component.

```typescript
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center space-x-2">
  <Checkbox 
    id="indexedToInflation" 
    checked={isIndexedToInflation}
    onCheckedChange={setIsIndexedToInflation}
  />
  <label htmlFor="indexedToInflation">Index to inflation</label>
</div>
```

### `Switch`

Toggle switch component.

```typescript
import { Switch } from "@/components/ui/switch";

<div className="flex items-center space-x-2">
  <Switch 
    id="autoSave"
    checked={autoSave}
    onCheckedChange={setAutoSave}
  />
  <label htmlFor="autoSave">Auto-save changes</label>
</div>
```

### `RadioGroup`

Radio button group component.

```typescript
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

<RadioGroup value={contractType} onValueChange={setContractType}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="Dipendente" id="employee" />
    <label htmlFor="employee">Employee</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="Freelance/P.IVA" id="freelance" />
    <label htmlFor="freelance">Freelance/VAT</label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="Compenso Amministratore" id="admin" />
    <label htmlFor="admin">Administrator Fee</label>
  </div>
</RadioGroup>
```

### `Slider`

Range slider component for numerical inputs.

```typescript
import { Slider } from "@/components/ui/slider";

<div className="space-y-2">
  <label>Risk Level: {riskLevel}%</label>
  <Slider
    value={[riskLevel]}
    onValueChange={([value]) => setRiskLevel(value)}
    max={100}
    min={0}
    step={1}
    className="w-full"
  />
</div>
```

## Navigation Components

### `Tabs`

Tab navigation for organizing content sections.

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="general" className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="revenue">Revenue</TabsTrigger>
    <TabsTrigger value="costs">Costs</TabsTrigger>
    <TabsTrigger value="investments">Investments</TabsTrigger>
  </TabsList>
  
  <TabsContent value="general" className="space-y-4">
    <GeneralAssumptions data={planData.general} onChange={setGeneral} />
  </TabsContent>
  
  <TabsContent value="revenue" className="space-y-4">
    <RecoverableClients data={planData.recoverableClients} onChange={setRecoverableClients} />
    <NewClients data={planData.newClients} onChange={setNewClients} />
  </TabsContent>
  
  <TabsContent value="costs" className="space-y-4">
    <PersonnelCosts data={planData.personnelCosts} onChange={setPersonnelCosts} />
    <FixedCosts data={planData.fixedCosts} onChange={setFixedCosts} />
  </TabsContent>
  
  <TabsContent value="investments" className="space-y-4">
    <Investments data={planData.initialInvestments} onChange={setInitialInvestments} />
  </TabsContent>
</Tabs>
```

### `NavigationMenu`

Advanced navigation menu component.

```typescript
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

<NavigationMenu>
  <NavigationMenuItem>
    <NavigationMenuTrigger>Planning Tools</NavigationMenuTrigger>
    <NavigationMenuContent>
      <ul className="grid w-80 gap-3 p-4">
        <li>
          <a href="/plan">Financial Plan</a>
          <p>Create and manage financial projections</p>
        </li>
        <li>
          <a href="/sensitivity">Sensitivity Analysis</a>
          <p>Analyze impact of variable changes</p>
        </li>
      </ul>
    </NavigationMenuContent>
  </NavigationMenuItem>
</NavigationMenu>
```

### `Breadcrumb`

Breadcrumb navigation component.

```typescript
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/plan">Financial Plan</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      General Assumptions
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### `Pagination`

Pagination component for large datasets.

```typescript
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

## Data Display Components

### `Table`

Comprehensive table component for displaying tabular data.

```typescript
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableCaption>Financial projections for the next 5 years</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-24">Year</TableHead>
      <TableHead className="text-right">Revenue</TableHead>
      <TableHead className="text-right">EBITDA</TableHead>
      <TableHead className="text-right">Net Profit</TableHead>
      <TableHead className="text-right">Margin %</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {financialData.map((row) => (
      <TableRow key={row.year}>
        <TableCell className="font-medium">{row.year}</TableCell>
        <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
        <TableCell className="text-right">{formatCurrency(row.ebitda)}</TableCell>
        <TableCell className="text-right">{formatCurrency(row.netProfit)}</TableCell>
        <TableCell className="text-right">{row.margin.toFixed(1)}%</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### `Badge`

Small status indicators and labels.

```typescript
import { Badge } from "@/components/ui/badge";

// Different variants
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Draft</Badge>

// In context
<div className="flex items-center gap-2">
  <span>Scenario Status:</span>
  <Badge variant={isComplete ? "default" : "secondary"}>
    {isComplete ? "Complete" : "In Progress"}
  </Badge>
</div>
```

### `Avatar`

User avatar component with fallback support.

```typescript
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
</Avatar>
```

### `Progress`

Progress indicator component.

```typescript
import { Progress } from "@/components/ui/progress";

<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Plan Completion</span>
    <span>{completionPercentage}%</span>
  </div>
  <Progress value={completionPercentage} className="w-full" />
</div>
```

### `Separator`

Visual separator component.

```typescript
import { Separator } from "@/components/ui/separator";

<div>
  <h3>Revenue Streams</h3>
  <Separator className="my-4" />
  <div>Content below separator</div>
</div>
```

## Feedback Components

### `Alert`

Alert messages for important information.

```typescript
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

// Success alert
<Alert variant="default">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success!</AlertTitle>
  <AlertDescription>
    Your financial plan has been saved successfully.
  </AlertDescription>
</Alert>

// Warning alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    Cash flow projections show potential shortfall in Year 3.
  </AlertDescription>
</Alert>
```

### `Toast`

Temporary notification messages.

```typescript
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();
  
  const saveData = async () => {
    try {
      await savePlan(planData);
      toast({
        title: "Plan Saved",
        description: "Your financial plan has been saved successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return <Button onClick={saveData}>Save Plan</Button>;
}
```

### `Skeleton`

Loading placeholder component.

```typescript
import { Skeleton } from "@/components/ui/skeleton";

// Loading state for financial data
<div className="space-y-2">
  <Skeleton className="h-4 w-32" />
  <Skeleton className="h-8 w-full" />
  <Skeleton className="h-4 w-24" />
</div>

// Table loading state
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Year</TableHead>
      <TableHead>Revenue</TableHead>
      <TableHead>EBITDA</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Overlay Components

### `Dialog`

Modal dialog component for focused interactions.

```typescript
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Export Report</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Export Financial Report</DialogTitle>
      <DialogDescription>
        Choose the format for your financial report export.
      </DialogDescription>
    </DialogHeader>
    <div className="grid grid-cols-2 gap-4">
      <Button onClick={() => exportToExcel(planData, financialSummary, cashFlowSummary)}>
        Export to Excel
      </Button>
      <Button onClick={() => exportToPptx(planData, dashboardData)}>
        Export to PowerPoint
      </Button>
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### `Sheet`

Side panel overlay component.

```typescript
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Settings</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Plan Settings</SheetTitle>
      <SheetDescription>
        Configure your financial plan preferences.
      </SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="currency" className="text-right">Currency</label>
        <Select defaultValue="EUR">
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </SheetContent>
</Sheet>
```

### `Popover`

Lightweight overlay for additional content.

```typescript
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Help</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">Inflation Rate</h4>
        <p className="text-sm text-muted-foreground">
          The expected annual inflation rate used for cost projections.
          Typically ranges from 1-5% depending on economic conditions.
        </p>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

### `Tooltip`

Hover information component.

```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline" size="icon">
        <InfoIcon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Additional information about this field</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### `HoverCard`

Rich hover content component.

```typescript
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

<HoverCard>
  <HoverCardTrigger asChild>
    <Button variant="link">@financialplanner</Button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex justify-between space-x-4">
      <Avatar>
        <AvatarImage src="/avatars/vercel.png" />
        <AvatarFallback>FP</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">Financial Planner Pro</h4>
        <p className="text-sm">
          Advanced financial planning and analysis tools.
        </p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

## Chart Components

### `Chart`

Recharts-based charting component for financial data visualization.

```typescript
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  ebitda: {
    label: "EBITDA",
    color: "hsl(var(--chart-2))",
  },
};

<ChartContainer config={chartConfig} className="min-h-[200px]">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={financialData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="var(--color-revenue)" 
        strokeWidth={2} 
      />
      <Line 
        type="monotone" 
        dataKey="ebitda" 
        stroke="var(--color-ebitda)" 
        strokeWidth={2} 
      />
    </LineChart>
  </ResponsiveContainer>
</ChartContainer>
```

### Bar Chart Example

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

<ChartContainer config={chartConfig} className="min-h-[300px]">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={monthlyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="revenue" fill="var(--color-revenue)" />
      <Bar dataKey="costs" fill="var(--color-costs)" />
    </BarChart>
  </ResponsiveContainer>
</ChartContainer>
```

## Advanced Component Patterns

### Compound Components

Many UI components follow the compound component pattern:

```typescript
// Card compound component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>

// Table compound component
<Table>
  <TableCaption>Caption</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Header</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Cell</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Form Integration Patterns

Components are designed to work seamlessly with React Hook Form:

```typescript
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormDescription>Helper text</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Accessibility Features

All components include built-in accessibility features:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

### Responsive Design

Components are built with responsive design in mind:

```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>

// Responsive table
<div className="overflow-x-auto">
  <Table>
    {/* Table content */}
  </Table>
</div>
```