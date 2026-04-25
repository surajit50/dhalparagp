// ============================================================================
// PWD BILLING ENGINE (Reusable)
// ============================================================================

export interface BillEntry {
  amount: number;
  isHeader?: boolean;
}

export interface BillingConfig {
  contractualPercent: number; // +10 or -5
  cgstPercent: number;
  sgstPercent: number;
  lwcPercent: number;
  roundOff?: number; // 1, 10, 100
}

export interface BillingResult {
  itemwiseTotal: number;
  contractualDeduction: number;
  actualValue: number;
  sayAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  subTotal: number;
  lwcAmount: number;
  grossBillAmount: number;
}

export function calculateBill(
  entries: BillEntry[],
  config: BillingConfig
): BillingResult {

  // 1️⃣ Total of Items
  const itemwiseTotal = entries.reduce(
    (sum, e) => (!e.isHeader ? sum + e.amount : sum),
    0
  );

  // 2️⃣ Contractor Adjustment (+ / -)
  const contractualDeduction =
    (itemwiseTotal * config.contractualPercent) / 100;

  const actualValue = itemwiseTotal + contractualDeduction;

  // 3️⃣ SAY (PWD rounding)
  const roundFactor = config.roundOff || 1;
  const sayAmount =
    Math.round(actualValue / roundFactor) * roundFactor;

  // 4️⃣ GST
  const cgstAmount = (sayAmount * config.cgstPercent) / 100;
  const sgstAmount = (sayAmount * config.sgstPercent) / 100;

  const subTotal = sayAmount + cgstAmount + sgstAmount;

  // 5️⃣ LWC
  const lwcAmount = (subTotal * config.lwcPercent) / 100;

  // 6️⃣ Final Gross Amount
  const grossBillAmount = subTotal + lwcAmount;

  return {
    itemwiseTotal,
    contractualDeduction,
    actualValue,
    sayAmount,
    cgstAmount,
    sgstAmount,
    subTotal,
    lwcAmount,
    grossBillAmount,
  };
}
