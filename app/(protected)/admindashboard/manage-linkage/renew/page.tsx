 import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { db } from "@/lib/db";
 import { createRenewal } from "@/action/linkage-actions";
 
 export default async function RenewPage() {
   const certs = await db.linkageCertificate.findMany({
     orderBy: { createdAt: "desc" },
   });
 
   return (
     <div className="p-6 space-y-4">
       <Card>
         <CardHeader>
           <CardTitle>Renewal Process</CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
           {certs.length === 0 && <div>No certificates found</div>}
           {certs.map((cert) => (
             <form
               key={cert.id}
               className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded p-3 items-end"
               action={async (formData) => {
                 "use server";
                 const renewalReason = String(formData.get("renewalReason") || "");
                 const newExpiryDateStr = String(formData.get("newExpiryDate") || "");
                 const newExpiryDate = newExpiryDateStr ? new Date(newExpiryDateStr) : undefined;
                 await createRenewal({
                   certificateId: cert.id,
                   renewalReason,
                   newExpiryDate,
                 });
               }}
             >
               <div className="md:col-span-1">
                 <div className="font-medium">{cert.certificateNo}</div>
                 <div className="text-sm text-muted-foreground">
                   {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ""}
                 </div>
               </div>
               <div>
                 <Label htmlFor={`renewalReason-${cert.id}`}>Renewal Reason</Label>
                 <Input id={`renewalReason-${cert.id}`} name="renewalReason" />
               </div>
               <div>
                 <Label htmlFor={`newExpiryDate-${cert.id}`}>New Expiry Date</Label>
                 <Input id={`newExpiryDate-${cert.id}`} name="newExpiryDate" type="date" />
               </div>
               <div className="md:col-span-4">
                 <Button type="submit">Create Renewal</Button>
               </div>
             </form>
           ))}
         </CardContent>
       </Card>
     </div>
   );
 }
 
