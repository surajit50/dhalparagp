
import { gpcode } from "@/constants/gpinfor";
export async function getFileBlob(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        // Include authentication headers if needed
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY}`, // Example for API Key
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED: Please check your credentials.");
      }
      throw new Error(`ERROR ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("Error fetching file blob:", error);
    throw error; // Rethrow to be caught in `downloadUrl`
  }
}

interface DownloadUrlOptions {
  downloadBlob?: boolean;
}

export async function downloadUrl(
  url: string,
  filename: string = "file",
  options?: DownloadUrlOptions
) {
  const { downloadBlob = true } = options || {};
  let downloadUrl = url;

  try {
    if (downloadBlob) {
      const blob = await getFileBlob(url);
      const blobUrl = URL.createObjectURL(blob);
      downloadUrl = blobUrl;
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    a.style.display = "none"; // Hide the link

    document.body.appendChild(a); // Append to body
    a.click(); // Trigger download

    // Cleanup
    if (downloadBlob) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 150);
    }
    document.body.removeChild(a); // Remove the link element
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}

/**
 * Calculates security deposit (10% of gross amount) with:
 * - Proper decimal rounding
 * - Minimum value validation
 * - Manual input support
 */
export const calculateSecurityDeposit = (
  grossBillAmount: number | string
): number => {
  const amount = Number(grossBillAmount) || 0
  const deposit = amount * 0.1
  return Math.max(Number(deposit.toFixed(2)), 0)
}

/**
 * Calculates net amount with:
 * - All deductions validation
 * - Non-negative result guarantee
 * - Proper decimal handling
 */
export const calculateNetAmount = (
  grossBillAmount: number | string,
  lessIncomeTax: number | string,
  lessLabourWelfareCess: number | string,
  lessTdsCgst: number | string,
  lessTdsSgst: number | string,
  securityDeposit: number | string
): number => {
  const gross = Number(grossBillAmount) || 0
  const deductions = [
    Number(lessIncomeTax) || 0,
    Number(lessLabourWelfareCess) || 0,
    Number(lessTdsCgst) || 0,
    Number(lessTdsSgst) || 0,
    Number(securityDeposit) || 0,
  ].reduce((sum, deduction) => sum + Math.max(deduction, 0), 0)

  const net = gross - deductions
  return Math.max(Number(net.toFixed(2)), 0)
}

export const parseDateString = (dateString: string): Date | null => {
  const [day, month, year] = dateString.split("-").map(Number);

  // Check for valid numbers and a valid date
  if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  const date = new Date(year, month - 1, day); // month is 0-indexed in JavaScript's Date

  // Ensure that the created date object matches the input (to prevent invalid dates like 31st February)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};
export const formatDateTime = (
  dateString: Date | string,
  timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  const toFormattedString = (
    options: Intl.DateTimeFormatOptions,
    locale: string = "en-GB"
  ) => new Date(dateString).toLocaleString(locale, { ...options, timeZone });

  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return {
    dateTime: toFormattedString(dateTimeOptions).replace(",", ""),
    dateDay: toFormattedString(dateDayOptions),
    dateOnly: toFormattedString(dateOptions),
    timeOnly: toFormattedString(timeOptions),
  };
};

// Example usage

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function generateMemoNumber(latestNumber: number, year: number): string {
  // Input validation
  if (!Number.isInteger(latestNumber) || latestNumber < 0) {
    throw new Error("latestNumber must be a non-negative integer");
  }

  if (!Number.isInteger(year) || year < 1900 || year > 9999) {
    throw new Error("year must be a valid 4-digit year");
  }

  // Generate the new number
  const newNumber = latestNumber + 1;

  // Pad the number to ensure it's at least 3 digits
  const paddedNumber = newNumber.toString().padStart(3, "0");

  // Return the formatted memo number
  return `${paddedNumber}/${gpcode}/(LH)/${year}`;
}

export const formatDate = (date: Date): string => {
  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const day = istDate.getDate().toString().padStart(2, "0");
  const month = (istDate.getMonth() + 1).toString().padStart(2, "0");
  const year = istDate.getFullYear();

  return `${day}/${month}/${year}`;
};

export const getSerialNumber = (depth: number, index: number): string => {
  if (depth === 0) return `${index + 1}`;
  if (depth === 1) return String.fromCharCode(65 + index);
  return String.fromCharCode(97 + index);
};

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
export function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is zero-based

  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

export function formatDateTimeCustom(date: Date): string {
  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = istDate.getDate().toString().padStart(2, "0");
  const month = (istDate.getMonth() + 1).toString().padStart(2, "0");
  const year = istDate.getFullYear();
  const hours = istDate.getHours().toString().padStart(2, "0");
  const minutes = istDate.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
