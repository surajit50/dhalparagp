import LandConversionApplicationForm from "@/components/form/LandConversionApplicationForm";
import { currentUser } from "@/lib/auth";
import { Trees } from "lucide-react";

const LandConversionApplyPage = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const isAdminOrSuperAdmin = ["admin", "superadmin"].includes(user.role as string);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-4 px-4 sm:px-4 lg:px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center bg-orange-100 px-6 py-3 rounded-2xl mb-6 text-orange-600">
            <Trees className="h-8 w-8 mr-3" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-600">
              Land Conversion Application
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Apply for No Objection Certificate (NOC) for Land Conversion
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 border border-orange-100 transition-all hover:shadow-xl">
          <LandConversionApplicationForm isAdminOrSuperAdmin={isAdminOrSuperAdmin} />
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need assistance? Contact our support team</p>
          <p className="mt-2">
            ⓘ All information submitted is processed according to government
            guidelines
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandConversionApplyPage;
