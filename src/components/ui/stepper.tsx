import { Check } from "lucide-react";
import { motion } from "framer-motion";
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
            disabled={!onStepClick}
            className={cn("flex flex-col items-center gap-2 shrink-0", onStepClick && "cursor-pointer")}
          >
            <motion.div
              animate={{ scale: i === currentStep ? 1.12 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-gradient-orange text-white ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </motion.div>
            <span
              className={cn(
                "text-[11px] sm:text-xs text-center max-w-[5.5rem] hidden sm:block",
                i === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </button>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-1.5 sm:mx-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: i < currentStep ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
