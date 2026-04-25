import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const guidelines = [
  {
    title: "Eligibility Criteria",
    items: [
      "Bidders must be registered legal entities (e.g., companies, partnerships, proprietorships).",
      "Minimum years of experience as specified in the tender document.",
      "Financial stability and turnover requirements as per tender specifications.",
      "Compliance with all statutory requirements (e.g., GST registration, PAN).",
      "No history of blacklisting or legal disputes with government entities.",
    ],
  },
  {
    title: "Bid Submission",
    items: [
      "All bids must be submitted in the format specified in the tender document.",
      "Technical and financial bids should be submitted separately as instructed.",
      "Ensure all required documents are attached and properly authenticated.",
      "Bids must be submitted before the deadline. Late submissions will not be accepted.",
      "Earnest Money Deposit (EMD) must be submitted as specified in the tender.",
    ],
  },
  {
    title: "Evaluation Process",
    items: [
      "Technical bids will be evaluated first based on the criteria specified in the tender.",
      "Only technically qualified bids will proceed to financial evaluation.",
      "The lowest financial bid (L1) among technically qualified bidders typically wins, unless otherwise specified.",
      "The evaluation committee's decision is final and binding.",
      "The Gram Panchayat reserves the right to reject any or all bids without assigning any reason.",
    ],
  },
  {
    title: "Ethical Considerations",
    items: [
      "Bidders must not engage in any form of collusion or anti-competitive behavior.",
      "Any attempt to influence the tender process will lead to immediate disqualification.",
      "Confidentiality of tender information must be maintained by all parties.",
      "Declare any potential conflicts of interest to the tender issuing authority.",
      "Adhere to all anti-corruption and integrity guidelines as per government regulations.",
    ],
  },
];

const keyTerms = [
  {
    term: "EMD",
    definition:
      "Earnest Money Deposit - A security deposit to ensure serious bidders only.",
  },
  {
    term: "L1",
    definition: "Lowest Bidder - The bidder who has quoted the lowest price.",
  },
  {
    term: "Technical Bid",
    definition:
      "Documents demonstrating the bidder's technical capability to undertake the project.",
  },
  {
    term: "Financial Bid",
    definition:
      "The price quotation for the entire scope of work as defined in the tender.",
  },
  {
    term: "Corrigendum",
    definition:
      "An amendment or addition to a tender document post-publication.",
  },
];

export default function TenderGuidelines() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Tender Guidelines
      </h1>

      <p className="text-gray-700 mb-8 text-lg">
        These guidelines provide an overview of the tender process for Gram
        Panchayat projects. All potential bidders are advised to read these
        guidelines carefully along with the specific requirements mentioned in
        each tender document.
      </p>

      {guidelines.map((section, index) => (
        <Card key={index} className="mb-8 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-3">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-gray-700 text-base">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Key Terms
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Common terminology used in the tender process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-gray-800 font-semibold py-3">
                  Term
                </TableHead>
                <TableHead className="text-gray-800 font-semibold py-3">
                  Definition
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keyTerms.map((item, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <TableCell className="font-medium text-gray-700 py-3">
                    {item.term}
                  </TableCell>
                  <TableCell className="text-gray-600 py-3">
                    {item.definition}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
