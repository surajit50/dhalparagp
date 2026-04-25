import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const educationPrograms = [
  {
    name: "Scholarships",
    description:
      "Financial assistance for meritorious and economically disadvantaged students",
    eligibility: "Based on academic performance and family income",
    deadline: "June 30, 2024",
  },
  {
    name: "Free Textbooks",
    description:
      "Provision of free textbooks to all students in government schools",
    eligibility: "All students enrolled in government schools",
    deadline: "Distributed at the beginning of each academic year",
  },
  {
    name: "Midday Meal Program",
    description:
      "Nutritious meals provided to school children to improve attendance and nutrition",
    eligibility: "All students in government and government-aided schools",
    deadline: "Ongoing throughout the academic year",
  },
  {
    name: "Adult Education Initiative",
    description: "Evening classes for adults who missed formal education",
    eligibility: "Adults aged 18 and above who are not formally educated",
    deadline: "Rolling admissions",
  },
];

export default function EducationSupport() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Education Support Programs</h1>
      <p className="text-xl mb-8">
        Dhalpara Gram Panchayat is committed to promoting education and literacy
        in our community.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {educationPrograms.map((program) => (
          <Card key={program.name}>
            <CardHeader>
              <CardTitle>{program.name}</CardTitle>
              <CardDescription>{program.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Eligibility:</span>{" "}
                  {program.eligibility}
                </div>
                <div>
                  <span className="font-semibold">Deadline:</span>{" "}
                  <Badge variant="secondary">{program.deadline}</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/services/e-governance/applications">
                  Apply Now
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Education Helpline</CardTitle>
          <CardDescription>
            Get assistance with our education support programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            If you need any help or have questions about our education support
            programs, please contact our dedicated education helpline:
          </p>
          <p className="font-semibold mt-2">Phone: 0123-456789</p>
          <p className="font-semibold">
            Email: education@dhalparapanchayat.gov.in
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
