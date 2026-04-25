"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, Eye, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkBillDeduction {
  id: string;
  billType: string;
  grossBillAmount: number;
  lessIncomeTaxAmount: number;
  lessIncomeTaxPercentage: number;
  lessGstTdsAmount: number;
  lessGstTdsPercentage: number;
  lessCgstAmount: number;
  lessSgstAmount: number;
  lessLabourWelfareCessAmount: number;
  lessLabourWelfareCessPercentage: number;
  lessSecurityDepositAmount: number;
  lessSecurityDepositPercentage: number;
  totalDeduction: number;
  netPayableAmount: number;
  isVerified: boolean;
  isFinalBill: boolean;
  createdAt: string;
  billPaymentDate?: string;
  eGramVoucher?: string;
  eGramVoucherDate?: string;
  gpmsVoucherNumber?: string;
  gpmsVoucherDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  workBillAbstract: {
    billNumber: string;
    billType: string;
    period: string;
    worksDetail: {
      workslno: number;
      ApprovedActionPlanDetails: {
        activityCode: string;
        activityDescription: string;
        schemeName: string;
      };
      nitDetails: {
        memoNumber: number;
        memoDate: string;
      };
      AwardofContract?: {
        workodermenonumber: string;
        workordeermemodate: string;
        workorderdetails: Array<{
          Bidagency?: {
            agencydetails?: {
              name: string;
              contactDetails: string;
            };
          };
        }>;
      };
    };
  };
  user: {
    name: string;
    email: string;
  };
}

