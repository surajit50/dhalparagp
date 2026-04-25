 import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { db } from "@/lib/db";
 import { createDispute } from "@/action/linkage-actions";
 
 export default async function DisputesPage() {
   const certs = await db.linkageCertificate.findMany({
     orderBy: { createdAt: "desc" },
   });
 
   return (
     <div className="p-6 space-y-4">
       <Card>
         <CardHeader>
           <CardTitle>Dispute Resolution</CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
           {certs.length === 0 && <div>No certificates found</div>}
           {certs.map((cert) => (
             <form
               key={cert.id}
               className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded p-3 items-end"
               action={async (formData) => {
                 "use server";
                 const raisedByName = String(formData.get("raisedByName") || "");
                 const raisedByPhone = String(formData.get("raisedByPhone") || "");
                 const reason = String(formData.get("reason") || "");
                 await createDispute({
                   certificateId: cert.id,
                   raisedByName,
                   raisedByPhone,
                   reason,
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
                 <Label htmlFor={`raisedByName-${cert.id}`}>Raised By</Label>
                 <Input id={`raisedByName-${cert.id}`} name="raisedByName" />
               </div>
               <div>
                 <Label htmlFor={`raisedByPhone-${cert.id}`}>Phone</Label>
                 <Input id={`raisedByPhone-${cert.id}`} name="raisedByPhone" />
               </div>
               <div>
                 <Label htmlFor={`reason-${cert.id}`}>Reason</Label>
                 <Input id={`reason-${cert.id}`} name="reason" />
               </div>
               <div className="md:col-span-4">
                 <Button type="submit">Create Dispute</Button>
               </div>
             </form>
           ))}
         </CardContent>
       </Card>
     </div>
   );
 }
 
