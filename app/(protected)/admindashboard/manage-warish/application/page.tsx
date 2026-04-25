import WarishForm from "@/components/form/WarishForm";

const Page = async () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 px-4 sm:px-4 lg:px-4">
      <div className="mx-auto">
        <div className="text-center space-y-2 mb-3">
          <div className="inline-flex items-center justify-center bg-primary/10 px-4 py-2 rounded-lg mb-1">
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Warish Application
            </h1>
          </div>
          <p className="text-base text-muted-foreground">
            Submit your inheritance claim application
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-2 border border-gray-100 transition-all hover:shadow-xl">
          <WarishForm />
        </div>
      </div>
    </div>
  );
};

export default Page;