export default function VerifyDeductionClientPage() {
  const [unverifiedDeductions, setUnverifiedDeductions] = useState<WorkBillDeduction[]>([]);
  const [verifiedDeductions, setVerifiedDeductions] = useState<WorkBillDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedDeduction, setSelectedDeduction] = useState<WorkBillDeduction | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [createPaymentDetails, setCreatePaymentDetails] = useState(false);

  const [voucherData, setVoucherData] = useState({
    billPaymentDate: "",
    eGramVoucher: "",
    eGramVoucherDate: "",
    gpmsVoucherNumber: "",
    gpmsVoucherDate: "",
    mbrefno: "",
  });

  useEffect(() => {
    fetchDeductions();
  }, []);

  const fetchDeductions = async () => {
    setLoading(true);
    try {
      // Fetch unverified deductions
      const unverifiedRes = await fetch("/api/verify-deduction?verified=false");
      const unverifiedData = await unverifiedRes.json();
      setUnverifiedDeductions(Array.isArray(unverifiedData) ? unverifiedData : []);

      // Fetch verified deductions
      const verifiedRes = await fetch("/api/verify-deduction?verified=true");
      const verifiedData = await verifiedRes.json();
      setVerifiedDeductions(Array.isArray(verifiedData) ? verifiedData : []);
    } catch (error) {
      console.error("Error fetching deductions:", error);
      toast.error("Failed to fetch deductions");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (deduction: WorkBillDeduction) => {
    setSelectedDeduction(deduction);
    setVoucherData({
      billPaymentDate: deduction.billPaymentDate || "",
      eGramVoucher: deduction.eGramVoucher || "",
      eGramVoucherDate: deduction.eGramVoucherDate || "",
      gpmsVoucherNumber: deduction.gpmsVoucherNumber || "",
      gpmsVoucherDate: deduction.gpmsVoucherDate || "",
      mbrefno: deduction.workBillAbstract.billNumber || "",
    });
    setCreatePaymentDetails(false);
    setShowDialog(true);
  };

  const handleVerify = async () => {
    if (!selectedDeduction) return;

    setVerifying(true);
    try {
      const response = await fetch("/api/verify-deduction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deductionId: selectedDeduction.id,
          ...voucherData,
          createPaymentDetails,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Deduction verified successfully");
        setShowDialog(false);
        fetchDeductions(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to verify deduction");
      }
    } catch (error) {
      console.error("Error verifying deduction:", error);
      toast.error("Error verifying deduction");
    } finally {
      setVerifying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const DeductionTable = ({ deductions, showActions = true }: { deductions: WorkBillDeduction[]; showActions?: boolean }) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Work Details</TableHead>
            <TableHead>Bill Number</TableHead>
            <TableHead>Bill Type</TableHead>
            <TableHead className="text-right">Gross Amount</TableHead>
            <TableHead className="text-right">Total Deduction</TableHead>
            <TableHead className="text-right">Net Payable</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created Date</TableHead>
            {showActions && <TableHead className="text-center">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {deductions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 9 : 8} className="text-center text-muted-foreground py-8">
                No deductions found
              </TableCell>
            </TableRow>
          ) : (
            deductions.map((deduction) => (
              <TableRow key={deduction.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {deduction.workBillAbstract.worksDetail.ApprovedActionPlanDetails.activityDescription.substring(0, 40)}...
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Code: {deduction.workBillAbstract.worksDetail.ApprovedActionPlanDetails.activityCode}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Work SL No: {deduction.workBillAbstract.worksDetail.workslno}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {deduction.workBillAbstract.billNumber}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{deduction.billType}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(deduction.grossBillAmount)}
                </TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {formatCurrency(deduction.totalDeduction)}
                </TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  {formatCurrency(deduction.netPayableAmount)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">{deduction.user.name}</span>
                    <span className="text-xs text-muted-foreground">{deduction.user.email}</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(deduction.createdAt)}</TableCell>
                {showActions && (
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      onClick={() => handleVerifyClick(deduction)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Verify
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Verify Deduction
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Review and verify bill deductions before payment processing
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDeductions}
            disabled={loading}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="unverified" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="unverified" className="gap-2">
              <XCircle className="h-4 w-4" />
              Unverified ({unverifiedDeductions.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Verified ({verifiedDeductions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unverified">
            <Card>
              <CardHeader>
                <CardTitle>Unverified Deductions</CardTitle>
                <CardDescription>
                  Review and verify deductions that are pending approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <DeductionTable deductions={unverifiedDeductions} showActions={true} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified">
            <Card>
              <CardHeader>
                <CardTitle>Verified Deductions</CardTitle>
                <CardDescription>
                  Previously verified deductions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <DeductionTable deductions={verifiedDeductions} showActions={false} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Deduction</DialogTitle>
            <DialogDescription>
              Review deduction details and add voucher information
            </DialogDescription>
          </DialogHeader>

          {selectedDeduction && (
            <div className="space-y-4">
              {/* Work Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Work Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Work Name</Label>
                    <p className="text-sm font-medium">
                      {selectedDeduction.workBillAbstract.worksDetail.ApprovedActionPlanDetails.activityDescription}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Activity Code</Label>
                    <p className="text-sm font-medium">
                      {selectedDeduction.workBillAbstract.worksDetail.ApprovedActionPlanDetails.activityCode}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Scheme</Label>
                    <p className="text-sm font-medium">
                      {selectedDeduction.workBillAbstract.worksDetail.ApprovedActionPlanDetails.schemeName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Agency Name</Label>
                    <p className="text-sm font-medium">
                      {selectedDeduction.workBillAbstract.worksDetail.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails?.name || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Deduction Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deduction Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-semibold">Gross Bill Amount</span>
                      <span className="font-bold text-lg">{formatCurrency(selectedDeduction.grossBillAmount)}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Income Tax ({selectedDeduction.lessIncomeTaxPercentage.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-red-600">
                          - {formatCurrency(selectedDeduction.lessIncomeTaxAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          GST TDS ({selectedDeduction.lessGstTdsPercentage.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-red-600">
                          - {formatCurrency(selectedDeduction.lessGstTdsAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pl-4">
                        <span className="text-xs text-muted-foreground">CGST</span>
                        <span className="text-xs text-red-600">
                          - {formatCurrency(selectedDeduction.lessCgstAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pl-4">
                        <span className="text-xs text-muted-foreground">SGST</span>
                        <span className="text-xs text-red-600">
                          - {formatCurrency(selectedDeduction.lessSgstAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Labour Welfare Cess ({selectedDeduction.lessLabourWelfareCessPercentage.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-red-600">
                          - {formatCurrency(selectedDeduction.lessLabourWelfareCessAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Security Deposit ({selectedDeduction.lessSecurityDepositPercentage.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-red-600">
                          - {formatCurrency(selectedDeduction.lessSecurityDepositAmount)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <span className="font-semibold">Total Deduction</span>
                      <span className="font-bold text-lg text-red-600">
                        - {formatCurrency(selectedDeduction.totalDeduction)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <span className="font-semibold">Net Payable Amount</span>
                      <span className="font-bold text-xl text-green-600">
                        {formatCurrency(selectedDeduction.netPayableAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voucher Details Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Voucher Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billPaymentDate">Bill Payment Date</Label>
                      <Input
                        id="billPaymentDate"
                        type="date"
                        value={voucherData.billPaymentDate}
                        onChange={(e) =>
                          setVoucherData({ ...voucherData, billPaymentDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mbrefno">MB Reference Number</Label>
                      <Input
                        id="mbrefno"
                        value={voucherData.mbrefno}
                        onChange={(e) =>
                          setVoucherData({ ...voucherData, mbrefno: e.target.value })
                        }
                        placeholder="Enter MB reference number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eGramVoucher">eGram Voucher Number</Label>
                      <Input
                        id="eGramVoucher"
                        value={voucherData.eGramVoucher}
                        onChange={(e) =>
                          setVoucherData({ ...voucherData, eGramVoucher: e.target.value })
                        }
                        placeholder="Enter eGram voucher number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eGramVoucherDate">eGram Voucher Date</Label>
                      <Input
                        id="eGramVoucherDate"
                        type="date"
                        value={voucherData.eGramVoucherDate}
                        onChange={(e) =>
                          setVoucherData({ ...voucherData, eGramVoucherDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpmsVoucherNumber">GPMS Voucher Number</Label>
                      <Input
                        id="gpmsVoucherNumber"
                        value={voucherData.gpmsVoucherNumber}
                        onChange={(e) =>
                          setVoucherData({ ...voucherData, gpmsVoucherNumber: e.target.value })
                        }
                        placeholder="Enter GPMS voucher number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpmsVoucherDate">GPMS Voucher Date</Label>
                      <Input
                        id="gpmsVoucherDate"
                        type="date"
                        value={voucherData.gpmsVoucherDate}
                        onChange={(e) =>
                          setVoucherData({ ...voucherData, gpmsVoucherDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-4 border-t">
                    <Checkbox
                      id="createPaymentDetails"
                      checked={createPaymentDetails}
                      onCheckedChange={(checked) => setCreatePaymentDetails(checked === true)}
                    />
                    <Label
                      htmlFor="createPaymentDetails"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Also create PaymentDetails entry after verification
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={verifying}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={verifying} className="gap-2">
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Deduction
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
