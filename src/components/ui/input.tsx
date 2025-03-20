
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  numbersOnly?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, numbersOnly, onChange, onKeyDown, ...props }, ref) => {
    // Handle numeric input restriction
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, ctrl+A, ctrl+C, ctrl+V, ctrl+X, home, end, left, right
      const controlKeys = [
        'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'
      ];
      
      if (
        numbersOnly &&
        !controlKeys.includes(e.key) &&
        !/[0-9]/.test(e.key) &&
        !e.ctrlKey && 
        !e.metaKey
      ) {
        e.preventDefault();
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    // Combine our custom handler with any existing handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (numbersOnly) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
