"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useReactToPrint, UseReactToPrintOptions } from "react-to-print";
import React from "react";
import { gpname } from "@/constants/gpinfor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ClipboardList, Eye } from "lucide-react";

function NocCertificate({
  values,
}: {
  values: {
    gpName: string;
    postOffice: string;
    policeStation: string;
    district: string;
    refNo: string;
    date: string;
    pujaName: string;
    location: string;
    organizer: string;
    startDate: string;
    endDate: string;
  };
}) {
  return (
    <div className="max-w-3xl mx-auto bg-white text-black p-8 border print:border-0" style={{ fontFamily: "Times New Roman, serif" }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold">{values.gpName}</h1>
        <p className="text-sm">Office of the Prodhan</p>
        <p className="text-sm">P.O.: {values.postOffice} • P.S.: {values.policeStation} • Dist.: {values.district}, West Bengal</p>
      </div>
      <div className="my-4 border-t" />
      <h2 className="text-xl font-semibold text-center mb-4">No Objection Certificate (NOC)</h2>
      <div className="flex justify-between mb-4 text-sm">
        <p>
          <span className="font-semibold">Ref. No:</span> {values.refNo || "_______"} /GP
        </p>
        <p>
          <span className="font-semibold">Date:</span> {values.date || "__ / __ / 20__"}
        </p>
      </div>
      <p className="mb-3 text-justify">
        This is to certify that the Gram Panchayat of <strong>{values.gpName}</strong>, P.S. <strong>{values.policeStation}</strong>, P.O. <strong>{values.postOffice}</strong>, District <strong>{values.district}</strong>, has <strong>no objection</strong> to the organization of <strong>{values.pujaName}</strong> at <strong>{values.location}</strong>.
      </p>
      <p className="mb-3 text-justify">
        The said Puja / Festival will be organized by <strong>{values.organizer}</strong> from <strong>{values.startDate}</strong> to <strong>{values.endDate}</strong>.
      </p>
      <p className="font-semibold mb-2">This NOC is granted on the following conditions:</p>
      <ol className="list-decimal pl-5 space-y-1 text-justify">
        <li>The organizers must ensure peaceful conduct of the Puja without causing public inconvenience.</li>
        <li>Proper cleanliness and hygiene should be maintained at the venue.</li>
        <li>Loudspeakers, if used, must follow the permissible time and volume limits as per law.</li>
        <li>No unlawful or objectionable activities are to be carried out.</li>
        <li>Organizers shall remain fully responsible for maintaining law & order and safety during the Puja.</li>
      </ol>
      <p className="mt-4 text-justify">This certificate is issued on request of the organizers for official purpose.</p>
      <div className="my-6 border-t" />
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="text-center">
          <p className="font-medium">Seal of Gram Panchayat</p>
          <div className="mt-8 h-20 border border-dashed" />
        </div>
        <div className="text-center">
          <p>(Signature of Prodhan)</p>
          <p className="font-semibold">Prodhan</p>
          <p>{values.gpName}</p>
        </div>
      </div>
    </div>
  );
}

export default function ClientPage() {
  const [values, setValues] = useState({
    gpName: gpname || "[Name of Gram Panchayat]",
    postOffice: "",
    policeStation: "",
    district: "",
    refNo: "",
    date: "",
    pujaName: "",
    location: "",
    organizer: "",
    startDate: "",
    endDate: "",
  });

  const certificateRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => certificateRef.current,
    documentTitle: `Puja_NOC_${values.pujaName || "certificate"}`,
  } as UseReactToPrintOptions);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NOC for Puja/Festival</h1>
          <p className="text-muted-foreground">Fill details, preview, and print the certificate</p>
        </div>
        <Button onClick={() => handlePrint && handlePrint()}>Print</Button>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Form
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Organizer & Event Details</CardTitle>
              <CardDescription>Provide information to generate the certificate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Gram Panchayat Name</Label>
                  <Input value={values.gpName} onChange={(e) => setValues({ ...values, gpName: e.target.value })} />
                </div>
                <div>
                  <Label>Ref. No</Label>
                  <Input value={values.refNo} onChange={(e) => setValues({ ...values, refNo: e.target.value })} />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={values.date} onChange={(e) => setValues({ ...values, date: e.target.value })} />
                </div>
                <div>
                  <Label>Police Station</Label>
                  <Input value={values.policeStation} onChange={(e) => setValues({ ...values, policeStation: e.target.value })} />
                </div>
                <div>
                  <Label>Post Office</Label>
                  <Input value={values.postOffice} onChange={(e) => setValues({ ...values, postOffice: e.target.value })} />
                </div>
                <div>
                  <Label>District</Label>
                  <Input value={values.district} onChange={(e) => setValues({ ...values, district: e.target.value })} />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Name of Puja/Festival</Label>
                  <Input value={values.pujaName} onChange={(e) => setValues({ ...values, pujaName: e.target.value })} placeholder="e.g., Durga Puja" />
                </div>
                <div className="md:col-span-2">
                  <Label>Exact Location/Address</Label>
                  <Textarea value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} rows={2} />
                </div>
                <div className="md:col-span-2">
                  <Label>Organizer (Committee/Club)</Label>
                  <Input value={values.organizer} onChange={(e) => setValues({ ...values, organizer: e.target.value })} />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={values.startDate} onChange={(e) => setValues({ ...values, startDate: e.target.value })} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={values.endDate} onChange={(e) => setValues({ ...values, endDate: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Preview</CardTitle>
              <CardDescription>Review before printing</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={certificateRef}>
                <NocCertificate values={values} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
