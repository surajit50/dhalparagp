"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface IndeterminateCheckboxProps 
  extends React.ComponentProps<typeof Checkbox> {
  indeterminate?: boolean;
}

const IndeterminateCheckbox = React.forwardRef<
  HTMLButtonElement,
  IndeterminateCheckboxProps
>(({ indeterminate, ...props }, ref) => {
  const internalRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (internalRef.current) {
      // Type assertion for indeterminate property
      (internalRef.current as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = 
        indeterminate ?? false;
    }
  }, [indeterminate]);

  return <Checkbox ref={internalRef} {...props} />;
});

IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

export { IndeterminateCheckbox };
