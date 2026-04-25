import { Bell, Newspaper, FileText, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const notifications = [
  {
    type: "Notification",
    content: "Important update for residents",
    date: "2023-05-20",
    icon: Bell,
  },
  {
    type: "News",
    content: "Recent developments in our community",
    date: "2023-05-18",
    icon: Newspaper,
  },
  {
    type: "Tender",
    content: "New tender for infrastructure project",
    date: "2023-05-15",
    icon: FileText,
  },
]

export default function NotificationsSection() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-indigo-800 p-6">
        <h2 className="text-2xl font-bold text-white">Updates</h2>
      </div>
      <CardContent className="p-0">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-indigo-100">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-white">
              News
            </TabsTrigger>
            <TabsTrigger value="tenders" className="data-[state=active]:bg-white">
              Tenders
            </TabsTrigger>
          </TabsList>
          {["notifications", "news", "tenders"].map((tab) => (
            <TabsContent key={tab} value={tab} className="p-4">
              <ScrollArea className="h-[300px] w-full rounded-md">
                <ul className="space-y-4">
                  {notifications.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow transition-all duration-300 hover:shadow-md hover:translate-x-1"
                    >
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <item.icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.content}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

