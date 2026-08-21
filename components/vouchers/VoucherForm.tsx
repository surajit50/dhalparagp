"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVoucher } from "@/action/voucher-actions";

export const VoucherForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        voucherType: "CREDIT",
        headOfAccount: "",
        accountCode: "",
        accountCodeDesc: "",
        nationalAccountCode: "",
        voucherDate: new Date().toISOString().split("T")[0],
        receivedFrom: "",
        address: "",
        description: "",
        amount: "",
        amountInWords: "",
        allotmentNo: "",
        drawnOn: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === "amount") {
                newData.amountInWords = numberToWords(Number(value));
            }
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await createVoucher(formData);
            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                router.push(`/vouchers/preview/${result.data.id}`);
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Voucher</h2>
            
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Type</label>
                        <select 
                            name="voucherType" 
                            value={formData.voucherType} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="CREDIT">Credit Voucher</option>
                            <option value="DEBIT">Debit Voucher</option>
                            <option value="RECEIPT">Receipt Voucher</option>
                            <option value="PAYMENT">Payment Voucher</option>
                            <option value="JOURNAL">Journal Voucher</option>
                            <option value="CONTRA">Contra Voucher</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Date</label>
                        <input 
                            type="date" 
                            name="voucherDate" 
                            value={formData.voucherDate} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Head of Account</label>
                            <input 
                                type="text" 
                                name="headOfAccount" 
                                value={formData.headOfAccount} 
                                onChange={handleChange}
                                placeholder="e.g. OWN FUND-MISCELLANEOUS"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                            <input 
                                type="text" 
                                name="accountCode" 
                                value={formData.accountCode} 
                                onChange={handleChange}
                                placeholder="e.g. 101501000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Code Desc</label>
                            <input 
                                type="text" 
                                name="accountCodeDesc" 
                                value={formData.accountCodeDesc} 
                                onChange={handleChange}
                                placeholder="e.g. Receipt PRI Own Resource"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">National A/C Code</label>
                            <input 
                                type="text" 
                                name="nationalAccountCode" 
                                value={formData.nationalAccountCode} 
                                onChange={handleChange}
                                placeholder="e.g. 0035-101-0000-80-0000-0000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Transaction Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Received From / Paid To</label>
                            <input 
                                type="text" 
                                name="receivedFrom" 
                                value={formData.receivedFrom} 
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address / Village</label>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Purpose</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                name="amount" 
                                value={formData.amount} 
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount in Words</label>
                            <input 
                                type="text" 
                                name="amountInWords" 
                                value={formData.amountInWords} 
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md focus:outline-none"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Allotment No.</label>
                            <input 
                                type="text" 
                                name="allotmentNo" 
                                value={formData.allotmentNo} 
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Drawn On (Bank/Cheque Info)</label>
                            <input 
                                type="text" 
                                name="drawnOn" 
                                value={formData.drawnOn} 
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? "Generating..." : "Generate Voucher"}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Helper function to convert number to words
function numberToWords(num: number): string {
    if (num === 0) return 'Zero Only';
    
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numStr = num.toString();
    if (numStr.length > 9) return 'overflow';
    
    let result = "";
    
    const crores = Math.floor(num / 10000000);
    num -= crores * 10000000;
    const lakhs = Math.floor(num / 100000);
    num -= lakhs * 100000;
    const thousands = Math.floor(num / 1000);
    num -= thousands * 1000;
    const hundreds = Math.floor(num / 100);
    num -= hundreds * 100;
    
    if (crores > 0) {
        result += (crores < 20 ? a[crores] : b[Math.floor(crores/10)] + (crores%10 > 0 ? " " + a[crores%10] : "")) + "Crore ";
    }
    if (lakhs > 0) {
        result += (lakhs < 20 ? a[lakhs] : b[Math.floor(lakhs/10)] + (lakhs%10 > 0 ? " " + a[lakhs%10] : "")) + "Lakh ";
    }
    if (thousands > 0) {
        result += (thousands < 20 ? a[thousands] : b[Math.floor(thousands/10)] + (thousands%10 > 0 ? " " + a[thousands%10] : "")) + "Thousand ";
    }
    if (hundreds > 0) {
        result += a[hundreds] + "Hundred ";
    }
    if (num > 0) {
        if (result !== "") result += "and ";
        result += (num < 20 ? a[num] : b[Math.floor(num/10)] + (num%10 > 0 ? " " + a[num%10] : ""));
    }
    
    return result.trim() + " Only";
}
