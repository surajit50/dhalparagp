import { govtscmeLink } from "@/constants";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";



const GovtScheme = () => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Government Schemes</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {govtscmeLink.map((item, i) => (
          <Card key={i} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="flex items-start space-x-4 p-4">
              <div className="relative h-20 w-20 flex-shrink-0">
                <Image
                  src={item.src}
                  alt={`Government Scheme ${item.description.description}`}
                  fill
                  sizes="(max-width: 768px) 80px, (max-width: 1200px) 80px, 80px"
                  className="rounded-lg object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{item.description.schemename}</h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {item.description.description || "Brief description of the government scheme and its benefits."}
                </p>
                <Button variant="outline" size="sm" className="w-full justify-between hover:bg-blue-50">
                  Learn More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default GovtScheme