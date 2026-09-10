// lib/tubewell/export-helpers.ts
/**
 * Helper functions for exporting tube well data to PDF/Excel
 */

import { format } from 'date-fns';

export interface ExportTubeWell {
  slNo: number;
  assetId: string;
  tubeWellNumber: string;
  village: string;
  mouza: string;
  ward: string;
  landmark?: string;
  latitude?: string;
  longitude?: string;
  installationYear?: string;
  functionalStatus: string;
  waterAvailable: string;
  householdsServed?: string;
  lastInspectionDate?: string;
  lastRepairDate?: string;
  remarks?: string;
}

export interface ExportComplaint {
  slNo: number;
  complaintId: string;
  assetId: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  complaintDate: string;
  assignedTo?: string;
  resolvedDate?: string;
  remarks?: string;
}

export interface ExportRepair {
  slNo: number;
  repairId: string;
  assetId: string;
  problem: string;
  category: string;
  estimatedCost: string;
  actualCost: string;
  repairDate: string;
  completionDate?: string;
  status: string;
  remarks?: string;
}

/**
 * Format date for export
 */
export function formatExportDate(date: Date | null | undefined): string {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy');
}

/**
 * Format boolean for export
 */
export function formatBoolean(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return value ? 'Yes' : 'No';
}

/**
 * Format currency for export
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Generate CSV content from array of objects
 */
export function generateCSVContent<T extends Record<string, any>>(data: T[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map((item) => {
    return headers.map((header) => {
      const value = item[header.toLowerCase()] ?? '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}
