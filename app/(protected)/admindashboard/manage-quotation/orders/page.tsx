"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Truck, CheckCircle, Clock, Plus, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getOrders } from "@/action/procurement-order"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Order {
  id: string
  orderNo: string
  orderDate: Date | string
  orderType: string
  amount: number
  status: string
  quotation: { workName: string }
  agency: { name: string }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      setOrders(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage Work Orders, Supply Orders, and Service Orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <div className={`h-2 ${
              order.orderType === 'WORK' ? 'bg-blue-500' : 
              order.orderType === 'SUPPLY' ? 'bg-green-500' : 'bg-purple-500'
            }`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline">{order.orderType} ORDER</Badge>
                <span className="text-xs text-muted-foreground">{format(new Date(order.orderDate), "dd MMM yyyy")}</span>
              </div>
              <CardTitle className="text-lg mt-2">{order.orderNo}</CardTitle>
              <CardDescription className="line-clamp-2">{order.quotation.workName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.agency.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <IndianRupee className="h-4 w-4" />
                <span>₹{order.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center gap-1">
                  {order.status === 'COMPLETED' ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                      <CheckCircle className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                      <Clock className="h-3 w-3 mr-1" /> In Progress
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="h-8">
                  <FileText className="h-4 w-4 mr-2" /> Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p>No orders found. Generate orders from Comparative Statements.</p>
          </div>
        )}
      </div>
    </div>
  )
}
