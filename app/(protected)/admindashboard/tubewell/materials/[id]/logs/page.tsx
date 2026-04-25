import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, History, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StockLogsPageProps {
    params: Promise<{ id: string }>;
}

export default async function StockLogsPage({ params }: StockLogsPageProps) {
    const { id } = await params;
    
    const material = await db.tubewellMaterial.findUnique({
        where: { id },
        include: {
            stockLogs: {
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!material) {
        notFound();
    }

    const totalIn = material.stockLogs
        .filter(log => log.transactionType === "IN")
        .reduce((sum, log) => sum + log.quantity, 0);

    const totalOut = material.stockLogs
        .filter(log => log.transactionType === "OUT")
        .reduce((sum, log) => sum + log.quantity, 0);

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admindashboard/tubewell/materials">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Stock History</h1>
                        <p className="text-sm text-muted-foreground">Transaction logs for {material.name}.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{material.stock} {material.unit}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock In</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">+{totalIn} {material.unit}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Out</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">-{totalOut} {material.unit}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            Transaction Logs
                        </CardTitle>
                        <CardDescription>Detailed record of all stock additions and issues.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Rate (₹)</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {material.stockLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No stock transactions found for this material.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    material.stockLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm">
                                                {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm")}
                                            </TableCell>
                                            <TableCell>
                                                {log.transactionType === "IN" ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                                                        <TrendingUp className="h-3 w-3" /> IN
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100 gap-1">
                                                        <TrendingDown className="h-3 w-3" /> OUT
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${log.transactionType === "IN" ? "text-green-600" : "text-red-600"}`}>
                                                {log.transactionType === "IN" ? "+" : "-"}{log.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {log.rate ? `₹${log.rate.toFixed(2)}` : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {log.remarks || "No remarks"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
