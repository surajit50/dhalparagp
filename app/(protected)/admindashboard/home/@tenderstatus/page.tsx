import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ArrowDownIcon, ArrowUpIcon, Users, Eye, UserPlus, PercentIcon } from "lucide-react"
// Fetch all data concurrently using Promise.all for better performance
import { db } from "@/lib/db"
import { FaUsers, FaFileAlt, FaChartLine, FaTimes } from 'react-icons/fa';

type TenderStatus = "TechnicalEvaluation" | "published" | "AOC" | "Retender" | "Cancelled";



const page = async () => {

    const getWorkCountByStatus = (status: TenderStatus): Promise<number> => {
        return db.worksDetail.count({
            where: {
                tenderStatus: status,
            },
        });
    };

    const [
        visitor,
        nitCount,
        techev,
        publishwork,
        aocwork,
        retender,
        cancelwork,
    ] = await Promise.all([
        db.visitor.findFirst({ select: { totalVisitors: true } }),
        db.nitDetails.count(),
        getWorkCountByStatus("TechnicalEvaluation"),
        getWorkCountByStatus("published"),
        getWorkCountByStatus("AOC"),
        getWorkCountByStatus("Retender"),
        getWorkCountByStatus("Cancelled"),
    ]);

    const stats = [
        {
            title: "Total Visitors",
            value: visitor?.totalVisitors || 0,
            icon: FaUsers,
            change: "+10%",
            color: "text-blue-500",
        },
        {
            title: "NIT Count",
            value: nitCount,
            icon: FaFileAlt,
            change: "+5%",
            color: "text-green-500",
        },
        {
            title: "Technical Evaluations",
            value: techev,
            icon: FaChartLine,
            change: "+3%",
            color: "text-yellow-500",
        },
        {
            title: "Published Works",
            value: publishwork,
            icon: FaFileAlt,
            change: "+6%",
            color: "text-green-500",
        },
        {
            title: "AOC Works",
            value: aocwork,
            icon: FaChartLine,
            change: "+4%",
            color: "text-yellow-500",
        },
        {
            title: "Retender Works",
            value: retender,
            icon: FaFileAlt,
            change: "-1%",
            color: "text-red-500",
        },
        {
            title: "Cancelled Works",
            value: cancelwork,
            icon: FaTimes,
            change: "-2%",
            color: "text-red-500",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">


        </div>
    )
}

export default page