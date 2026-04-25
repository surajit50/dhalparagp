import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MdCleaningServices, MdWaterDrop, MdHealthAndSafety } from "react-icons/md"

export default function SanitationInitiativesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sanitation Initiatives</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Street Cleaning
            </CardTitle>
            <MdCleaningServices className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">200 km</div>
            <p className="text-xs text-muted-foreground">
              Cleaned weekly
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Water Treatment
            </CardTitle>
            <MdWaterDrop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 million gallons</div>
            <p className="text-xs text-muted-foreground">
              Treated daily
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Public Health Campaigns
            </CardTitle>
            <MdHealthAndSafety className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10 campaigns</div>
            <p className="text-xs text-muted-foreground">
              Ongoing this quarter
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
