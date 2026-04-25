
import { notFound } from "next/navigation";
import NitEditForm from "@/components/form/nit-edit-form";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EditNitPageProps {
  params: Promise<{ id: string }>;
}

async function getNitById(id: string) {
  const nit = await db.nitDetails.findUnique({
    where: { id },
  });
  return nit;
}

export default async function EditNitPage({ params }: EditNitPageProps) {
  const { id } = await params;
  const nit = await getNitById(id);
  if (!nit) return notFound();

  // Map DB fields to NitEditForm expected props
  const initialData = {
    id: String(nit.id),
    tendermemonumber: String(nit.memoNumber || ""),
    // Pass dates as Date objects
    tendermemodate: nit.memoDate ? new Date(nit.memoDate) : new Date(),
    tender_pulishing_Date: nit.publishingDate ? new Date(nit.publishingDate) : new Date(),
    tender_document_Download_from: nit.documentDownloadFrom ? new Date(nit.documentDownloadFrom) : new Date(),
    tender_start_time_from: nit.startTime ? new Date(nit.startTime) : new Date(),
    tender_end_date_time_from: nit.endTime ? new Date(nit.endTime) : new Date(),
    tender_techinical_bid_opening_date: nit.technicalBidOpeningDate ? new Date(nit.technicalBidOpeningDate) : new Date(),
    tender_financial_bid_opening_date: nit.financialBidOpeningDate ? new Date(nit.financialBidOpeningDate) : undefined,
    tender_place_opening_bids: String(nit.placeOfOpeningBids || ""),
    tender_vilidity_bids: String(nit.bidValidity || ""),
    supplynit: Boolean(nit.isSupply),
    isPublished: Boolean(nit.isPublished),
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="mb-4">
        <Link href="/admindashboard/manage-tender/edit">
          <Button variant="outline">Back to NIT List</Button>
        </Link>
      </div>
      <NitEditForm initialData={initialData} />
    </div>
  );
}
