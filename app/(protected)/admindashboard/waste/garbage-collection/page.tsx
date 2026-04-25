import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MdDelete, MdSchedule, MdMap } from "react-icons/md"

export default function GarbageCollectionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Garbage Collection</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Waste Collected
            </CardTitle>
            <MdDelete className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,500 tons</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Schedule
            </CardTitle>
            <MdSchedule className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mon, Wed, Fri</div>
            <p className="text-xs text-muted-foreground">
              Residential areas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Routes
            </CardTitle>
            <MdMap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 routes</div>
            <p className="text-xs text-muted-foreground">
              Covering 85% of the city
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
