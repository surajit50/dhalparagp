import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "Register on wbtenders.gov.in",
    description:
      "Create an account on the West Bengal e-Tender portal if you haven't already.",
  },
  {
    title: "Obtain Digital Signature Certificate (DSC)",
    description:
      "Procure a valid Class II or Class III Digital Signature Certificate (DSC) from a certified authority.",
  },
  {
    title: "Map Your DSC",
    description:
      "Log in to wbtenders.gov.in and map your DSC to your user account.",
  },
  {
    title: "Search for Tenders",
    description:
      "Use the search functionality to find relevant Gram Panchayat tenders.",
  },
  {
    title: "Download Tender Documents",
    description:
      "Access and download all relevant tender documents for the selected tender.",
  },
  {
    title: "Prepare Bid",
    description:
      "Carefully prepare your technical and financial bids as per the tender requirements.",
  },
  {
    title: "Submit Bid Online",
    description:
      "Upload your completed bid documents and submit them through the portal before the deadline.",
  },
];

const faqs = [
  {
    question: "What type of Digital Signature Certificate (DSC) do I need?",
    answer:
      "You need either a Class II or Class III DSC issued by a certified authority. Class III DSCs are recommended for higher security.",
  },
  {
    question: "Is there a fee for participating in e-Tenders?",
    answer:
      "Yes, there's usually a tender fee and Earnest Money Deposit (EMD). The exact amounts are specified in each tender document. These can be paid online through the portal.",
  },
  {
    question: "Can I submit physical copies of documents?",
    answer:
      "Generally, all submissions are done electronically through wbtenders.gov.in. However, some tenders may require physical submission of certain documents. Always check the specific tender requirements.",
  },
  {
    question: "How do I get technical support for the e-Tender process?",
    answer:
      "You can contact the 24x7 West Bengal e-Tender helpdesk at 1800 3070 2232 or email them at eproc-wb@nic.in for any technical issues.",
  },
];

export default function HowToApply() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        How to Apply for Tenders
      </h1>

      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Application Process on wbtenders.gov.in
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Follow these steps to apply for a Gram Panchayat tender in West
            Bengal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Important Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-3">
            <li className="text-gray-700 text-base">
              Ensure your Digital Signature Certificate (DSC) is valid and
              properly mapped to your account.
            </li>
            <li className="text-gray-700 text-base">
              Keep all required documents ready in digital format before
              starting the bid submission process.
            </li>
            <li className="text-gray-700 text-base">
              Pay close attention to deadlines. The system automatically closes
              bid submission at the specified time.
            </li>
            <li className="text-gray-700 text-base">
              Regularly check the portal for any corrigenda or addenda issued
              for the tender.
            </li>
            <li className="text-gray-700 text-base">
              Ensure you have a stable internet connection when uploading
              documents and submitting bids.
            </li>
            <li className="text-gray-700 text-base">
              {`After submission, always check your bid status in the "My Bids"
              section to confirm successful submission.`}
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-gray-800 hover:text-gray-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <p className="text-gray-700 mt-8 text-lg">
        For more detailed information, please visit the official{" "}
        <Link
          href="https://wbtenders.gov.in"
          className="text-blue-600 hover:underline font-semibold"
        >
          West Bengal e-Tender portal
        </Link>
        
      </p>
    </div>
  );
}
