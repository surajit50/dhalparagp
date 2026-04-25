import { Metadata } from "next";
import VerifyDeductionClientPage from "./ClientPage";


export const metadata: Metadata = {
  title: "Verify Deduction | Admin Dashboard",
  description: "Review and verify bill deductions before payment processing",
};

export default function VerifyDeductionPage() {
  return <VerifyDeductionClientPage />;
}
