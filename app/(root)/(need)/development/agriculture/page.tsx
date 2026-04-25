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
    title: "Bangla Krishi Sech Yojana",
    description:
      "Provides micro-irrigation facilities to small and marginal farmers.",
    status: "Ongoing",
  },
  {
    title: "Matir Shristi",
    description:
      "Focuses on integrated farming and sustainable agriculture practices.",
    status: "Ongoing",
  },
  {
    title: "Krishak Bandhu",
    description:
      "Offers financial assistance to farmers for crop insurance and other support.",
    status: "Ongoing",
  },
  {
    title: "Farm Mechanization Program",
    description:
      "Subsidizes the purchase of modern farming equipment for increased productivity.",
    status: "Ongoing",
  },
];

const successStories = [
  {
    title: "Organic Farming Revolution in Burdwan",
    description:
      "A group of farmers in Burdwan district successfully transitioned to organic farming, increasing their income by 40% within two years.",
    image: "/placeholder.svg",
  },
  {
    title: "Innovative Irrigation in Purulia",
    description:
      "Farmers in drought-prone Purulia implemented a community-managed drip irrigation system, improving crop yields by 60%.",
    image: "/placeholder.svg",
  },
];

const resources = [
  {
    name: "West Bengal State Agricultural Management & Extension Training Institute",
    link: "https://sameti.org/",
  },
  {
    name: "Department of Agriculture, Government of West Bengal",
    link: "https://wb.gov.in/department-details.aspx?id=D000001&page=Agriculture",
  },
  {
    name: "Kisan Call Center",
    link: "https://dackkms.gov.in/account/kcc_home.aspx",
  },
];

export default function AgricultureDevelopment() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Agriculture Development
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Agriculture plays a vital role in the economy of West Bengal, with
            Gram Panchayats being at the forefront of implementing various
            agricultural development schemes. The state government, in
            collaboration with Panchayati Raj Institutions, is working towards
            sustainable agricultural practices, increased productivity, and
            improved farmer welfare.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Initiatives</CardTitle>
          <CardDescription>
            Current agricultural development programs in West Bengal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Initiative</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initiatives.map((initiative, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {initiative.title}
                  </TableCell>
                  <TableCell>{initiative.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{initiative.status}</Badge>
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
            Inspiring agricultural achievements in West Bengal Gram Panchayats
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
            Useful links for agricultural information and support
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
