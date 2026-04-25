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

const skillPrograms = [
  {
    name: "Utkarsh Bangla",
    description: "State's flagship skill development program",
    targetGroup: "Youth and unemployed individuals",
    duration: "Varies by course",
  },
  {
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
    description: "Central government's skill certification and reward scheme",
    targetGroup: "School/college dropouts or unemployed",
    duration: "150-300 hours",
  },
  {
    name: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)",
    description: "Rural youth employment program",
    targetGroup: "Rural youth aged 15-35",
    duration: "3-12 months",
  },
  {
    name: "Recognition of Prior Learning (RPL)",
    description: "Recognizes and certifies existing skills",
    targetGroup: "Experienced workers without formal certification",
    duration: "2-3 days",
  },
];

const trainingCenters = [
  {
    name: "Industrial Training Institutes (ITIs)",
    courses: "Engineering and non-engineering trades",
    locations: "Multiple districts",
  },
  {
    name: "Rural Self Employment Training Institutes (RSETIs)",
    courses: "Entrepreneurship and self-employment skills",
    locations: "One in each district",
  },
  {
    name: "Paschim Banga Society for Skill Development",
    courses: "Various sector-specific skills",
    locations: "Kolkata with outreach programs",
  },
];

const successStories = [
  {
    title: "From Farm to IT: Riya's Journey",
    description:
      "Riya, from a small village in Burdwan, completed a 6-month computer course under Utkarsh Bangla and secured a job as a junior software developer in Kolkata.",
    image: "/placeholder.svg",
  },
  {
    title: "Weaving Success: Amit's Story",
    description:
      "Amit, a traditional weaver from Nadia, upgraded his skills through the Recognition of Prior Learning program and now runs a successful handloom business employing 10 people.",
    image: "/placeholder.svg",
  },
];

export default function SkillDevelopment() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Skill Development
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Skill development is a key focus area for Gram Panchayats in West
            Bengal, aimed at enhancing employability and promoting
            entrepreneurship among rural youth. Various state and central
            government initiatives are being implemented to bridge the skill gap
            and create a skilled workforce that meets industry demands.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Skill Development Programs</CardTitle>
          <CardDescription>
            Major initiatives to enhance skills in rural West Bengal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Target Group</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skillPrograms.map((program, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{program.name}</TableCell>
                  <TableCell>{program.description}</TableCell>
                  <TableCell>{program.targetGroup}</TableCell>
                  <TableCell>{program.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Training Centers</CardTitle>
          <CardDescription>
            Key institutions providing skill training in West Bengal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {trainingCenters.map((center, index) => (
              <li
                key={index}
                className="border-b pb-4 last:border-b-0 last:pb-0"
              >
                <h3 className="font-semibold text-lg">{center.name}</h3>
                <p className="text-gray-600 mt-1">Courses: {center.courses}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Locations: {center.locations}
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
            Inspiring skill development achievements in West Bengal
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
