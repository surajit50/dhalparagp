import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BidAgency {
  id: string;
  biddingAmount: number | null;
  agencydetails: {
    name: string;
  };
}

export function MemoInformation({
  selectedBidderId,
  acceptbi,
}: {
  selectedBidderId: string | null;
  acceptbi: BidAgency[];
}) {
  const selectedBidder = acceptbi.find((bid) => bid.id === selectedBidderId);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-700">Memo Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">Selected Bidder</h4>
          <Badge variant={selectedBidder ? "default" : "secondary"}>
            {selectedBidder ? "Confirmed" : "Not Selected"}
          </Badge>
        </div>
        
        {selectedBidder ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Bidder Name
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-gray-900">
                  {selectedBidder.agencydetails.name}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Bid Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-gray-900">
                  {selectedBidder.biddingAmount?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) || "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-yellow-700">
                No bidder selected. Please select a bidder and submit the form.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="memono" className="text-gray-700">
            Workorder Memo No
          </Label>
          <Input
            id="memono"
            name="memono"
            placeholder="Enter memo number"
            required
            className="focus-visible:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Official memo reference number
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="memodate" className="text-gray-700">
            Memo Date
          </Label>
          <Input 
            id="memodate" 
            name="memodate" 
            type="date" 
            required
            className="focus-visible:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Date when memo was issued
          </p>
        </div>
      </div>
    </div>
  );
}
