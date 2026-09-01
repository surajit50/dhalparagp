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
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).replace(/\//g, '.');
    };

    return (
        <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
            <button
                onClick={handlePrint}
                className="mb-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 print:hidden"
            >
                Print Voucher
            </button>

            <div
                ref={printRef}
                className="w-full bg-white px-10 py-12 shadow-lg print-container"
                style={{ minHeight: "1123px", width: "794px", fontFamily: '"Times New Roman", Times, serif' }}
            >
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex-1 flex flex-col items-center ml-[120px]">
                        <h1 className="text-[17px] uppercase tracking-wide">{voucher.voucherType || 'CREDIT'} VOUCHER</h1>
                        <h2 className="text-[15px] font-bold">DHALPARA GRAM PANCHAYAT</h2>
                        <h3 className="text-[13px] font-bold">DAKSHIN DINAJPUR, HILI, DHALPA</h3>
                    </div>
                    <div className="w-[120px] flex justify-end">
                        <img
                            src="/sahajlogo.jpg"
                            alt="SAHAJ SARAL"
                            className="object-contain w-full h-auto"
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex justify-between mb-8 text-[13px] font-bold">
                    <div className="space-y-1">
                        <div>Head of Account: {voucher.accountHead?.headOfAccount || "OWN FUND-MISCELLANEOUS"}</div>
                        <div>Account Codes: {voucher.accountHead?.accountCode || "101501000"}</div>
                        <div>Account Code Desc: {voucher.accountHead?.description || "Receipt- PRI Own Resource"}</div>
                        <div>National A/C Code: {voucher.accountHead?.nationalAccountCode || "0035-101-0000-80-0000-0000"}</div>
                    </div>
                    <div className="space-y-1 text-right">
                        <div>Voucher Date: {voucher.voucherDate ? formatDate(voucher.voucherDate) : "31.08.2026"}</div>
                        <div>Voucher ID: {voucher.voucherId || "2627R001353"}</div>
                        <div>Voucher No.: {voucher.voucherNo || "XXXXXXXXXXX"}</div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-[8px] text-[13px] font-bold mb-16">
                    <div>
                        Received from: {voucher.receivedFrom || "Mohai Mondal"}
                    </div>
                    <div>
                        of: {voucher.address || "Chakdapat"}
                    </div>
                    <div className="pt-2">
                        Description: {voucher.description || "Legal hair certificate fee"}
                    </div>
                    <div className="pt-4">
                        Rs.: {voucher.amount || "100"}/- (Rs.{voucher.amountInWords || "One Hundred Only"})
                    </div>
                    <div className="pt-2">
                        Received by: {voucher.receivedBy || "None"}
                    </div>
                    <div>
                        No.:
                    </div>
                    <div>
                        Dated:
                    </div>
                    <div>
                        Drawn on: {voucher.drawnOn}
                    </div>
                    <div>
                        Allotment No: {voucher.allotmentNo}
                    </div>
                </div>

                {/* Signatures Section */}
                <div className="mt-32">
                    <div className="flex justify-between items-end text-[13px] font-bold mb-6">
                        <div>
                            Secretary/Authorized employee of GP
                        </div>
                        <div>
                            Authorised Signatory
                        </div>
                    </div>
                    <div className="space-y-[2px] text-[13px] italic font-bold">
                        <div>Voucher Entered by: {voucher.enteredBy || "Arpan Sarkar, Sahayak"} on {voucher.voucherDate ? formatDate(voucher.voucherDate) : "31.08.2026"}</div>
                        <div>Voucher Verified By: {voucher.verifiedBy?.name}</div>
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
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    body > *:not(.max-w-4xl) {
                        display: none !important;
                    }
                    .max-w-4xl {
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: transparent !important;
                    }
                    .print-container {
                        box-shadow: none !important;
                        width: 100% !important;
                        height: 100% !important;
                        padding: 40px !important;
                        margin: 0 !important;
                    }
                    button {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};
