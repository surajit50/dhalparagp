import type { StreetLightInput, ComplaintUpdateInput } from "@/schema/street-light";
import type { StreetLight } from "@prisma/client";

export const LIGHT_TYPE_OPTIONS = [
  { value: "LED", label: "LED" },
  { value: "SODIUM", label: "Sodium Vapour" },
  { value: "CFL", label: "CFL" },
  { value: "HALOGEN", label: "Halogen" },
  { value: "OTHER", label: "Other" },
] as const;

export const POLE_TYPE_OPTIONS = [
  { value: "ELECTRIC_POLE", label: "Electric Pole" },
  { value: "RCC", label: "RCC Pole" },
  { value: "MS", label: "MS Pole" },
  { value: "WOODEN", label: "Wooden Pole" },
  { value: "OTHER", label: "Other" },
] as const;

export const OWNERSHIP_OPTIONS = [
  { value: "GP", label: "Gram Panchayat" },
  { value: "ELECTRICITY_DEPARTMENT", label: "Electricity Department" },
  { value: "OTHER", label: "Other" },
] as const;

export const LIGHT_CONDITION_OPTIONS = [
  { value: "GOOD", label: "Good" },
  { value: "REPAIR_REQUIRED", label: "Repair Required" },
  { value: "DEFECTIVE", label: "Defective" },
  { value: "MISSING", label: "Missing" },
] as const;

export const WORKING_STATUS_OPTIONS = [
  { value: "WORKING", label: "Working" },
  { value: "NOT_WORKING", label: "Not Working" },
] as const;

export const COMPLAINT_TYPE_OPTIONS = [
  { value: "NOT_WORKING", label: "Not Working" },
  { value: "DAMAGED", label: "Damaged / Broken" },
  { value: "MISSING", label: "Missing" },
  { value: "WIRE_ISSUE", label: "Wire Issue" },
  { value: "OTHER", label: "Other" },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const;

export const COMPLAINT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ENQUIRY_COMPLETED", label: "Enquiry Completed" },
  { value: "WORK_ORDER_ISSUED", label: "Work Order Issued" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const;

type Enumerable<T extends string> = T | (string & Record<never, never>);

export function mapStreetLightToFormInput(
  light: StreetLight
): Partial<StreetLightInput> {
  return {
    mouzaId: light.mouzaId,
    sansad: light.sansad ?? undefined,
    ward: light.ward ?? undefined,
    landmark: light.landmark ?? undefined,
    roadName: light.roadName ?? undefined,
    poleNo: light.poleNo ?? undefined,
    installYear: light.installYear ?? undefined,
    ownership: light.ownership as StreetLightInput["ownership"],
    latitude: light.latitude ?? undefined,
    longitude: light.longitude ?? undefined,
    gpsAccuracy: light.gpsAccuracy ?? undefined,
    lightType: light.lightType as StreetLightInput["lightType"],
    wattage: light.wattage ?? undefined,
    poleType: light.poleType as StreetLightInput["poleType"],
    lightCondition: light.lightCondition as StreetLightInput["lightCondition"],
    workingStatus: light.workingStatus as StreetLightInput["workingStatus"],
    lastInspection: light.lastInspection?.toISOString().split("T")[0] ?? undefined,
    remarks: light.remarks ?? undefined,
    lightImageUrl: light.lightImageUrl ?? undefined,
    lightImagePublicId: light.lightImagePublicId ?? undefined,
    poleImageUrl: light.poleImageUrl ?? undefined,
    poleImagePublicId: light.poleImagePublicId ?? undefined,
  };
}

export function mapMouzaToFormInput(mouza: {
  id: string;
  mouzaName: string;
  jlNo: string | null;
  gramSansad: string;
  ward: string | null;
  mouzaCode: string;
  sansadCode: string | null;
}) {
  return {
    mouzaName: mouza.mouzaName,
    jlNo: mouza.jlNo ?? undefined,
    gramSansad: mouza.gramSansad,
    ward: mouza.ward ?? undefined,
    mouzaCode: mouza.mouzaCode,
    sansadCode: mouza.sansadCode ?? undefined,
  };
}
