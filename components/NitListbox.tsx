import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDateTime } from "@/utils/utils";
import { DateOverWithDetails } from "@/types";
import { Button } from "./ui/button";
import Link from "next/link";
import { gpcode } from "@/constants/gpinfor";
interface NitListboxProps {
  nitDetails: DateOverWithDetails;
}

const NitListbox = ({ nitDetails }: NitListboxProps) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="flex justify-between items-center py-4 px-6 bg-primary/10 hover:bg-primary/20 text-primary rounded-t-lg transition-colors">
          <div className="font-semibold text-lg">
            {nitDetails.memoNumber}/${gpcode}/2024
          </div>
          <div className="font-medium text-sm">
            {nitDetails.memoDate
              ? formatDateTime(nitDetails.memoDate).dateOnly
              : ""}
          </div>
        </AccordionTrigger>
        <AccordionContent className="bg-white p-6 rounded-b-lg space-y-4">
          {nitDetails.WorksDetail.map((worklist, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg shadow-sm transition-colors hover:bg-gray-100"
            >
              <div className="text-gray-700 text-sm sm:text-base mb-2 sm:mb-0 flex-grow">
                {worklist.ApprovedActionPlanDetails.activityDescription}
              </div>
              <Link
                href={`/admindashboard/manage-tender/addbidderdetails/${worklist.id}`}
                className="w-full sm:w-auto"
              >
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  Add Bidder Details
                </Button>
              </Link>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default NitListbox;
