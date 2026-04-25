export interface MBEntry {
  id: string;
  estimateItemId: string;
  subItemId?: string;
  mbNumber: string;
  mbPageNumber: string;
  workItemDescription: string;
  unit: string;
  quantityExecuted: number;
  rate: number;
  amount: number;
  measuredDate: string;
  measuredBy: string;
}

export interface BillAbstractEntry {
  id?: string;
  mbEntryId: string;
  estimateItemId?: string;
  subItemId?: string;
  mbNumber: string;
  mbPageNumber: string;
  workItemDescription: string;
  unit: string;
  quantityExecuted: number;
  rate: number;
  amount: number;
  remarks?: string;
}

export interface EstimateItem {
  id: string;
  slNo: number;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  subItems?: EstimateItem[];
}

export interface DisplayItem {
  isHeader: boolean;
  slNo: string;
  description: string;
  mbNumber: string;
  mbPageNumber: string;
  quantity: number | string;
  unit: string;
  rate: number | string;
  amount: number | string;
  entryIndex?: number;
  originalEntry?: BillAbstractEntry;
  isSubItem?: boolean;
}

export interface BillAbstractFormData {
  billType: string;
  period: string;
  contractualPercentage: string;
  cgstPercentage: string;
  sgstPercentage: string;
  labourCessPercentage: string;
}
