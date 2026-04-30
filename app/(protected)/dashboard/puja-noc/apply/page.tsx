import PujaNocForm from "@/components/form/PujaNocForm";
import { currentUser } from "@/lib/auth";
import { FileText } from "lucide-react";

const PujaNocApplyPage = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-4 px-4 sm:px-4 lg:px-4">
      <div className="mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center bg-orange-100 px-6 py-3 rounded-2xl mb-6 text-orange-600">
            <FileText className="h-8 w-8 mr-3" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
              Puja NOC Application
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Apply for No Objection Certificate (NOC) for Puja or Festival events
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-orange-100 transition-all hover:shadow-xl">
          <PujaNocForm userId={user.id!} />
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need assistance? Contact our support team</p>
          <p className="mt-2">
            ⓘ All information submitted is processed according to government guidelines
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PujaNocApplyPage;
