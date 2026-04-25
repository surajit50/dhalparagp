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

const keySectors = [
  {
    name: "Handloom and Textiles",
    description: "Traditional weaving and modern textile production",
    employmentPotential: "High",
  },
  {
    name: "Food Processing",
    description: "Value addition to agricultural produce",
    employmentPotential: "Medium",
  },
  {
    name: "Handicrafts",
    description: "Production of traditional and modern crafts",
    employmentPotential: "High",
  },
  {
    name: "Sericulture",
    description: "Silk production and processing",
    employmentPotential: "Medium",
  },
  {
    name: "Coir Industry",
    description: "Products made from coconut husk",
    employmentPotential: "Medium",
  },
];

const supportSchemes = [
  {
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    description:
      "Provides credit-linked subsidy for setting up micro-enterprises",
    implementingAgency: "Khadi and Village Industries Commission",
  },
  {
    name: "Bangla Swanirbhar Karmasansthan Prakalpa",
    description:
      "Offers financial assistance to unemployed youth for self-employment",
    implementingAgency:
      "Department of Self Help Group & Self Employment, Govt. of West Bengal",
  },
  {
    name: "Micro Units Development and Refinance Agency (MUDRA)",
    description:
      "Provides loans for non-farm sector income generating activities",
    implementingAgency: "MUDRA Bank",
  },
];

const successStories = [
  {
    title: "Shantiniketan Leather Craft Cluster",
    description:
      "A group of artisans in Shantiniketan formed a cluster, modernizing their production techniques and increasing exports by 200% in three years.",
    image: "/placeholder.svg",
  },
  {
    title: "Midnapore Bamboo Products Revolution",
    description:
      "Innovative bamboo product designs from Midnapore are now being exported to European markets, providing employment to over 500 rural artisans.",
    image: "/placeholder.svg",
  },
];

export default function RuralIndustries() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Rural Industries Development
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {` Rural industries play a crucial role in the economic development of
            West Bengal's Gram Panchayats. These industries not only provide
            employment opportunities but also help in preserving traditional
            skills and promoting local resources. The state government, along
            with Panchayati Raj Institutions, is implementing various schemes to
            boost rural industrialization and entrepreneurship.`}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Rural Industry Sectors</CardTitle>
          <CardDescription>
            Major rural industries in West Bengal Gram Panchayats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sector</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Employment Potential</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keySectors.map((sector, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>{sector.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sector.employmentPotential === "High"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {sector.employmentPotential}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Support Schemes</CardTitle>
          <CardDescription>
            Government initiatives to promote rural industries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {supportSchemes.map((scheme, index) => (
              <li
                key={index}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <h3 className="font-semibold text-lg">{scheme.name}</h3>
                <p className="text-gray-600 mt-1">{scheme.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Implementing Agency: {scheme.implementingAgency}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Stories</CardTitle>
          <CardDescription>
            Inspiring rural industry achievements in West Bengal
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
    </div>
  );
}
