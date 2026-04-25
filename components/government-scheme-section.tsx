import { Users, Trash2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const schemes = [
  {
    title: "MGNREGA",
    description: "Rural employment guarantee scheme",
    icon: Users,
  },
  {
    title: "Swachh Bharat Mission",
    description: "Clean India campaign",
    icon: Trash2,
  },
  { title: "PM Awas Yojana", description: "Housing for all", icon: Home },
]

export default function GovernmentSchemeSection() {
  return (
    <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-indigo-800 p-6">
        <h2 className="text-2xl font-bold text-white">Government Schemes</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((scheme, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <scheme.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-lg text-indigo-800">{scheme.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{scheme.description}</p>
              <Button variant="link" className="p-0 text-indigo-600 hover:text-indigo-800">
                Learn More
                <span className="sr-only">about {scheme.title}</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

