import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, IndianRupee, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function DevelopmentPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Development Projects</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Transforming our community through strategic infrastructure development and social initiatives
          </p>
        </div>
      </section>

      {/* Project Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">45</div>
              <div className="text-gray-600">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">32</div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">8</div>
              <div className="text-gray-600">Ongoing</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-gray-600">Planned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Ongoing Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  alt="Water Supply Project"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600">Infrastructure</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Rural Water Supply Enhancement
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                </CardTitle>
                <CardDescription>Comprehensive water supply system covering 8 villages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <IndianRupee className="mr-1 h-4 w-4" />
                      Budget: ₹50,00,000
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Timeline: 18 months
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 5 out of 8 villages connected</p>
                    <p>• 12 km pipeline laid</p>
                    <p>• 3 water treatment plants operational</p>
                    <p>• Expected completion: August 2025</p>
                  </div>
                  <Button className="w-full" size="sm">
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  alt="Road Construction"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-green-600">Transportation</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Village Road Network Improvement
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                </CardTitle>
                <CardDescription>Concrete road construction connecting remote villages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <IndianRupee className="mr-1 h-4 w-4" />
                      Budget: ₹35,00,000
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Timeline: 12 months
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 8 km out of 20 km completed</p>
                    <p>• 4 villages now accessible</p>
                    <p>• Drainage system installed</p>
                    <p>• Expected completion: October 2025</p>
                  </div>
                  <Button className="w-full" size="sm">
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  alt="School Building"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-purple-600">Education</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Primary School Modernization
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                </CardTitle>
                <CardDescription>Upgrading infrastructure and facilities in 3 primary schools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <IndianRupee className="mr-1 h-4 w-4" />
                      Budget: ₹25,00,000
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Timeline: 10 months
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 2 schools renovation completed</p>
                    <p>• Smart classrooms installed</p>
                    <p>• Library and computer lab setup</p>
                    <p>• Expected completion: June 2025</p>
                  </div>
                  <Button className="w-full" size="sm">
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  alt="Healthcare Center"
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-red-600">Healthcare</Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Community Health Center Expansion
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Clock className="mr-1 h-3 w-3" />
                    In Progress
                  </Badge>
                </CardTitle>
                <CardDescription>Expanding healthcare facilities and adding new equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <IndianRupee className="mr-1 h-4 w-4" />
                      Budget: ₹40,00,000
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      Timeline: 14 months
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>55%</span>
                    </div>
                    <Progress value={55} className="h-2" />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• New wing construction 80% complete</p>
                    <p>• Medical equipment procurement ongoing</p>
                    <p>• Staff quarters under construction</p>
                    <p>• Expected completion: September 2025</p>
                  </div>
                  <Button className="w-full" size="sm">
                    View Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Completed Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Recently Completed Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Solar Street Lighting
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                </CardTitle>
                <CardDescription>LED solar street lights installed across all villages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Budget:</span>
                    <span>₹15,00,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed:</span>
                    <span>December 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Beneficiaries:</span>
                    <span>3,456 households</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    150 solar LED street lights installed, providing safe nighttime mobility for residents.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Waste Management System
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                </CardTitle>
                <CardDescription>Door-to-door waste collection and composting facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Budget:</span>
                    <span>₹12,00,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed:</span>
                    <span>November 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Coverage:</span>
                    <span>100% households</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Comprehensive waste management with segregation, collection, and organic composting facility.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Digital Literacy Center
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                </CardTitle>
                <CardDescription>Computer training center for youth and women</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Budget:</span>
                    <span>₹8,00,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completed:</span>
                    <span>October 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span>30 students</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    20 computers with internet connectivity, providing digital skills training to 200+ residents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planned Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Upcoming Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Integrated Sports Complex
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Planning Phase
                  </Badge>
                </CardTitle>
                <CardDescription>Multi-purpose sports facility for youth development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Estimated Budget:</span>
                      <div className="font-semibold">₹75,00,000</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected Start:</span>
                      <div className="font-semibold">April 2025</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-semibold">24 months</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Funding:</span>
                      <div className="font-semibold">State + Central</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Planned Facilities:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Football and cricket ground</li>
                      <li>• Indoor badminton and table tennis</li>
                      <li>• Gymnasium and fitness center</li>
                      <li>• Changing rooms and spectator gallery</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Renewable Energy Initiative
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Planning Phase
                  </Badge>
                </CardTitle>
                <CardDescription>Solar power generation for public buildings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Estimated Budget:</span>
                      <div className="font-semibold">₹45,00,000</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected Start:</span>
                      <div className="font-semibold">June 2025</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-semibold">8 months</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <div className="font-semibold">500 KW</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Target Buildings:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Panchayat office and community hall</li>
                      <li>• Primary schools and health center</li>
                      <li>• Water treatment plants</li>
                      <li>• Street lighting network</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Project Impact */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Development Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">15,000+</div>
              <div className="text-blue-200">People Benefited</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">₹2.5Cr</div>
              <div className="text-blue-200">Investment Made</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">85%</div>
              <div className="text-blue-200">Project Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">12</div>
              <div className="text-blue-200">Villages Covered</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
