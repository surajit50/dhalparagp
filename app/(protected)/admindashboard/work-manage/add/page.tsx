import AddActionPlanForm from "@/components/form/add-action-plan-form";

export const metadata = {
  title: "Add Action Plan",
  description: "Create a new approved action plan",
};

export default function AddActionPlanPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <AddActionPlanForm />
    </div>
  );
}
