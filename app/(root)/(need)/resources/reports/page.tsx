import Link from "next/link";

const reports = [
  {
    id: 1,
    title: "Annual Gram Panchayat Performance Report 2022",
    description:
      "A comprehensive analysis of Gram Panchayat performance across various parameters for the year 2022.",
    keyFindings: [
      "85% of Gram Panchayats showed improvement in digital record-keeping",
      "Average fund utilization rate increased to 78% from 65% in the previous year",
      "Women's participation in Gram Sabha meetings increased by 12%",
      "30% increase in the number of Gram Panchayats achieving Open Defecation Free (ODF) status",
    ],
  },
  {
    id: 2,
    title: "Rural Infrastructure Development Index 2023",
    description:
      "An index measuring the progress of rural infrastructure development across different states and regions.",
    keyFindings: [
      "Overall 15% improvement in rural road connectivity compared to 2022",
      "Access to clean drinking water reached 85% of rural households",
      "Solar power adoption in rural areas increased by 25%",
      "95% of villages now have access to high-speed internet connectivity",
    ],
  },
  {
    id: 3,
    title: "Gram Panchayat Audit Report FY 2021-22",
    description:
      "Financial audit report of Gram Panchayats for the fiscal year 2021-22.",
    keyFindings: [
      "92% of Gram Panchayats maintained proper financial records",
      "Misuse of funds reported in 3% of audited Panchayats, down from 5% in the previous year",
      "Average own revenue generation by Gram Panchayats increased by 8%",
      "Timely submission of utilization certificates improved by 20%",
    ],
  },
];

export default function Reports() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports</h1>

      {reports.map((report) => (
        <section
          key={report.id}
          className="mb-12 bg-white shadow-md rounded-lg p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {report.title}
          </h2>
          <p className="text-gray-600 mb-4">{report.description}</p>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Key Findings:
          </h3>
          <ul className="list-disc pl-5 space-y-2">
            {report.keyFindings.map((finding, index) => (
              <li key={index} className="text-gray-600">
                {finding}
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
