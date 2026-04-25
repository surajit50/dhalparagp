import ServiceManagement from "@/components/service-management";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="py-8">
        <ServiceManagement />
      </div>
    </div>
  );
}
