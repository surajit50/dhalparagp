import WarishForm from "@/components/form/WarishForm";

const Page = async () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 px-4 sm:px-4 lg:px-4">
      <div className=" mx-auto">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center bg-primary/10 px-6 py-3 rounded-2xl mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary mr-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Warish Application Form
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Complete the form below to submit your inheritance claim application
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-2 border border-gray-100 transition-all hover:shadow-xl">
          <WarishForm />
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need assistance? Contact our support team at support</p>
          <p className="mt-2">
            ⓘ All information submitted is protected under the Data Protection
            Act
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Page;
