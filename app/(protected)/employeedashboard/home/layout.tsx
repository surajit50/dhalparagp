import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


interface employeehomelayoutprops {
    children: React.ReactNode,

}

export default async function Adminhomelayoutprops({ children }: employeehomelayoutprops) {
    const cstaff = await currentUser()

    if (!cstaff) {
        return <div>Please log in to view your dashboard.</div>
    }

    const warishApplications = await db.warishApplication.findMany({
        where: {
            assingstaffId: cstaff.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const pendingApplications = warishApplications.filter(app => app.warishApplicationStatus === 'process')
    const approvedApplications = warishApplications.filter(app => app.warishApplicationStatus === 'approved')
    const rejectedApplications = warishApplications.filter(app => app.warishApplicationStatus === 'rejected')
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Welcome, {cstaff.name}</h1>

            
                    
            <div>
                {children}
            </div>
        </div>
    )

}
