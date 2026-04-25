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
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

const initiatives = [
  {
    name: "Kanyashree Prakalpa",
    description:
      "Provides annual scholarships to girls aged 13-18 to continue their education and prevent early marriage",
    impact: "Over 60 lakh girls benefited",
  },
  {
    name: "Rupashree Prakalpa",
    description:
      "One-time financial grant of Rs. 25,000 for economically stressed families at the time of their adult daughter's marriage",
    impact: "Over 6 lakh beneficiaries",
  },
  {
    name: "Swawlamban",
    description: "Skill development and self-employment program for women",
    impact: "Trained over 1 lakh women",
  },
  {
    name: "Muktir Alo",
    description: "Scheme for rehabilitation of sex workers and their children",
    impact: "Supported over 1000 women",
  },
];

const successStories = [
  {
    title: "Sundarban's Beekeeping Queen",
    description:
      "Purnima Mondal from a remote village in Sundarban started a successful beekeeping enterprise with support from the Swawlamban program, now employing 20 local women.",
    image: "/placeholder.svg",
  },
  {
    title: "Education Champion of Purulia",
    description:
      "Lakshmi Mahato, a Kanyashree beneficiary, not only completed her education but also started a campaign that brought 100 dropout girls back to school in her district.",
    image: "/placeholder.svg",
  },
];

const resources = [
  {
    name: "West Bengal Women Development Undertaking",
    link: "https://wbwduc.org/",
  },
  {
    name: "Kanyashree Online Portal",
    link: "https://wbkanyashree.gov.in/kp_4.0/index.php",
  },
  {
    name: "Women & Child Development and Social Welfare Department",
    link: "https://wbcdwdsw.gov.in/",
  },
];

export default function WomenEmpowerment() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Women Empowerment
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Women empowerment is a crucial focus area for Gram Panchayats in
            West Bengal. The state government, in collaboration with Panchayati
            Raj Institutions, has implemented various schemes and initiatives to
            promote education, skill development, and economic independence
            among women. These efforts aim to create a more inclusive and
            equitable society at the grassroots level.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Initiatives</CardTitle>
          <CardDescription>
            Major women empowerment programs in West Bengal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Initiative</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initiatives.map((initiative, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {initiative.name}
                  </TableCell>
                  <TableCell>{initiative.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{initiative.impact}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Success Stories</CardTitle>
          <CardDescription>
            Inspiring achievements of women in West Bengal Gram Panchayats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {successStories.map((story, index) => (
              <Card key={index}>
                <Image
                  src={story.image}
                  alt={story.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle className="text-lg">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{story.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Useful links for women empowerment initiatives in West Bengal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {resources.map((resource, index) => (
              <li key={index}>
                <Link
                  href={resource.link}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.name}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
