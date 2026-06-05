import { ProdhanForm } from "@/components/form/add-prodhan-details";
import { db } from "@/lib/db";

export default async function GPProfileSettingsPage() {
  const gpProfile = await db.gPProfile.findFirst();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">GP Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your Gram Panchayat details and customize the Prodhan's welcome message shown on the public landing page.
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <ProdhanForm initialData={gpProfile} />
      </div>
    </div>
  );
}
