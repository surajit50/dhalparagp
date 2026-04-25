import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, FileText, MapPin, User, Phone, AlertCircle, Calendar, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RequestDetailsPageProps {
    params: Promise<{ id: string }>;
}

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "PENDING": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
        case "APPROVED": return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Approved (Ready for WO)</Badge>;
        case "WORK_ORDER_ISSUED": return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Work Order Issued</Badge>;
        case "COMPLETED": return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
        case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
    const { id } = await params;
    
    const request = await db.tubewellRepairRequest.findUnique({
        where: { id },
        include: {
            workOrders: {
                include: {
                    mistri: true,
                    materials: { include: { material: true } }
                }
            }
        }
    });

    if (!request) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/admindashboard/tubewell/requests">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Repair Request Details</h1>
                            <p className="text-sm text-muted-foreground">ID: {request.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={request.status} />
                        {request.status === "APPROVED" && (
                            <Button asChild size="sm" className="gap-2">
                                <Link href={`/admindashboard/tubewell/work-orders/create?reqId=${request.id}`}>
                                    <Settings2 className="h-4 w-4" /> Issue Work Order
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                Problem Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-muted/50 p-4 rounded-lg border italic">
                            {request.problemDetails || "No detailed description provided."}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Citizen Name</p>
                                            <p className="text-sm text-muted-foreground">{request.citizenName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Contact Number</p>
                                            <p className="text-sm text-muted-foreground">{request.mobileNumber || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Location / Address</p>
                                            <p className="text-sm text-muted-foreground">{request.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Reported Date</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(request.createdAt), "PPP")}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Related Work Orders</p>
                                <p className="text-2xl font-bold">{request.workOrders.length}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Last Updated</p>
                                <p className="text-sm">{format(new Date(request.updatedAt), "PPP")}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {request.workOrders.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Associated Work Orders
                        </h2>
                        {request.workOrders.map((order) => (
                            <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                                            <CardDescription>Issued to: <span className="font-medium text-foreground">{order.mistri.name}</span></CardDescription>
                                        </div>
                                        <Badge>{order.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Issue Date</p>
                                            <p className="font-medium">{format(new Date(order.issueDate), "dd MMM yyyy")}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Labor Cost</p>
                                            <p className="font-medium">₹{order.mustiAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Materials Used</p>
                                            <p className="font-medium">{order.materials.length} types</p>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Button variant="link" size="sm" asChild className="h-auto p-0">
                                                <Link href={`/admindashboard/tubewell/work-orders/${order.id}/print`}>View Full Order →</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
