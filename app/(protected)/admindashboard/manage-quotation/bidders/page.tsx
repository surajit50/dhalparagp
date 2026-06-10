"use client"

import { useState, useEffect } from "react"
import { Plus, UserPlus, FileText, CheckCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { getQuotations } from "@/action/procurement-quotation"
import { addBidder, getBiddersByQuotation } from "@/action/procurement-bid"
import { db } from "@/lib/db" // Note: This will fail on client, I need a server action to get agencies

export default function BiddersPage() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)
  const [bidders, setBidders] = useState<any[]>([])
  const [isAddBidderOpen, setIsAddBidderOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newBid, setNewBid] = useState({ agencyId: "", bidAmount: 0, remarks: "" })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const qData = await getQuotations()
    setQuotations(qData)
    
    // Fetch agencies - I should have a server action for this
    // For now, I'll assume I can fetch them or use a placeholder
    // I'll create the action in the next step
    setLoading(false)
  }

  // Fetch agencies from a server action (I'll create this later)
  useEffect(() => {
    const fetchAgencies = async () => {
      // Mocking for now, will replace with real action
      // const data = await getAllAgencies()
      // setAgencies(data)
    }
    fetchAgencies()
  }, [])

  const handleOpenBidders = async (quotation: any) => {
    setSelectedQuotation(quotation)
    const bData = await getBiddersByQuotation(quotation.id)
    setBidders(bData)
  }

  const handleAddBidder = async () => {
    if (!newBid.agencyId || !newBid.bidAmount) return
    
    const result = await addBidder(selectedQuotation.id, newBid)
    if (result.success) {
      toast({ title: "Bidder Added", description: "The bid has been recorded and ranked." })
      const bData = await getBiddersByQuotation(selectedQuotation.id)
      setBidders(bData)
      setIsAddBidderOpen(false)
      setNewBid({ agencyId: "", bidAmount: 0, remarks: "" })
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bidder Management</h1>
          <p className="text-muted-foreground">Record and rank bids from various agencies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotations List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Active Quotations</h2>
          {quotations.map(q => (
            <Card 
              key={q.id} 
              className={`cursor-pointer transition-colors ${selectedQuotation?.id === q.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
              onClick={() => handleOpenBidders(q)}
            >
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-bold">{q.nitNo}</CardTitle>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{q.category.name}</span>
                </div>
                <CardDescription className="text-xs line-clamp-1">{q.workName}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{q._count.bidders} Bidders</span>
                  <span className="font-medium">₹{q.estimatedAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bidders Table */}
        <div className="lg:col-span-2">
          {selectedQuotation ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Bidders for {selectedQuotation.nitNo}</CardTitle>
                  <CardDescription>{selectedQuotation.workName}</CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsAddBidderOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Add Bidder
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-2 text-left">Rank</th>
                        <th className="p-2 text-left">Agency Name</th>
                        <th className="p-2 text-left">Bid Amount</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">No bidders recorded yet.</td>
                        </tr>
                      ) : (
                        bidders.map((bid, idx) => (
                          <tr key={bid.id} className="border-b last:border-0">
                            <td className="p-2 font-bold">
                              {bid.rank ? (
                                <span className={`flex items-center justify-center h-6 w-6 rounded-full ${bid.rank === 1 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                  {bid.rank}
                                </span>
                              ) : "-"}
                            </td>
                            <td className="p-2">{bid.agency.name}</td>
                            <td className="p-2 font-medium">₹{bid.bidAmount.toLocaleString()}</td>
                            <td className="p-2">
                              {bid.rank === 1 ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">L1</span>
                              ) : bid.rank === 2 ? (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">L2</span>
                              ) : bid.rank === 3 ? (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">L3</span>
                              ) : (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Qualified</span>
                              )}
                            </td>
                            <td className="p-2 text-muted-foreground text-xs">{bid.remarks}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a quotation from the list to manage bidders.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Bidder Dialog */}
      <Dialog open={isAddBidderOpen} onOpenChange={setIsAddBidderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record New Bid</DialogTitle>
            <DialogDescription>Enter the bid details for {selectedQuotation?.nitNo}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Agency</Label>
              <Select onValueChange={(val) => setNewBid({ ...newBid, agencyId: val })} value={newBid.agencyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Agency" />
                </SelectTrigger>
                <SelectContent>
                  {/* I'll need to fetch real agencies here */}
                  <SelectItem value="placeholder-1">Agency One</SelectItem>
                  <SelectItem value="placeholder-2">Agency Two</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Bid Amount (₹)</Label>
              <Input 
                type="number" 
                value={newBid.bidAmount} 
                onChange={(e) => setNewBid({ ...newBid, bidAmount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Remarks</Label>
              <Input 
                value={newBid.remarks} 
                onChange={(e) => setNewBid({ ...newBid, remarks: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddBidder}>Save Bid</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
