/**
 * Shared type definitions for correction requests module
 */

export type CorrectionRequestStatus = "pending" | "approved" | "rejected";
export type CorrectionRequestTargetType = "application" | "detail";

export interface WarishApplicationInfo {
    id: string;
    acknowlegment: string;
    applicantName: string;
}

export interface CorrectionRequest {
    id: string;
    fieldToModify?: string | null;
    currentValue?: string | null;
    proposedValue?: string | null;
    modifications?: Array<{
        field: string;
        oldValue: any;
        newValue: any;
    }> | null;
    reasonForModification: string;
    requestedBy: string;
    requestedDate: Date;
    status: CorrectionRequestStatus;
    reviewedBy?: string | null;
    reviewedDate?: Date | null;
    reviewComments?: string | null;
    targetType: CorrectionRequestTargetType;
    warishApplicationId?: string | null;
    warishDetailId?: string | null;
    warishApplication?: WarishApplicationInfo | null;
}

export interface CorrectionRequestStats {
    pending: number;
    approved: number;
    rejected: number;
}

export interface CorrectionRequestsData {
    pendingRequests: CorrectionRequest[];
    approvedRequests: CorrectionRequest[];
    rejectedRequests: CorrectionRequest[];
    stats: CorrectionRequestStats;
}
