import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const historyEvents = [
  {
    year: 1950,
    title: "Establishment of Dhalpara Gram Panchayat",
    description:
      "Dhalpara Gram Panchayat was officially established as a local self-government unit.",
  },
  {
    year: 1965,
    title: "First Community Center",
    description:
      "The first community center was built, providing a central gathering place for villagers.",
  },
  {
    year: 1980,
    title: "Rural Electrification",
    description:
      "Electricity reached all households in Dhalpara, marking a significant milestone in development.",
  },
  {
    year: 1995,
    title: "Water Supply Project",
    description:
      "A comprehensive water supply project was implemented, ensuring clean water for all residents.",
  },
  {
    year: 2010,
    title: "Digital Initiative",
    description:
      "Dhalpara Gram Panchayat launched its first website, embracing digital governance.",
  },
  {
    year: 2023,
    title: "Smart Village Project",
    description:
      "Initiated the Smart Village project to integrate technology in all aspects of governance and community life.",
  },
];

export default function OurHistory() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Our History</h1>
      <p className="text-xl mb-8">
        Discover the journey of Dhalpara Gram Panchayat through the years.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Timeline of Progress</CardTitle>
            <CardDescription>
              Key milestones in our panchayats development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {historyEvents.map((event, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-1 w-4 h-4 bg-primary rounded-full"></div>
                  {index < historyEvents.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-[2px] bg-muted"></div>
                  )}
                  <h3 className="font-bold">
                    {event.year}: {event.title}
                  </h3>
                  <p>{event.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Roots</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src="/images/historical-dhalpara.jpg" // Replace with actual image path
                alt="Historical photo of Dhalpara village"
                width={400}
                height={300}
                className="rounded-lg mb-4"
              />
              <p>
                Dhalpara has a rich history dating back centuries. Our panchayat
                system has evolved from traditional village councils to the
                modern governance structure we have today.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Over the years, our community has grown from a small
                agricultural village to a thriving rural center. We have
                embraced progress while preserving our cultural heritage and
                values.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Historical Significance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Dhalpara Gram Panchayat has played a crucial role in the regions
            development. From its inception, it has been at the forefront of
            implementing various government schemes and local initiatives. The
            panchayat s efforts have significantly contributed to improving the
            quality of life for its residents, promoting education, healthcare,
            and sustainable development practices.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
