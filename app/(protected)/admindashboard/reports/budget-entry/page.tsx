import { BudgetEntryClient } from "./budget-entry-client";

export const metadata = {
  title: "Budget Entry | Admin Dashboard",
  description: "Budget Entry Section (Current and Next Year)",
};

export default function BudgetEntryPage() {
  return (
    <div className="p-6">
      <BudgetEntryClient />
    </div>
  );
}
