import Link from "next/link";

const faqs = [
  {
    id: 1,
    question: "What are the main functions of a Gram Panchayat?",
    answer:
      "Gram Panchayats are responsible for various functions at the village level, including:\n\n" +
      "1. Implementation of development schemes\n" +
      "2. Maintenance of community assets\n" +
      "3. Construction and maintenance of water resources\n" +
      "4. Promotion of education and public health\n" +
      "5. Maintenance of public streets, drains, and tanks\n" +
      "6. Registration of births and deaths\n" +
      "7. Implementation of poverty alleviation programs",
  },
  {
    id: 2,
    question: "How are Gram Panchayat members elected?",
    answer:
      "Gram Panchayat members are elected through a democratic process:\n\n" +
      "1. Elections are conducted by the State Election Commission\n" +
      "2. Adult residents of the village can vote and contest elections\n" +
      "3. Seats are reserved for Scheduled Castes, Scheduled Tribes, and women as per state laws\n" +
      "4. The election is typically held every 5 years\n" +
      "5. The Sarpanch (head of the Gram Panchayat) is either directly elected by villagers or chosen by elected members",
  },
  {
    id: 3,
    question: "What is the role of Gram Sabha in local governance?",
    answer:
      "Gram Sabha plays a crucial role in local governance:\n\n" +
      "1. It consists of all adult members of the village\n" +
      "2. Meets at least 2-4 times a year (varies by state)\n" +
      "3. Approves the annual budget and development plans of the Gram Panchayat\n" +
      "4. Reviews the performance of the Gram Panchayat\n" +
      "5. Selects beneficiaries for various welfare schemes\n" +
      "6. Mobilizes voluntary labor and contributions for community welfare\n" +
      "7. Promotes social audit of Panchayat functioning",
  },
];

export default function FAQs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Frequently Asked Questions
      </h1>

      {faqs.map((faq) => (
        <section
          key={faq.id}
          className="mb-12 bg-white shadow-md rounded-lg p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {faq.question}
          </h2>
          <div className="text-gray-600 whitespace-pre-line">{faq.answer}</div>
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
