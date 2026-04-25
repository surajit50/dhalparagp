import ApplicationForm from "@/components/samabathy/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <div className="p-6 h-full flex items-center justify-center bg-muted/20">
      <div className="w-full max-w-2xl">
        <ApplicationForm />
      </div>
    </div>
  );
}