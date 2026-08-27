"use client";

import { useRef } from "react";
import Image from "next/image";

interface VoucherPreviewProps {
    voucher: any;
}

export const VoucherPreview = ({ voucher }: VoucherPreviewProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML;
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
            <button
                onClick={handlePrint}
                className="mb-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
                Print Voucher
            </button>

            <div
                ref={printRef}
                className="w-full bg-white p-12 shadow-lg"
                style={{ minHeight: "1123px", width: "794px" }} // A4 dimensions at 96 DPI
            >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 flex flex-col items-center ml-16">
                        <h1 className="text-xl font-bold uppercase tracking-wide">{voucher.voucherType} VOUCHER</h1>
                        <h2 className="text-lg font-bold">DHALPARA GRAM PANCHAYAT</h2>
                        <h3 className="text-sm font-semibold">DAKSHIN DINAJPUR, HILI, DHALPA</h3>
                    </div>
                    <div className="w-48 flex justify-end">
                        <img
                            src="/sahajlogo.jpg"
                            alt="SAHAJ SARAL"
                            className="object-contain w-full h-auto"
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex justify-between mb-8 text-sm">
                    <div className="space-y-2">
                        <div className="font-semibold"><span className="font-bold">Head of Account:</span> {voucher.accountHead?.headOfAccount || "OWN FUND-MISCELLANEOUS"}</div>
                        <div className="font-semibold"><span className="font-bold">Account Codes:</span> {voucher.accountHead?.accountCode || "101501000"}</div>
                        <div className="font-semibold"><span className="font-bold">Account Code Desc:</span> {voucher.accountHead?.description || "Receipt- PRI Own Resource"}</div>
                        <div className="font-semibold"><span className="font-bold">National A/C Code:</span> {voucher.accountHead?.nationalAccountCode || "0035-101-0000-80-0000-0000"}</div>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="font-semibold"><span className="font-bold">Voucher Date:</span> {formatDate(voucher.voucherDate)}</div>
                        <div className="font-semibold"><span className="font-bold">Voucher ID:</span> {voucher.voucherId}</div>
                        <div className="font-semibold"><span className="font-bold">Voucher No.:</span> {voucher.voucherNo || "XXXXXXXXXXX"}</div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4 text-sm mb-16">
                    <div className="font-semibold">
                        <span className="font-bold">Received from: </span> {voucher.receivedFrom?.toUpperCase()}
                    </div>
                    <div className="font-semibold">
                        <span className="font-bold">of: </span> {voucher.address?.toUpperCase()}
                    </div>
                    <div className="font-semibold">
                        <span className="font-bold">Description: </span> {voucher.description?.toUpperCase()}
                    </div>
                    <br />
                    <div className="font-semibold">
                        <span className="font-bold">Rs.: {voucher.amount}/-</span> (Rs.{voucher.amountInWords})
                    </div>
                    <div className="font-semibold">
                        <span className="font-bold">Received by: </span> None
                    </div>
                    <div className="font-semibold">
                        <span className="font-bold">No.: </span>
                    </div>
                    <div className="font-semibold">
                        <span className="font-bold">Dated: </span>
                    </div>
                    <div className="font-semibold">
                        <span className="font-bold">Drawn on: </span> {voucher.drawnOn}
                    </div>
                    <div className="font-semibold">
                        <span className="font-bold">Allotment No: </span> {voucher.allotmentNo}
                    </div>
                </div>

                {/* Signatures Section */}
                <div className="mt-32 pt-8">
                    <div className="flex justify-between items-end">
                        <div className="font-semibold">
                            Secretary/Authorized employee of GP
                        </div>
                        <div className="font-semibold">
                            Authorised Signatory
                        </div>
                    </div>
                    <div className="mt-8 space-y-1 text-sm italic">
                        <div>Voucher Entered by: Arpan Sarkar</div>
                        <div>Voucher Verified By: {voucher.verifiedBy?.name || "Arpan Sarkar, Sahayak"}</div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: A4; }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};
