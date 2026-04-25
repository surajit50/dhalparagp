
export interface Measurement {
  id: string;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
}

export interface MBEntry {
  id?: string;
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
  checkedBy?: string;
  remarks?: string;
  measurements?: Measurement[];
}

export interface MBPrintMetadata {
  mbNumber: string;
  mbPageNumber: string;
  measuredDate: string;
  measuredBy: string;
}

export interface MBPrintPreviewProps {
  entries: MBEntry[];
  workDetails: any;
  estimateItems?: any[];
  metadata: MBPrintMetadata;
  onClose: () => void;
}

export type PrintRow =
  | {
      type: "header";
      entry: MBEntry;
      slNo: string | number;
      hasMeasurements: boolean;
      showParentHeader: boolean;
      isSubItem: boolean;
    }
  | {
      type: "measurement";
      measurement: Measurement;
      idx: number;
      parentEntry?: MBEntry;
    }
  | { type: "total"; entry: MBEntry }
  | {
      type: "group-header";
      description: string;
      slNo: number;
      schedulePageNo?: string;
    };
