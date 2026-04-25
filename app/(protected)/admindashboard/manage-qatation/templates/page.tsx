"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, Wrench, Package, DollarSign } from "lucide-react";

const quotationTemplates = [
  {
    type: "work",
    title: "Work/Services Quotation",
    description:
      "For construction, maintenance, repair, and other service work",
    icon: Wrench,
    color: "bg-blue-500",
    examples: [
      "Building maintenance and repair",
      "Electrical installation work",
      "Plumbing services",
      "Cleaning and housekeeping",
      "Security services",
      "IT support and maintenance",
    ],
  },
  {
    type: "supply",
    title: "Supply Quotation",
    description: "For procurement of new materials, equipment, and supplies",
    icon: Package,
    color: "bg-green-500",
    examples: [
      "Office furniture and equipment",
      "Computer hardware and software",
      "Stationery and consumables",
      "Medical equipment and supplies",
      "Construction materials",
      "Vehicle spare parts",
    ],
  },
  {
    type: "sale",
    title: "Sale of Items Quotation",
    description: "For disposal/sale of old, surplus, or scrap items",
    icon: DollarSign,
    color: "bg-orange-500",
    examples: [
      "Old tubewell parts and equipment",
      "Surplus office furniture",
      "Scrap metal and materials",
      "Used vehicles and machinery",
      "Outdated computer equipment",
      "Excess inventory items",
    ],
  },
];

export default function QuotationTemplatesPage() {
  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Quotation Templates
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the appropriate template for your quotation type
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quotationTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.type}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">
                      Common Examples:
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {template.examples.slice(0, 4).map((example, index) => (
                        <li key={index}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                  <Button asChild className="w-full">
                    <Link
                      href={`/admindashboard/manage-qatation/create?type=${template.type}`}
                    >
                      Create {template.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotation Type Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">
                  Work/Services
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Specify work location</li>
                  <li>• Include completion timeline</li>
                  <li>• Detail quality requirements</li>
                  <li>• Mention safety standards</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 mb-2">
                  Supply Items
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Provide technical specifications</li>
                  <li>• Specify quantity and units</li>
                  <li>• Include delivery requirements</li>
                  <li>• Mention warranty terms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-orange-600 mb-2">
                  Sale of Items
                </h3>
                <ul className="text-sm space-y-1">
                  <li>• Describe item condition</li>
                  <li>• Specify as-is terms</li>
                  <li>• Include pickup arrangements</li>
                  <li>• Set minimum bid amounts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
