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

const healthcareInitiatives = [
  {
    name: "Primary Health Center",
    services: "General check-ups, vaccinations, maternal care",
    timing: "Monday to Saturday, 9 AM to 5 PM",
  },
  {
    name: "Mobile Health Clinic",
    services: "Basic health services for remote areas",
    timing: "Weekly visits to designated areas",
  },
  {
    name: "Vaccination Drive",
    services: "Regular immunization programs for children and adults",
    timing: "First Sunday of every month",
  },
  {
    name: "Maternal Health Program",
    services: "Prenatal and postnatal care, nutrition support",
    timing: "Daily at Primary Health Center",
  },
];

const awarenessPrograms = [
  "Dengue and Malaria Prevention",
  "Tuberculosis Awareness and DOTS Program",
  "Nutrition Education for Pregnant Women and Children",
  "Sanitation and Hygiene Awareness",
  "Mental Health Awareness",
];

export default function HealthcareInitiatives() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Healthcare Initiatives</h1>
      <p className="text-xl mb-8">
        Dhalpara Gram Panchayat is dedicated to improving the health and
        well-being of our community through various healthcare initiatives.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Healthcare Services</CardTitle>
          <CardDescription>
            Overview of healthcare services available in our panchayat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Initiative</TableHead>
                <TableHead>Services Offered</TableHead>
                <TableHead>Timing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthcareInitiatives.map((initiative) => (
                <TableRow key={initiative.name}>
                  <TableCell className="font-medium">
                    {initiative.name}
                  </TableCell>
                  <TableCell>{initiative.services}</TableCell>
                  <TableCell>{initiative.timing}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Health Awareness Programs</CardTitle>
          <CardDescription>
            Regular awareness campaigns to promote community health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2">
            {awarenessPrograms.map((program) => (
              <li key={program}>{program}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/services/e-governance/applications">
              Register for Awareness Program
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>
            For medical emergencies and ambulance services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            Emergency Helpline: 108
          </p>
          <p className="mt-2">For non-emergency medical inquiries:</p>
          <p className="font-semibold">Phone: 0123-456789</p>
          <p className="font-semibold">
            Email: health@dhalparapanchayat.gov.in
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
