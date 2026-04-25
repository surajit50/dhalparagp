import { gpcode } from "@/constants/gpinfor";
import { formatDate } from "@/utils/utils";
import React from "react";
import { MBPrintMetadata } from "./types";

interface DetailsPageProps {
  workDetails: any;
  metadata?: MBPrintMetadata;
}

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <tr>
    <td
      style={{
        verticalAlign: "bottom",
        padding: "6px 6px 6px 0",
        width: "48%",
        fontWeight: "bold",
        color: "#1e293b",
        lineHeight: "1",
        fontSize: "8px",
      }}
    >
      {label}
    </td>
    <td
      style={{
        verticalAlign: "bottom",
        padding: "6px 4px",
        width: "2%",
        fontWeight: "bold",
        textAlign: "center",
        color: "#1e293b",
        fontSize: "11px",
      }}
    >
      :
    </td>
    <td
      style={{
        verticalAlign: "bottom",
        padding: "6px 0 6px 8px",
        width: "50%",
      }}
    >
      <div
        style={{
          width: "100%",
          borderBottom: "1.5px dotted #64748b",
          fontWeight: "bold",
          color: "#0f172a",
          minHeight: "1rem",
          paddingBottom: "1px",
          wordWrap: "break-word",
          lineHeight: "1",
          fontSize: "8px",
        }}
      >
        {value}
      </div>
    </td>
  </tr>
);

export const DetailsPage: React.FC<DetailsPageProps> = ({
  workDetails,
  metadata,
}) => {
  // Extract work details
  const w = workDetails?.ApprovedActionPlanDetails || {};
  const nit = workDetails?.nitDetails || {};
  const aoc = workDetails?.AwardofContract || {};
  const workOrderDetails = aoc?.workorderdetails?.[0] || {};
  const bidAgency = workOrderDetails?.Bidagency || {};
  const agency = bidAgency?.agencydetails || {};

  const workName = w.activityDescription || "";
  const workId = w.activityCode || "";
  const location = w.locationofAsset || "";
  const fund = w.schemeName || "";
  const estimatedCost = workDetails?.finalEstimateAmount || "";
  const tenderedAmount = bidAgency?.biddingAmount || "";
  const agreement = w.AggrementModel?.[0] || {};
  const aggrementno = agreement.aggrementno || "";
  const aggrementdate = agreement.aggrementdate
    ? formatDate(agreement.aggrementdate)
    : "";

  const workOrderNo = aoc?.workodermenonumber || "";
  const workOrderDate = aoc?.workordeermemodate
    ? formatDate(aoc.workordeermemodate)
    : "";

  const workOrderYear = aoc?.workordeermemodate
    ? new Date(aoc.workordeermemodate).getFullYear()
    : "";

  const nitYear = nit?.memoDate ? new Date(nit.memoDate).getFullYear() : "";
  const nitDate = nit?.memoDate ? formatDate(nit.memoDate) : "";

  return (
    <div className="page-container">
      <div
        className="page-border"
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ visibility: "hidden" }}>Page 3</div>{" "}
          {/* Spacing balance */}
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "900",
              letterSpacing: "1px",
              color: "#000",
              borderBottom: "2px solid #000",
              paddingBottom: "2px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Work Details
          </h2>
          <div
            style={{
              textAlign: "right",
              color: "#000",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          >
            Page 3
          </div>
        </div>

        {/* Form Body */}
        <div style={{ flex: 1 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <tbody>
              <DetailRow label="1. Name of Work" value={workName} />
              <DetailRow label="2. AAP with Work Id" value={workId} />
              <DetailRow label="3. Location" value={location} />
              <DetailRow label="4. Fund" value={fund} />
              <DetailRow
                label="5. Executive Agency"
                value="Prodhan No.- 3 Dhalpara Gram Panchayat"
              />
              <DetailRow label="6. Concerned Upasamity" value="" />
              <DetailRow
                label="7. Date of Concerned Upasamity Meeting"
                value=""
              />
              <DetailRow label="8. Date of General Body Meeting" value="" />
              <DetailRow
                label="9. Date of Estimate"
                value={
                  workDetails?.createdAt
                    ? formatDate(workDetails.createdAt)
                    : ""
                }
              />
              <DetailRow
                label="10. Date of Artho-O-Parikalpana Upasamity Meeting for approval of the Scheme"
                value=""
              />
              <DetailRow
                label="11. Estimated Amount"
                value={estimatedCost ? `Rs. ${estimatedCost}` : ""}
              />
              <DetailRow
                label="12. Tendered Amount"
                value={tenderedAmount ? `Rs. ${tenderedAmount}` : ""}
              />
              <DetailRow
                label="13. NIT No."
                value={
                  nit.memoNumber ? `${nit.memoNumber}/${gpcode}/${nitYear}` : ""
                }
              />
              <DetailRow
                label="14. NIT Memo No. with Date"
                value={
                  nit.memoNumber
                    ? `${nit.memoNumber}/${gpcode}/${nitYear} dt ${nitDate}`
                    : ""
                }
              />
              <DetailRow
                label="15. Date of Artho-O-Parikalpana Upasamity Meeting for Approval of comparative Statement"
                value=""
              />
              <DetailRow
                label="16. Lowest Offered Rate of Agency"
                value={tenderedAmount ? `Rs. ${tenderedAmount}` : ""}
              />
              <DetailRow label="17. Name of Agency" value={agency.name || ""} />
              <DetailRow label="18. Agency PAN" value={agency.pan || ""} />
              <DetailRow label="19. Agency GSTIN" value={agency.gst || ""} />
              <DetailRow
                label="20. Letter of Acceptance Memo No. with Date"
                value={aggrementno ? `${aggrementno} dt ${aggrementdate}` : ""}
              />
              <DetailRow label="21. Agreement Date" value={aggrementdate} />
              <DetailRow
                label="22. Work Order/Supply Order Memo No. & Date"
                value={
                  workOrderNo
                    ? `${workOrderNo}/${gpcode}/${workOrderYear} dt ${workOrderDate}`
                    : ""
                }
              />
              <DetailRow
                label="23. Date of commencement of Work"
                value={
                  workDetails?.workCommencementDate
                    ? formatDate(workDetails.workCommencementDate)
                    : ""
                }
              />
              <DetailRow label="24. Date of Casting" value="" />
              <DetailRow
                label="25. Date of Completion of Work"
                value={
                  workDetails?.completionDate
                    ? formatDate(workDetails.completionDate)
                    : ""
                }
              />
              {/* //dd/mm/yyyy */}
              <DetailRow
                label="26. Date of Final Measurement of Work"
                value={
                  metadata?.measuredDate
                    ? formatDate(new Date(metadata.measuredDate))
                    : formatDate(new Date())
                }
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
