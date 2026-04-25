
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamMembers = [
  {
    name: "Rajesh Kumar",
    position: "Gram Pradhan (Village Head)",
    bio: "Rajesh has been leading Dhalpara Gram Panchayat since 2020. He is committed to sustainable development and community welfare.",
    image: "/images/team/rajesh-kumar.jpg",
  },
  // ... other team members with updated image paths
];

export default function Team() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Our Team</h1>
        <p className="text-xl text-muted-foreground">
          Meet the dedicated individuals working to serve Dhalpara Gram Panchayat.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={member.image} 
                    alt={`Portrait of ${member.name}`}
                  />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.position}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{member.bio}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-secondary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Join Our Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We are always looking for passionate individuals to contribute to
            our communitys development. If you are interested in serving
            Dhalpara Gram Panchayat, please contact our office for information
            on upcoming elections or volunteer opportunities.
          </p>
          <a
            href="/contact"
            className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Contact Us
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
