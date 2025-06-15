
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export const Stepper = ({ steps, currentStep }: StepperProps) => {
  return (
    <div className="w-full px-4 sm:px-0">
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={step} className="z-10 flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300",
                index < currentStep && "bg-primary text-primary-foreground",
                index === currentStep && "border-2 border-primary bg-primary/20 text-primary font-bold",
                index > currentStep && "border bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="h-6 w-6" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <p className={cn(
                "mt-2 text-sm text-center font-medium",
                "w-24",
                 index === currentStep ? "text-primary" : "text-muted-foreground"
            )}>
              {step}
            </p>
          </div>
        ))}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transform -translate-y-1/2 transition-all duration-500"
          style={{ width: `${currentStep > 0 ? (100 / (steps.length - 1)) * currentStep : 0}%` }}
        />
      </div>
    </div>
  );
};

