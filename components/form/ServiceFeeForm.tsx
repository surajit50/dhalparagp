"use client";

import React, { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { toast } from "@/components/ui/use-toast";
import { updateFee } from "@/action/bookings";

interface ServiceFeeFormProps {
  serviceType: {
    id: string;
    name: string;
  };
  currentFee?: {
    id: string;
    amount: number;
    serviceType: string;
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {pending ? "Updating..." : "Update Fee"}
    </button>
  );
}

const ServiceFeeForm = ({ serviceType, currentFee }: ServiceFeeFormProps) => {
  const [amount, setAmount] = useState(currentFee?.amount || 0);
  const [state, formAction] = useFormState(updateFee, null);

  React.useEffect(() => {
    if (state) {
      if (state.success) {
        toast({
          title: "Success",
          description: state.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="p-4 border rounded-lg bg-white shadow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium text-gray-900">{serviceType.name}</h3>
          {currentFee && (
            <p className="text-sm text-gray-500">
              Current fee: Rs. {currentFee.amount}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input type="hidden" name="serviceType" value={serviceType.id} />
          {currentFee && (
            <input type="hidden" name="feeId" value={currentFee.id} />
          )}
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border rounded px-3 py-2 w-32"
            min="0"
            step="0.01"
            required
          />
          <SubmitButton />
        </div>
      </div>
    </form>
  );
};

export default ServiceFeeForm;
