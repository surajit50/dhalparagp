import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    name: "Road Improvement",
    description: "Upgrading 10km of rural roads to all-weather standards",
    status: "In Progress",
    progress: 60,
  },
  {
    name: "Water Supply Expansion",
    description: "Extending piped water supply to 500 additional households",
    status: "Planning",
    progress: 20,
  },
  {
    name: "Solar Street Lighting",
    description:
      "Installing 200 solar-powered street lights across the panchayat",
    status: "Completed",
    progress: 100,
  },
  {
    name: "Community Center Construction",
    description:
      "Building a multi-purpose community center for social gatherings and events",
    status: "In Progress",
    progress: 40,
  },
];

export default function InfrastructureDevelopment() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Infrastructure Development</h1>
      <p className="text-xl mb-8">
        Ongoing and planned infrastructure projects to improve life in Dhalpara
        Gram Panchayat.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{project.name}</CardTitle>
                <Badge
                  variant={
                    project.status === "Completed" ? "default" : "secondary"
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
