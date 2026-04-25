import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const coreValues = [
  "Transparency and accountability in governance",
  "Inclusive development for all community members",
  "Preservation of local culture and traditions",
  "Environmental sustainability and conservation",
  "Innovation in rural development",
];

export default function VisionMission() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Vision & Mission</h1>
      <p className="text-xl mb-8">
        Our guiding principles for the development of Dhalpara Gram Panchayat.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold italic">
              To transform Dhalpara into a model village that exemplifies
              sustainable rural development, preserves cultural heritage, and
              ensures a high quality of life for all its residents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Implement effective and transparent governance practices
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Promote inclusive economic growth and job creation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Enhance access to quality education and healthcare</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Develop sustainable infrastructure and environmental practices
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Foster community engagement and cultural preservation
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Our Core Values</CardTitle>
          <CardDescription>
            The principles that guide our actions and decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreValues.map((value, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-blue-500" />
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
