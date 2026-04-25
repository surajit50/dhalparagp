import WarishVerificationForm from "./WarishVerificationForm";
import { WarishApplicationDetails } from "./WarishApplicationDetails";

export default function WarishVerificationPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Verify Warish Application
      </h1>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <WarishVerificationForm />
      </div>
      <WarishApplicationDetails />
    </div>
  );
}
