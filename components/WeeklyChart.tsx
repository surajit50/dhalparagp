"use client"

const chartData = [
    { name: "Mon", visits: 200, pageViews: 400 },
    { name: "Tue", visits: 300, pageViews: 450 },
    { name: "Wed", visits: 250, pageViews: 350 },
    { name: "Thu", visits: 400, pageViews: 500 },
    { name: "Fri", visits: 350, pageViews: 480 },
    { name: "Sat", visits: 200, pageViews: 300 },
    { name: "Sun", visits: 250, pageViews: 390 },
]

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
const WeeklyChart = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="visits" fill="#3b82f6" name="Visits" />
                        <Bar dataKey="pageViews" fill="#22c55e" name="Page Views" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export default WeeklyChart