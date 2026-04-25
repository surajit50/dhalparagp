import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { WarishApplicationProps, WarishDetailProps } from "@/types";
import { formatDate } from "@/utils/utils";
import LegalHeirrApplicationDetails from "./LegalHeirrApplicationDetails";

const LegalHeirCertificate = (certificateData: WarishApplicationProps) => {
  const warishDetailsMap = new Map<string, WarishDetailProps>();
  certificateData.warishDetails.forEach((detail) => {
    warishDetailsMap.set(detail.id, { ...detail, children: [] });
  });

  const rootWarishDetails: WarishDetailProps[] = [];
  warishDetailsMap.forEach((detail) => {
    if (detail.parentId) {
      const parent = warishDetailsMap.get(detail.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(detail);
      }
    } else {
      rootWarishDetails.push(detail);
    }
  });

  const body1 = `Certified that late ${certificateData.nameOfDeceased}, ${
    certificateData.gender === "male"
      ? "son of"
      : certificateData.gender === "female" &&
        certificateData.maritialStatus === "unmarried"
      ? "daughter of"
      : "wife of"
  } ${
    certificateData.gender === "female" &&
    certificateData.maritialStatus === "married"
      ? certificateData.spouseName
      : certificateData.fatherName
  } residing at ${certificateData.villageName} Village, ${
    certificateData.postOffice
  } Post Office, Hili Police Station of Dakshin Dinajpur District, West Bengal State, expired on ${
    certificateData.dateOfDeath ? formatDate(certificateData.dateOfDeath) : ""
  }, leaving behind the following persons as his/her legal heirs`;
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Legal Heir Certificate
        </CardTitle>
        <CardDescription className="text-center">
          No 3 Dhalpara Gram Panchayat
          <br />
          Hili Development Block, Dakshin Dinajpur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <p>
            <strong>Certificate No:</strong> {certificateData.warishRefNo}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {certificateData.warishRefDate
              ? formatDate(certificateData.warishRefDate)
              : "NA"}
          </p>
        </div>
        <p>{body1}</p>
        <p>All the particulars regarding them are provided below:</p>
        <LegalHeirrApplicationDetails
          application={certificateData}
          rootWarishDetails={rootWarishDetails}
        />
      </CardContent>
    </Card>
  );
};

export default LegalHeirCertificate;
