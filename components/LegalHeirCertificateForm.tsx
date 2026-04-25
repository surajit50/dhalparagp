"use client";

import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/utils/utils";
import { WarishApplicationProps, WarishDetailProps } from "@/types";
import { gpaddress, gpcode, gpname } from "@/constants/gpinfor";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getSerialNumber = (depth: number, index: number): string => {
  if (depth === 0) return `${index + 1}`;
  if (depth === 1) return String.fromCharCode(65 + index);
  return String.fromCharCode(97 + index);
};

const renderWarishDetails = (
  details: WarishDetailProps[],
  depth = 0,
  parentIndex = "",
): React.ReactNode => {
  return details.map((detail, index) => {
    const currentIndex = parentIndex
      ? `${parentIndex}.${getSerialNumber(depth, index)}`
      : getSerialNumber(depth, index);

    return (
      <React.Fragment key={detail.id}>
        <TableRow className={depth % 2 === 0 ? "bg-gray-50" : "bg-white"}>
          <TableCell className="font-medium text-right w-[10%]">
            {currentIndex}
          </TableCell>
          <TableCell className="font-medium">{detail.name}</TableCell>
          <TableCell>{detail.gender}</TableCell>
          <TableCell>{detail.relation}</TableCell>
          <TableCell>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                detail.livingStatus === "alive"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {detail.livingStatus}
            </span>
          </TableCell>
        </TableRow>
        {detail.children &&
          detail.children.length > 0 &&
          renderWarishDetails(detail.children, depth + 1, currentIndex)}
      </React.Fragment>
    );
  });
};

const LegalHeirCertificateForm = ({
  application,
  rootWarishDetails,
}: {
  application: WarishApplicationProps;
  rootWarishDetails: WarishDetailProps[];
}) => {
  return (
    <div className="p-8 bg-white shadow-md rounded-md max-w-3xl mx-auto">
      {/* Heading */}
      <h2 className="text-center text-xl font-bold mb-6">
        Application for Legal Heir (Warison) Certificate
      </h2>

      {/* Address Section */}
      <div className="mb-6">
        <p>To,</p>
        <p>The Prodhan</p>
        <p>{gpname}</p>
        <p>{gpaddress}</p>
      </div>

      {/* Subject */}
      <p className="mb-4 font-semibold">
        Subject: Request for issuing legal heir (Warison) Certificate
      </p>

      {/* Main Body */}
      <p className="mb-4">Respected madam/sir,</p>

      <p className="mb-4">
        I beg to state that my father/mother, Sri/Smt.{" "}
        <span className="underline">{application.applicantName}</span> S/O, W/O{" "}
        <span className="underline">{application.fatherName}</span> of Vill{" "}
        <span className="underline">{application.villageName}</span> P.O-
        <span className="underline">{application.postOffice}</span> P.S-
        <span className="underline">Hili</span> has been expired on{" "}
        <span className="underline">
          {formatDateTime(application.dateOfDeath).dateOnly}
        </span>{" "}
        (Attached Death Certificate).
      </p>

      {/* Declaration */}
      <p className="mb-4">
        I declare that my {application.relationwithdeceased} left behind the
        following persons who are the legal heirs/heiresses:
      </p>

      {/* Table of Legal Heirs */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10%]">Serial No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Relation</TableHead>
            <TableHead>Death Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderWarishDetails(rootWarishDetails)}</TableBody>
      </Table>

      <p className="mb-4">
        Further declared that no other legal heir or heiress of late{" "}
        <span className="underline">{application.nameOfDeceased}</span> exists.
        In view of the above, you are requested to kindly issue me a legal heir
        certificate based on my declaration.
      </p>

      {/* Footer */}
      <div className="flex justify-between mb-6">
        <div>
          <p>
            Date:{" "}
            <span className="underline">
              {formatDateTime(application.reportingDate).dateOnly}
            </span>
          </p>
        </div>
        <div>
          <p>
            Place: <span className="underline">{application.villageName}</span>
          </p>
        </div>
      </div>

      <div className="mb-6 text-right">
        <p>Yours faithfully,</p>
      </div>

      {/* Attachments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Attachments:</h3>
        <ul className="list-disc pl-5">
          <li>Death certificate of the deceased</li>
          <li>Tax Receipt (updated)</li>
          <li>EPIC (Voter Card)/Aadhaar of the applicant</li>
          <li>Age & photo ID proof of every legal heir/heiress</li>
        </ul>
      </div>
    </div>
  );
};

export default LegalHeirCertificateForm;
