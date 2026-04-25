import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Calendar } from "lucide-react"

type Announcement = {
    id: number;
    title: string;
    content: string;
    date: string;
    category: string;
}

const announcements: Announcement[] = [
    {
        id: 1,
        title: "New Course Available",
        content: "We're excited to announce our new course on Advanced React Patterns. Enroll now!",
        date: "2023-05-15",
        category: "Course Update"
    },
    {
        id: 2,
        title: "System Maintenance",
        content: "Our platform will be undergoing maintenance on May 20th from 2 AM to 4 AM UTC. We apologize for any inconvenience.",
        date: "2023-05-18",
        category: "System Update"
    },
    {
        id: 3,
        title: "Summer Coding Challenge",
        content: "Join our summer coding challenge and win exciting prizes! Registration opens on June 1st.",
        date: "2023-05-25",
        category: "Event"
    },
    // Add more announcements as needed
]

export default function Announcements() {
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">Announcements</CardTitle>
                        <Badge variant="outline" className="text-sm">
                            <Bell className="w-3 h-3 mr-1" />
                            {announcements.length} New
                        </Badge>
                    </div>
                    <CardDescription>Stay updated with the latest news and information</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id} className="mb-4">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg font-semibold">{announcement.title}</CardTitle>
                                        <Badge variant="secondary">{announcement.category}</Badge>
                                    </div>
                                    <CardDescription className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(announcement.date).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>{announcement.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}