import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MdRecycling, MdTrendingUp, MdPeople } from "react-icons/md"

export default function RecyclingProgramsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recycling Programs</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recycling Rate
            </CardTitle>
            <MdRecycling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Materials Recycled
            </CardTitle>
            <MdTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,200 tons</div>
            <p className="text-xs text-muted-foreground">
              Paper, plastic, glass, metal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Program Participants
            </CardTitle>
            <MdPeople className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">50,000</div>
            <p className="text-xs text-muted-foreground">
              Households and businesses
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
