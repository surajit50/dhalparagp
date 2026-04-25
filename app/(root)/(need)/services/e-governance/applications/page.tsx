import { E_GOVERNANCE_SERVICES } from "@/constants";

export default function OnlineApplications() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Online Applications</h2>
      <p className="text-gray-600 mb-6">
        Apply for various certificates and documents online through our
        e-governance portal. Save time and effort by submitting your
        applications electronically.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {E_GOVERNANCE_SERVICES.onlineApplications.map((service, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
            <p className="text-gray-600">{service.description}</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
