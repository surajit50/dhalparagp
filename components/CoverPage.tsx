/* eslint-disable @next/next/no-img-element */

// app/components/CoverPage.tsx
export function CoverPage() {
  const reportData = {
    financialYear: "2023-2024",
    workName: "Construction of Rural Road",
    workCode: "GP/DDP/2024/5678",
    gramPanchayat: "No. 3 Dhalpara Gram Panchayat",
    block: "Hili Block",
    district: "Dakshin Dinajpur",
    nitDetails: {
      memoNumber: "MEMO/GP/5678/2023",
      memoDate: "15-Nov-2023",
      tenderLink: "https://wb-tender.gov.in/5678",
    },
    workOrder: {
      memoNumber: "WO/GP/9876/2024",
      memoDate: "15-Jan-2024",
      agency: "M/S ABC Infrastructure Ltd.",
    },
    fundDetails: {
      sanctionedAmount: "₹25,00,000",
      expenditure: "₹18,75,000",
      balance: "₹6,25,000",
    },
    completionDate: "30-Apr-2024",
    billDetails: {
      billType: "Final Bill",
      billDate: "25-Apr-2024",
      billNumber: "BILL/2024/1234",
    },
    signatures: {
      executive: "/signatures/executive.png", // Path to signature image
      prodhan: "/signatures/prodhan.png", // Path to signature image
    },
    barcode: "/barcodes/report-barcode.png", // Path to barcode image
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white p-8 border-2 border-gray-200">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          No. 3 Dhalpara Gram Panchayat
        </h1>
        <p className="text-lg text-gray-600">
          Trimohini, Hili Block, Dakshin Dinajpur
        </p>
      </div>

      {/* Report Title */}
      <div className="text-center my-12">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Work Implementation Report
        </h2>
        <p className="text-2xl text-gray-700">
          Financial Year: {reportData.financialYear}
        </p>
      </div>

      {/* Work Details */}
      <div className="w-full max-w-4xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Work Name</p>
            <p className="text-lg font-semibold">{reportData.workName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Work Code</p>
            <p className="text-lg font-semibold">{reportData.workCode}</p>
          </div>
        </div>

        {/* NIT Details */}
        <div className="border-t pt-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2">NIT Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Memo Number</p>
              <p className="font-medium">{reportData.nitDetails.memoNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Memo Date</p>
              <p className="font-medium">{reportData.nitDetails.memoDate}</p>
            </div>
          </div>
        </div>

        {/* Work Order Details */}
        <div className="border-t pt-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            Work Order Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Memo Number</p>
              <p className="font-medium">{reportData.workOrder.memoNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Memo Date</p>
              <p className="font-medium">{reportData.workOrder.memoDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Agency</p>
              <p className="font-medium">{reportData.workOrder.agency}</p>
            </div>
          </div>
        </div>

        {/* Fund Details */}
        <div className="border-t pt-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2">Fund Details</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Sanctioned Amount</p>
              <p className="font-medium">
                {reportData.fundDetails.sanctionedAmount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expenditure</p>
              <p className="font-medium">
                {reportData.fundDetails.expenditure}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-medium">{reportData.fundDetails.balance}</p>
            </div>
          </div>
        </div>

        {/* Completion and Bill Details */}
        <div className="border-t pt-4">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            Completion & Bill Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Completion Date</p>
              <p className="font-medium">{reportData.completionDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bill Type</p>
              <p className="font-medium">{reportData.billDetails.billType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bill Date</p>
              <p className="font-medium">{reportData.billDetails.billDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bill Number</p>
              <p className="font-medium">{reportData.billDetails.billNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signatures and Barcode */}
      <div className="w-full max-w-4xl mt-12 border-t pt-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">Executive Engineer</p>
            <img
              src={reportData.signatures.executive}
              alt="Executive Signature"
              className="h-20 mx-auto"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Prodhan</p>
            <img
              src={reportData.signatures.prodhan}
              alt="Prodhan Signature"
              className="h-20 mx-auto"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Barcode</p>
            <img
              src={reportData.barcode}
              alt="Report Barcode"
              className="h-20 mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <p className="text-9xl font-bold text-gray-200 transform rotate-45">
          OFFICIAL
        </p>
      </div>
    </div>
  );
}
