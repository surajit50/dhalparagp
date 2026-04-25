import {
  FileText,
  CreditCard,
  MessageSquare,
  Map,
  DollarSign,
  Home,
  Activity,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    category: "Online Services",
    items: [
      {
        name: "Birth Certificate",
        icon: FileText,
        link: "https://janma-mrityutathya.wb.gov.in/",
      },
      {
        name: "Death Certificate",
        icon: FileText,
        link: "https://janma-mrityutathya.wb.gov.in/",
      },
      {
        name: "Property Tax Payment",
        icon: CreditCard,
        link: "https://prdtax.wb.gov.in/",
      },
      {
        name: "Grievance Redressal",
        icon: MessageSquare,
        link: "https://cmo.wb.gov.in/",
      },
    ],
  },
  {
    category: "Management Systems",
    items: [
      { name: "Land Records", icon: Map, link: "https://banglarbhumi.gov.in/" },
      {
        name: "Pension Schemes",
        icon: DollarSign,
        link: "https://nsap.nic.in/",
      },
      {
        name: "Rural Housing",
        icon: Home,
        link: "https://pmayg.gov.in/netiayHome/home.aspx",
      },
      {
        name: "MGNREGA Job Cards",
        icon: CreditCard,
        link: "https://nrega.nic.in/",
      },
    ],
  },
  {
    category: "Other Resources",
    items: [
      {
        name: "Gram Panchayat Development Plan",
        icon: FileText,
        link: "https://egramswaraj.gov.in/",
      },
      {
        name: "Village Health Plan",
        icon: Activity,
        link: "https://wb.gov.in/portal/web/guest/village-health",
      },
      {
        name: "Disaster Management",
        icon: AlertTriangle,
        link: "http://wbdmd.gov.in/Pages/Default.aspx",
      },
      {
        name: "RTI Information",
        icon: Info,
        link: "https://rtionline.gov.in/",
      },
    ],
  },
];

export default function EGovernmentServices() {
  return (
    <section className="my-12">
      <Card className="overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
          <h2 className="text-3xl font-bold text-white">
            Bengal Government E-Services
          </h2>
          <p className="mt-2 text-sm text-indigo-100">
            Access various government services online with ease.
          </p>
        </div>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((category, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-6 text-xl text-indigo-800">
                  {category.category}
                </h3>
                <ul className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a
                        href={item.link}
                        target="_blank" // Open links in a new tab
                        rel="noopener noreferrer" // Security best practice
                        className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:transform hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-lg">
                          <item.icon
                            className="h-5 w-5 text-indigo-600"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
