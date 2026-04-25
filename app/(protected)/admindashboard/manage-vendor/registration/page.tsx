import VendorDetailsForm from "@/components/form/vendor-details-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Vendor",
  description: "Add a new vendor to the system",
};

export default function VendorAddPage() {
  return (
    <div className="container mx-auto py-10">
      
      <VendorDetailsForm />
    </div>
  );
}
