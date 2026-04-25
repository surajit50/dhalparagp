import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Home,
  Users,
  Droplets,
  Zap,
  Recycle,
  Shield,
  Phone,
  Download,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Citizen Services
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Comprehensive services designed to meet the diverse needs of our
            community
          </p>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Service Categories
          </h2>

          {/* Certificate Services */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
              <FileText className="mr-3 h-6 w-6 text-blue-600" />
              Certificate Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Birth Certificate</CardTitle>
                  <CardDescription>
                    Official birth registration and certificate issuance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      Processing Time: 7-10 days
                    </div>
                    <a
                      href="https://janma-mrityutathya.wb.gov.in/"
                      target="__blank"
                    >
                      <Button className="w-full" size="sm">
                        Apply Online
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Death Certificate</CardTitle>
                  <CardDescription>
                    Official death registration and certificate issuance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      Processing Time: 5-7 days
                    </div>
                    <a
                      href="https://janma-mrityutathya.wb.gov.in/"
                      target="__blank"
                    >
                      <Button className="w-full" size="sm">
                        Apply Online
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Income Certificate</CardTitle>
                  <CardDescription>
                    Income verification for various purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-2 h-4 w-4" />
                      Processing Time: 10-15 days
                    </div>
                    {/* //https://wbpms.in/citizen/ */}
                    <a href="https://wbpms.in/citizen/" target="__blank">
                      <Button className="w-full" size="sm">
                        Apply Online
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Property & Tax Services */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
              <Home className="mr-3 h-6 w-6 text-green-600" />
              Property & Tax Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Property Tax Payment
                  </CardTitle>
                  <CardDescription>
                    Online property tax payment and receipt generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Online payment gateway</li>
                      <li>• Instant receipt generation</li>
                      <li>• Payment history tracking</li>
                      <li>• SMS/Email notifications</li>
                    </ul>
                    <a
                      href="https://www.prdtax.wb.gov.in/login"
                      target="__blank"
                    >
                      <Button className="w-full" size="sm">
                        Pay Now
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Property Assessment</CardTitle>
                  <CardDescription>
                    Property valuation and tax assessment services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Professional assessment</li>
                      <li>• Fair market valuation</li>
                      <li>• Appeal process available</li>
                      <li>• Transparent methodology</li>
                    </ul>
                    <Button className="w-full" size="sm" variant="outline">
                      Request Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Welfare Schemes */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
              <Users className="mr-3 h-6 w-6 text-purple-600" />
              Welfare Schemes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-orange-100 text-orange-800">
                    Housing
                  </Badge>
                  <CardTitle className="text-lg">PM Awas Yojana</CardTitle>
                  <CardDescription>
                    Housing scheme for economically weaker sections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Financial assistance up to ₹2.5 lakhs for house
                      construction
                    </p>
                    <Link href="/pmay-eligibility">
                      <Button className="w-full" size="sm">
                        Check Eligibility
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-green-100 text-green-800">
                    Employment
                  </Badge>
                  <CardTitle className="text-lg">MGNREGA</CardTitle>
                  <CardDescription>
                    Guaranteed employment scheme for rural households
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      100 days guaranteed employment per household per year
                    </p>
                    <Link href="/mgnrega-job-card">
                      <Button className="w-full" size="sm">
                        Apply for Job Card
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="w-fit mb-2 bg-blue-100 text-blue-800">
                    Health
                  </Badge>
                  <CardTitle className="text-lg">Ayushman Bharat</CardTitle>
                  <CardDescription>
                    Health insurance scheme for poor families
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Health coverage up to ₹5 lakhs per family per year
                    </p>
                    <Button className="w-full" size="sm">
                      Get Health Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Infrastructure Services */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center">
              <Zap className="mr-3 h-6 w-6 text-yellow-600" />
              Infrastructure Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Droplets className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Water Supply</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    24/7 clean water supply to all households
                  </p>
                  <Button size="sm" variant="outline">
                    Report Issue
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Zap className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Electricity</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Reliable power supply and street lighting
                  </p>
                  <Button size="sm" variant="outline">
                    Report Outage
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Recycle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Waste Management</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Door-to-door waste collection service
                  </p>
                  <Button size="sm" variant="outline">
                    Schedule Pickup
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Public Safety</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    24/7 emergency response services
                  </p>
                  <Button size="sm" variant="outline">
                    Emergency Contact
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How to Access Services
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Apply Online</h3>
                <p className="text-gray-600">
                  Submit your application through our online portal with
                  required documents
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  Monitor your application status in real-time through SMS and
                  email updates
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Receive Service</h3>
                <p className="text-gray-600">
                  Get your certificate or service delivered to your doorstep or
                  collect from office
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Services */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Help with Services?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our dedicated support team is available to assist you with any
            service-related queries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Phone className="mr-2 h-5 w-5" />
              Call Support: +91 98765 43210
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Visit Office
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
