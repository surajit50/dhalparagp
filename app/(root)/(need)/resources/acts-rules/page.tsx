import Link from "next/link";

const actsRules = [
  {
    id: 1,
    title: "Panchayati Raj Act, 1992",
    description:
      "Fundamental legislation that provides constitutional status to Panchayati Raj Institutions.",
    keyPoints: [
      "Establishes a three-tier system of Panchayati Raj for all states with population of over 2 million",
      "Mandates regular elections to Panchayats every 5 years",
      "Provides reservation of seats for Scheduled Castes, Scheduled Tribes, and women",
      "Empowers state legislatures to endow Panchayats with powers and authority as necessary",
    ],
  },
  {
    id: 2,
    title: "Gram Panchayat Administration Rules, 2018",
    description:
      "Comprehensive rules governing the administration and functioning of Gram Panchayats.",
    keyPoints: [
      "Defines the roles and responsibilities of Gram Panchayat officials",
      "Outlines procedures for conducting Gram Sabha meetings",
      "Establishes guidelines for financial management and record-keeping",
      "Sets rules for implementation of development schemes at village level",
    ],
  },
  {
    id: 3,
    title: "Rural Development Schemes Guidelines",
    description:
      "Guidelines for various schemes aimed at rural development implemented through Gram Panchayats.",
    keyPoints: [
      "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) implementation guidelines",
      "Pradhan Mantri Awaas Yojana - Gramin (PMAY-G) for rural housing",
      "National Rural Livelihood Mission (NRLM) for poverty alleviation",
      "Swachh Bharat Mission - Gramin for sanitation and waste management",
    ],
  },
];

export default function ActsRules() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Acts & Rules</h1>

      {actsRules.map((item) => (
        <section
          key={item.id}
          className="mb-12 bg-white shadow-md rounded-lg p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {item.title}
          </h2>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Key Points:
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {item.keyPoints.map((point, index) => (
              <li key={index} className="text-gray-600">
                {point}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="mt-8">
        <Link
          href="/resources"
          className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
        >
          ← Back to Resources
        </Link>
      </div>
    </div>
  );
}
