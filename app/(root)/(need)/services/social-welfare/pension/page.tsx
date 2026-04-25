import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

const pensionSchemes = [
  {
    name: "Old Age Pension",
    eligibility: "60 years and above",
    amount: "₹1000 per month",
  },
  {
    name: "Widow Pension",
    eligibility: "Widows aged 40-59 years",
    amount: "₹1500 per month",
  },
  {
    name: "Disability Pension",
    eligibility: "Persons with 40% or more disability",
    amount: "₹1500 per month",
  },
];

export default function PensionSchemes() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Pension Schemes</h1>
      <p className="text-xl mb-8">
        Dhalpara Gram Panchayat offers various pension schemes to support
        eligible citizens.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Pension Schemes</CardTitle>
          <CardDescription>
            Overview of pension schemes offered by Dhalpara Gram Panchayat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme Name</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pensionSchemes.map((scheme) => (
                <TableRow key={scheme.name}>
                  <TableCell className="font-medium">{scheme.name}</TableCell>
                  <TableCell>{scheme.eligibility}</TableCell>
                  <TableCell>{scheme.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Apply</CardTitle>
          <CardDescription>
            Follow these steps to apply for a pension scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Collect the application form from the Gram Panchayat office or
              download it from our website.
            </li>
            <li>Fill out the application form with accurate information.</li>
            <li>
              Attach necessary documents (proof of age, income certificate,
              etc.).
            </li>
            <li>
              Submit the completed application at the Gram Panchayat office.
            </li>
            <li>Receive an acknowledgment receipt for your application.</li>
            <li>Wait for the verification process to complete.</li>
            <li>If approved, you will receive a pension sanction letter.</li>
          </ol>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/services/e-governance/applications">Apply Online</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
