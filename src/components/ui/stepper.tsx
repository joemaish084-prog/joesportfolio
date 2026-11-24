import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <button
            type="button"
            onClick={() => onStepClick?.(i)}
            disabled={!onStepClick || i >= currentStep}
            aria-current={i === currentStep ? "step" : undefined}
            className="flex min-h-11 min-w-11 shrink-0 flex-col items-center justify-center gap-2"
          >
            <span aria-hidden
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={cn(
                "max-w-[5.5rem] text-center text-xs",
                i === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-0.5 sm:mx-2 bg-muted rounded-full overflow-hidden">
              {i < currentStep && <div className="h-full rounded-full bg-primary" />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
