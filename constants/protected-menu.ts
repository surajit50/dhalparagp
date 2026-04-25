import type { IconType } from "react-icons";
import {
  MdDashboard, MdAssessment, MdBusinessCenter, MdPeople, MdMoney,
  MdAssignment, MdPrint, MdSettingsCell, MdDescription, MdDateRange, MdAnnouncement,
  MdPersonAdd, MdSearch, MdFeedback, MdLocalLibrary, MdPayment,
  MdNotifications, MdCalendarToday, MdCloudUpload, MdApi, MdLock,
  MdSettingsApplications, MdSchool, MdAssignmentTurnedIn, MdHolidayVillage,
  MdWork, MdListAlt, MdAnalytics, MdReceipt, MdImportantDevices, MdBlock,
  MdHome, MdAccountCircle, MdSecurity, MdAttachMoney, MdHelp, MdFolder,
  MdInsertChart, MdGavel, MdDescription as MdDoc, MdApartment, MdImage, MdBuild
} from "react-icons/md";
import { FaChevronCircleRight, FaChartBar, FaChevronDown, FaTruck, FaKey, FaMeetup, FaFileContract, FaRegFileAlt } from "react-icons/fa";
import { HiDocumentDuplicate } from "react-icons/hi";

// Type Definition with allowedRoles
export type MenuItemProps = {
  menuItemText: string;
  menuItemLink?: string;
  Icon?: IconType;
  color?: string;
  submenu: boolean;
  subMenuItems: MenuItemProps[];
  allowedRoles: ("user" | "admin" | "staff" | "superadmin" | "agency" | "citizen")[];
};

// Color Constants
const COLORS = {
  blue: "text-blue-500",
  green: "text-green-500",
  yellow: "text-yellow-500",
  red: "text-red-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  indigo: "text-indigo-500",
  teal: "text-teal-500",
  orange: "text-orange-500",
  cyan: "text-cyan-600",
  gray: "text-gray-500",
  lime: "text-lime-500",
};

// Base URL Constants
const BASE_URLS = {
  user: "/dashboard",
  admin: "/admindashboard",
  staff: "/employeedashboard",
  superadmin: "/superadmindashboard",
  agency: "/agencydashboard",
};

// Enhanced helper to create menu items with allowedRoles
const createMenuItem = (
  text: string,
  roles: ("user" | "admin" | "staff" | "superadmin" | "agency" | "citizen")[],
  link?: string,
  Icon?: IconType,
  color: string = COLORS.blue,
  subItems: MenuItemProps[] = []
): MenuItemProps => ({
  menuItemText: text,
  menuItemLink: link,
  Icon,
  color,
  submenu: subItems.length > 0,
  subMenuItems: subItems,
  allowedRoles: roles,
});
  
export const publicUserMenuItems: MenuItemProps[] = [
  createMenuItem("Dashboard", ["user"], `${BASE_URLS.user}/home`, MdDashboard, COLORS.blue),

  createMenuItem("Certificates", ["user"], undefined, MdDescription, COLORS.red, [
    createMenuItem("Inheritance Certificate", ["user"], undefined, FaRegFileAlt, COLORS.yellow, [
      createMenuItem("Apply for Certificate", ["user"], `${BASE_URLS.user}/warish/apply`, FaChevronCircleRight, COLORS.yellow),
      createMenuItem("Check Status", ["user"], `${BASE_URLS.user}/warish/status`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Land Conversion NOC", ["user"], `${BASE_URLS.user}/land-conversion/application`, FaRegFileAlt, COLORS.green),
    createMenuItem("Linkage Certificate", ["user"], `${BASE_URLS.user}/linkage/application`, FaRegFileAlt, COLORS.blue),
    createMenuItem("Bulk Processing", ["user"], `${BASE_URLS.user}/certificates/bulk`, HiDocumentDuplicate, COLORS.cyan),
    createMenuItem("Issuance Reports", ["user"], `${BASE_URLS.user}/analytics/certificates/issuance`, FaChartBar, COLORS.blue),
  ]),

  createMenuItem("Profile & Account", ["user"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("Personal Information", ["user"], undefined, MdPersonAdd, COLORS.indigo, [
      createMenuItem("View Profile", ["user"], `${BASE_URLS.user}/profile/view`, FaChevronCircleRight, COLORS.indigo),
      createMenuItem("Edit Profile", ["user"], `${BASE_URLS.user}/profile/edit`, FaChevronCircleRight, COLORS.pink),
    ]),
    createMenuItem("Security Settings", ["user"], undefined, MdSecurity, COLORS.red, [
      createMenuItem("Change Password", ["user"], `${BASE_URLS.user}/profile/change-password`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Two-Factor Auth", ["user"], `${BASE_URLS.user}/profile/2fa`, FaChevronCircleRight, COLORS.orange),
    ]),
    createMenuItem("Notifications", ["user"], `${BASE_URLS.user}/notifications`, MdNotifications, COLORS.pink),
  ]),

  createMenuItem("Financial Services", ["user"], undefined, MdAttachMoney, COLORS.lime, [
    createMenuItem("Payments", ["user"], undefined, MdPayment, COLORS.lime, [
      createMenuItem("Payment History", ["user"], `${BASE_URLS.user}/payments/history`, FaChevronCircleRight, COLORS.lime),
      createMenuItem("Payment Methods", ["user"], `${BASE_URLS.user}/payments/methods`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Receipts", ["user"], `${BASE_URLS.user}/payments/receipts`, MdReceipt, COLORS.green),
  ]),

  createMenuItem("Support & Resources", ["user"], undefined, MdHelp, COLORS.orange, [
    createMenuItem("Help Desk", ["user"], undefined, MdFeedback, COLORS.orange, [
      createMenuItem("Submit Feedback", ["user"], `${BASE_URLS.user}/feedback`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("File Complaint", ["user"], `${BASE_URLS.user}/record-complaint`, FaChevronCircleRight, COLORS.red),
    ]),
    createMenuItem("Knowledge Base", ["user"], undefined, MdLocalLibrary, COLORS.teal, [
      createMenuItem("FAQs", ["user"], `${BASE_URLS.user}/resources/faqs`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("User Guides", ["user"], `${BASE_URLS.user}/resources/user-guide`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Documents", ["user"], `${BASE_URLS.user}/resources/documents`, MdFolder, COLORS.teal),
    createMenuItem("Announcements", ["user"], `${BASE_URLS.user}/announcements`, MdAnnouncement, COLORS.red),
    createMenuItem("Calendar", ["user"], `${BASE_URLS.user}/calendar`, MdCalendarToday, COLORS.red),
  ]),
];

// =============== ADMIN MENU ===============
// Extract reusable certificate management structure
const certificateManagementItems = (baseUrl: string): MenuItemProps[] => [
  createMenuItem("Inheritance Certificate", ["admin"], undefined, FaRegFileAlt, COLORS.yellow, [
    createMenuItem("Application Lifecycle", ["admin"], undefined, FaChevronDown, COLORS.teal, [
      createMenuItem("New Application", ["admin"], `${baseUrl}/manage-warish/application`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Bulk Applications", ["admin"], `${baseUrl}/manage-warish/bulk-upload`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Document Upload", ["admin"], `${baseUrl}/manage-warish/pending-uploaddoc`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Verification", ["admin"], `${baseUrl}/manage-warish/verify-document`, FaChevronCircleRight, COLORS.teal),
    ]),
    createMenuItem("Workflow", ["admin"], undefined, FaChevronDown, COLORS.blue, [
      createMenuItem("Assign to Staff", ["admin"], `${baseUrl}/manage-warish/assign-staff`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Public Assignments", ["admin"], `${baseUrl}/manage-warish/assign-citizen`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Approval Process", ["admin"], `${baseUrl}/manage-warish/approve`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Output", ["admin"], undefined, FaChevronDown, COLORS.green, [
      createMenuItem("Certificate Printing", ["admin"], `${baseUrl}/manage-warish/print`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Generate Certificate", ["admin"], `${baseUrl}/manage-warish/generate`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Renewal Processing", ["admin"], `${baseUrl}/manage-warish/renew`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Monitoring", ["admin"], undefined, FaChevronDown, COLORS.cyan, [
      createMenuItem("Status Tracking", ["admin"], `${baseUrl}/manage-warish/status`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Performance Metrics", ["admin"], `${baseUrl}/manage-warish/metrics`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Correction Requests", ["admin"], `${baseUrl}/manage-warish/correction-requests`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),
  createMenuItem("Land Conversion NOC", ["admin"], undefined, FaRegFileAlt, COLORS.green, [
    createMenuItem("New Application", ["admin"], `${baseUrl}/manage-land-conversion/application`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Document Verification", ["admin"], `${baseUrl}/manage-land-conversion/verify`, FaChevronCircleRight, COLORS.teal),
    createMenuItem("Site Inspection", ["admin"], `${baseUrl}/manage-land-conversion/inspection`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Approval Workflow", ["admin"], `${baseUrl}/manage-land-conversion/approve`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("NOC Issuance", ["admin"], `${baseUrl}/manage-land-conversion/issue`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Print Certificate", ["admin"], `${baseUrl}/manage-land-conversion/print`, FaChevronCircleRight, COLORS.cyan),
    createMenuItem("Compliance Check", ["admin"], `${baseUrl}/manage-land-conversion/compliance`, FaChevronCircleRight, COLORS.red),
  ]),
  createMenuItem("Linkage Certificate", ["admin"], undefined, FaRegFileAlt, COLORS.blue, [
    createMenuItem("Application Portal", ["admin"], `${baseUrl}/manage-linkage/application`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Document Validation", ["admin"], `${baseUrl}/manage-linkage/validate`, FaChevronCircleRight, COLORS.teal),
    createMenuItem("Ownership Verification", ["admin"], `${baseUrl}/manage-linkage/ownership`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Certificate Issuance", ["admin"], `${baseUrl}/manage-linkage/issue`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("Print Certificate", ["admin"], `${baseUrl}/manage-linkage/print`, FaChevronCircleRight, COLORS.cyan),
    createMenuItem("Renewal Process", ["admin"], `${baseUrl}/manage-linkage/renew`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Dispute Resolution", ["admin"], `${baseUrl}/manage-linkage/disputes`, FaChevronCircleRight, COLORS.red),
  ]),
  createMenuItem("Certificate Operations", ["admin"], undefined, HiDocumentDuplicate, COLORS.purple, [
    createMenuItem("Bulk Processing", ["admin"], `${baseUrl}/certificates/bulk`, FaChevronCircleRight, COLORS.cyan),
    createMenuItem("Status Tracker", ["admin"], `${baseUrl}/certificates/status`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Certificate Archive", ["admin"], `${baseUrl}/certificates/archive`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Renewal Management", ["admin"], `${baseUrl}/certificates/renewals`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Certificate Revocation", ["admin"], `${baseUrl}/certificates/revoke`, FaChevronCircleRight, COLORS.red),
  ]),
  createMenuItem("Certificate Analytics", ["admin"], undefined, FaChartBar, COLORS.teal, [
    createMenuItem("Issuance Reports", ["admin"], `${baseUrl}/analytics/certificates/issuance`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Processing Times", ["admin"], `${baseUrl}/analytics/certificates/processing`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Type-wise Distribution", ["admin"], `${baseUrl}/analytics/certificates/types`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("Revenue Analysis", ["admin"], `${baseUrl}/analytics/certificates/revenue`, FaChevronCircleRight, COLORS.orange),
  ]),
];

// Extract APA reports structure
const apaReportItems = (baseUrl: string): MenuItemProps[] => [
  createMenuItem("Generate APA Report", ["admin"], `${baseUrl}/generate-apa-report`, FaRegFileAlt, COLORS.purple),
  createMenuItem("Mandatory Conditions", ["admin"], undefined, FaRegFileAlt, COLORS.cyan, [
    createMenuItem("APA-MC-1", ["admin"], `${baseUrl}/apa-report/APA-MC-1`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-MC-2", ["admin"], `${baseUrl}/apa-report/APA-MC-2`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-MC-5", ["admin"], `${baseUrl}/apa-report/APA-MC-5`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-MC-6", ["admin"], `${baseUrl}/apa-report/APA-MC-6`, FaChevronCircleRight, COLORS.purple)
  ]),
  createMenuItem("Theme - 1", ["admin"], undefined, FaRegFileAlt, COLORS.cyan, [
    createMenuItem("APA-TE-1", ["admin"], `${baseUrl}/apa-report/APA-TE-1`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-2", ["admin"], `${baseUrl}/apa-report/APA-TE-2`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-3", ["admin"], `${baseUrl}/apa-report/APA-TE-3`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-4", ["admin"], `${baseUrl}/apa-report/APA-TE-4`, FaChevronCircleRight, COLORS.purple)
  ]),
  createMenuItem("Theme - 2", ["admin"], undefined, FaRegFileAlt, COLORS.cyan, [
    createMenuItem("APA-TE-5", ["admin"], `${baseUrl}/apa-report/APA-TE-5`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-6", ["admin"], `${baseUrl}/apa-report/APA-TE-6`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-7", ["admin"], `${baseUrl}/apa-report/APA-TE-7`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-8", ["admin"], `${baseUrl}/apa-report/APA-TE-8`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-9", ["admin"], `${baseUrl}/apa-report/APA-TE-9`, FaChevronCircleRight, COLORS.purple)
  ]),
  createMenuItem("Theme - 3", ["admin"], undefined, FaRegFileAlt, COLORS.cyan, [
    createMenuItem("APA-TE-10", ["admin"], `${baseUrl}/apa-report/APA-TE-10`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-11", ["admin"], `${baseUrl}/apa-report/APA-TE-11`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-13", ["admin"], `${baseUrl}/apa-report/APA-TE-13`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-14", ["admin"], `${baseUrl}/apa-report/APA-TE-14`, FaChevronCircleRight, COLORS.purple)
  ]),
  createMenuItem("Theme - 4", ["admin"], undefined, FaRegFileAlt, COLORS.cyan, [
    createMenuItem("APA-TE-16", ["admin"], `${baseUrl}/apa-report/APA-TE-16`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-17", ["admin"], `${baseUrl}/apa-report/APA-TE-17`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-19", ["admin"], `${baseUrl}/apa-report/APA-TE-19`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("APA-TE-20", ["admin"], `${baseUrl}/apa-report/APA-TE-20`, FaChevronCircleRight, COLORS.purple)
  ])
];

// Extract document generation items
const documentGenerationItems = (baseUrl: string): MenuItemProps[] => [
  createMenuItem("Scrutiny Sheets", ["admin"], undefined, FaRegFileAlt, COLORS.indigo, [
    createMenuItem("Single Sheet", ["admin"], `${baseUrl}/generate/printscrutisheet`, FaChevronCircleRight, COLORS.indigo),
    createMenuItem("Bulk Sheets", ["admin"], `${baseUrl}/generate/bulk-scrutee-sheet`, FaChevronCircleRight, COLORS.red),
  ]),
  createMenuItem("Agreements & Contracts", ["admin"], undefined, FaFileContract, COLORS.red, [
    createMenuItem("Agreements", ["admin"], `${baseUrl}/generate/agrement`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Contractor Prayer", ["admin"], `${baseUrl}/contractor/print-prayer`, FaChevronCircleRight, COLORS.blue),
  ]),
  createMenuItem("Comparative Statements", ["admin"], `${baseUrl}/generate/comparative-statement`, FaRegFileAlt, COLORS.red),
  createMenuItem("Orders", ["admin"], undefined, MdAssignment, COLORS.red, [
    createMenuItem("Work Orders", ["admin"], `${baseUrl}/generate/work-order`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Bulk Work Orders", ["admin"], `${baseUrl}/generate/bulk-work-order`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Supply Orders", ["admin"], `${baseUrl}/generate/supply-order`, FaChevronCircleRight, COLORS.red),
  ]),
  createMenuItem("Certificates", ["admin"], undefined, MdDescription, COLORS.red, [
    createMenuItem("Payment Certificates", ["admin"], `${baseUrl}/generate/payment-certificate`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Completion Certificates", ["admin"], `${baseUrl}/generate/completation-certificate`, FaChevronCircleRight, COLORS.red),
    createMenuItem("FY Completion Reports", ["admin"], `${baseUrl}/generate/completation-certificate2`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Award of Contract", ["admin"], `${baseUrl}/generate/generateAOC`, FaChevronCircleRight, COLORS.orange),
  ]),
  createMenuItem("Document Covers", ["admin"], `${baseUrl}/generate/cover-page`, FaRegFileAlt, COLORS.red),
  createMenuItem("Puja/Festival NOC", ["admin"], `${baseUrl}/generate/puja-noc`, FaRegFileAlt, COLORS.green),
];

export const adminMenuItems: MenuItemProps[] = [
  createMenuItem("Admin Dashboard", ["admin", "superadmin"], `${BASE_URLS.admin}/home`, MdDashboard, COLORS.blue),

  // Project & Works Management
  createMenuItem("Project Management", ["admin"], undefined, MdWork, COLORS.blue, [
    createMenuItem("Meeting Management", ["admin"], undefined, MdDateRange, COLORS.purple, [
      createMenuItem("All Meetings", ["admin"], `${BASE_URLS.admin}/meeting-manage`, MdCalendarToday, COLORS.blue),
      createMenuItem("Schedule Meeting", ["admin"], `${BASE_URLS.admin}/meeting-manage/add-meeting`, MdDateRange, COLORS.green),
      createMenuItem("Meeting Reports", ["admin"], `${BASE_URLS.admin}/meeting-manage/reports`, MdAssessment, COLORS.orange),
    ]),
    createMenuItem("Operations", ["admin"], undefined, MdWork, COLORS.red, [
      createMenuItem("Action Plans", ["admin"], `${BASE_URLS.admin}/work-manage/view`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Work Status Tracking", ["admin"], `${BASE_URLS.admin}/manage-tender/work-status-change`, FaChevronCircleRight, COLORS.indigo),
      createMenuItem("Fund Status", ["admin"], `${BASE_URLS.admin}/fundstatus`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Work Details", ["admin"], `${BASE_URLS.admin}/work-manage/scheme-wise`, FaChevronCircleRight, COLORS.red),
    ]),
    createMenuItem("Work Estimate & Billing", ["admin"], undefined, MdReceipt, COLORS.teal, [
      createMenuItem("Estimate Preparation", ["admin"], `${BASE_URLS.admin}/work-manage/estimate-preparation`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("MB Create", ["admin"], `${BASE_URLS.admin}/work-manage/mb-create`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Bill Abstract", ["admin"], `${BASE_URLS.admin}/work-manage/bill-abstract`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Bill Deduction", ["admin"], `${BASE_URLS.admin}/work-manage/bill-deduction`, FaChevronCircleRight, COLORS.orange),
    ]),
    createMenuItem("Development Works", ["admin"], undefined, MdAssignmentTurnedIn, COLORS.orange, [
      createMenuItem("Work Estimate & DPR", ["admin"], `${BASE_URLS.admin}/development-works/work-estimate-dpr`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Work Progress Monitoring", ["admin"], `${BASE_URLS.admin}/development-works/progress-monitoring`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Measurement Book (MB) & Bill Abstract", ["admin"], `${BASE_URLS.admin}/development-works/measurement-book`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Manage Estimate Types", ["admin"], `${BASE_URLS.admin}/development-works/manage-estimate-types`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Estimate Library", ["admin"], undefined, MdLocalLibrary, COLORS.teal, [
        createMenuItem("Library Items", ["admin"], `${BASE_URLS.admin}/development-works/estimate-library`, FaChevronCircleRight, COLORS.blue),
        createMenuItem("Add Item", ["admin"], `${BASE_URLS.admin}/development-works/estimate-library/add`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Bulk Upload", ["admin"], `${BASE_URLS.admin}/development-works/estimate-library/bulk-upload`, FaChevronCircleRight, COLORS.orange),
        createMenuItem("Estimate Templates", ["admin"], `${BASE_URLS.admin}/work-manage/estimate-preparation/templates`, FaChevronCircleRight, COLORS.purple),
      ]),
    ]),
    createMenuItem("Approved Action Plans", ["admin"], `${BASE_URLS.admin}/approvedactionplan`, MdListAlt, COLORS.green),
  ]),

  // Certificates & Documents
  createMenuItem("Certificates & Documents", ["admin", "superadmin"], undefined, MdDescription, COLORS.red, [
    ...certificateManagementItems(BASE_URLS.admin),
    ...documentGenerationItems(BASE_URLS.admin),
    createMenuItem("APA Reports", ["admin"], undefined, FaChartBar, COLORS.cyan, apaReportItems(BASE_URLS.admin)),
  ]),

  // Procurement & Vendors
  createMenuItem("Procurement", ["admin"], undefined, MdBusinessCenter, COLORS.purple, [
    createMenuItem("Vendor Management", ["admin"], undefined, MdPeople, COLORS.red, [
      createMenuItem("Vendor Registration", ["admin"], `${BASE_URLS.admin}/manage-vendor/registration`, MdPersonAdd, COLORS.blue),
      createMenuItem("Vendor Directory", ["admin"], `${BASE_URLS.admin}/manage-vendor/view`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Bulk Vendor Upload", ["admin"], `${BASE_URLS.admin}/manage-vendor/bulk-upload`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Vendor Analytics", ["admin"], undefined, FaChartBar, COLORS.teal, [
        createMenuItem("Bid Participation Summary", ["admin"], `${BASE_URLS.admin}/reports/vendor-participation`, FaChevronCircleRight, COLORS.blue),
        createMenuItem("Earnest Money Status", ["admin"], `${BASE_URLS.admin}/reports/earnest-money`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Technical Compliance", ["admin"], `${BASE_URLS.admin}/reports/technical-compliance`, FaChevronCircleRight, COLORS.purple),
      ]),
    ]),
    createMenuItem("Tender Management", ["admin"], undefined, FaChevronCircleRight, COLORS.green, [
      createMenuItem("Tender Creation", ["admin"], undefined, FaChevronDown, COLORS.teal, [
        createMenuItem("Create New Tender", ["admin"], `${BASE_URLS.admin}/manage-tender/add`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Tender Templates", ["admin"], `${BASE_URLS.admin}/manage-tender/templates`, FaChevronCircleRight, COLORS.blue),
      ]),
      createMenuItem("Active Tenders", ["admin"], `${BASE_URLS.admin}/manage-tender/view`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Upload Tenders", ["admin"], `${BASE_URLS.admin}/manage-tender/upload`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Tender Status Report", ["admin"], `${BASE_URLS.admin}/manage-tender/tender-status-report`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Terms Management", ["admin"], undefined, FaChevronDown, COLORS.orange, [
        createMenuItem("Manage Terms", ["admin"], `${BASE_URLS.admin}/manage-tender/manage-terms`, FaChevronCircleRight, COLORS.orange),
        createMenuItem("Add New Term", ["admin"], `${BASE_URLS.admin}/manage-tender/add-terms`, FaChevronCircleRight, COLORS.blue),
      ]),
    ]),
    createMenuItem("Bid Processing", ["admin"], undefined, FaChevronCircleRight, COLORS.yellow, [
      createMenuItem("Bid Evaluation", ["admin"], undefined, FaChevronDown, COLORS.orange, [
        createMenuItem("Technical Evaluation", ["admin"], `${BASE_URLS.admin}/manage-tender/addtechnicaldetails`, FaChevronCircleRight, COLORS.teal),
        createMenuItem("Financial Evaluation", ["admin"], `${BASE_URLS.admin}/manage-tender/addfinanicaldetails`, FaChevronCircleRight, COLORS.red),
        createMenuItem("Financial Bid Modification", ["admin"], `${BASE_URLS.admin}/manage-tender/addfinanicaldetails/modify`, FaChevronCircleRight, COLORS.red),
      ]),
      createMenuItem("Bidder Management", ["admin"], `${BASE_URLS.admin}/manage-tender/addbidderdetails`, FaChevronCircleRight, COLORS.yellow),
    ]),
    createMenuItem("Contract Management", ["admin"], undefined, FaChevronCircleRight, COLORS.indigo, [
      createMenuItem("Award Process", ["admin"], undefined, FaChevronDown, COLORS.red, [
        createMenuItem("Work Orders", ["admin"], `${BASE_URLS.admin}/manage-tender/workorderdetails`, FaChevronCircleRight, COLORS.red),
        createMenuItem("Contract Awards", ["admin"], `${BASE_URLS.admin}/manage-tender/awardofcontract`, FaChevronCircleRight, COLORS.indigo),
        createMenuItem("Awards Status", ["admin"], `${BASE_URLS.admin}/manage-tender/workorder-status`, FaChevronCircleRight, COLORS.indigo),
      ]),
      createMenuItem("Modifications", ["admin"], undefined, FaChevronDown, COLORS.pink, [
        createMenuItem("Tender Edits", ["admin"], `${BASE_URLS.admin}/manage-tender/edit`, FaChevronCircleRight, COLORS.orange),
        createMenuItem("Tender Cancellations", ["admin"], `${BASE_URLS.admin}/manage-tender/cancel-tender`, FaChevronCircleRight, COLORS.red),
        createMenuItem("Tender Corrigendum", ["admin"], `${BASE_URLS.admin}/manage-tender/corrigendum`, FaChevronCircleRight, COLORS.cyan),
        createMenuItem("Work Order Modification", ["admin"], `${BASE_URLS.admin}/manage-tender/workorder-modification`, FaChevronCircleRight, COLORS.indigo),
      ]),
    ]),
    createMenuItem("Quotation Management", ["admin"], undefined, FaChevronCircleRight, COLORS.green, [
      createMenuItem("Create Quotation", ["admin"], `${BASE_URLS.admin}/manage-qatation/create`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("View Quotations", ["admin"], `${BASE_URLS.admin}/manage-qatation/view`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Publish Quotations", ["admin"], `${BASE_URLS.admin}/manage-qatation/publish`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Comparative Statements", ["admin"], `${BASE_URLS.admin}/manage-qatation/comparative-statement`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Bidder Management", ["admin"], `${BASE_URLS.admin}/manage-qatation/bidders`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Published Quotations", ["admin"], `${BASE_URLS.admin}/manage-qatation/published`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Order Management", ["admin"], `${BASE_URLS.admin}/manage-qatation/orders`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Quotation Reports", ["admin"], `${BASE_URLS.admin}/manage-qatation/reports`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Payment Processing", ["admin"], `${BASE_URLS.admin}/manage-qatation/payment`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Vendor Relations", ["admin"], `${BASE_URLS.admin}/manage-qatation/vendor`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Quotation Status", ["admin"], `${BASE_URLS.admin}/manage-qatation/status`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Quotation Analytics", ["admin"], `${BASE_URLS.admin}/manage-qatation/analytics`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Print Quotations", ["admin"], `${BASE_URLS.admin}/manage-qatation/orders/print-menu`, FaChevronCircleRight, COLORS.green),
    ]),
  ]),

  // Finance & Accounting
  createMenuItem("Finance", ["admin"], undefined, MdMoney, COLORS.indigo, [
    createMenuItem("Transactions", ["admin"], undefined, FaChevronCircleRight, COLORS.indigo, [
      createMenuItem("Payment Records", ["admin"], `${BASE_URLS.admin}/addpaymentdetails`, FaChevronCircleRight, COLORS.indigo),
      createMenuItem("Edit Payment Details", ["admin"], `${BASE_URLS.admin}/editpaymentdetails`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Verify Payment Details", ["admin"], `${BASE_URLS.admin}/verifypaymentdetails`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Verify Deduction", ["admin"], `${BASE_URLS.admin}/verify-deduction`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Receipt Management", ["admin"], `${BASE_URLS.admin}/payments/receipts`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Compliance", ["admin"], undefined, FaChevronCircleRight, COLORS.red, [
      createMenuItem("Tax Compliance", ["admin"], undefined, FaChevronDown, COLORS.yellow, [
        createMenuItem("GST Register", ["admin"], `${BASE_URLS.admin}/register/gst-register`, FaChevronCircleRight, COLORS.red),
        createMenuItem("Income Tax", ["admin"], `${BASE_URLS.admin}/register/income-tax`, FaChevronCircleRight, COLORS.red),
      ]),
      createMenuItem("Deposits", ["admin"], undefined, FaChevronDown, COLORS.teal, [
        createMenuItem("Security Deposits", ["admin"], `${BASE_URLS.admin}/register/security`, FaChevronCircleRight, COLORS.yellow),
        createMenuItem("Earnest Money", ["admin"], `${BASE_URLS.admin}/register/earnest-money`, FaChevronCircleRight, COLORS.red),
      ]),
      createMenuItem("Ponds Inventory", ["admin"], `${BASE_URLS.admin}/register/ponds`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Pond Lease Register", ["admin"], `${BASE_URLS.admin}/register/pond-lease`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Reports & Analytics", ["admin"], undefined, MdAnalytics, COLORS.blue, [
      createMenuItem("Financial Reports", ["admin"], undefined, FaChartBar, COLORS.green, [
        createMenuItem("Budget Analysis", ["admin"], `${BASE_URLS.admin}/reports/budget`, FaChevronCircleRight, COLORS.blue),
        createMenuItem("Expenditure Summary", ["admin"], `${BASE_URLS.admin}/reports/expenditure`, FaChevronCircleRight, COLORS.green),
      ]),
      createMenuItem("Performance Metrics", ["admin"], `${BASE_URLS.admin}/reports/performance`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Other Reports", ["admin"], `${BASE_URLS.admin}/reports`, FaChevronCircleRight, COLORS.indigo),
    ]),
  ]),

  // Tubewell Management
  createMenuItem("Tubewell Management", ["admin"], undefined, MdBuild, COLORS.teal, [
    createMenuItem("Material Stock", ["admin"], `${BASE_URLS.admin}/tubewell/materials`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Mistri Management", ["admin"], `${BASE_URLS.admin}/tubewell/mistri`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Labor Rates", ["admin"], `${BASE_URLS.admin}/tubewell/labor-rate`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("Repair Requests", ["admin"], `${BASE_URLS.admin}/tubewell/requests`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Work Orders", ["admin"], `${BASE_URLS.admin}/tubewell/work-orders`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("Bills (Mustor)", ["admin"], `${BASE_URLS.admin}/tubewell/bills`, FaChevronCircleRight, COLORS.green),
  ]),

  // Community Services
  createMenuItem("Community Services", ["admin"], undefined, MdHolidayVillage, COLORS.cyan, [
    createMenuItem("Village Management", ["admin"], undefined, MdHolidayVillage, COLORS.cyan, [
      createMenuItem("Add Villages", ["admin"], `${BASE_URLS.admin}/manage-villages/add-village`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("View Villages", ["admin"], `${BASE_URLS.admin}/manage-villages/view`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Village Population", ["admin"], `${BASE_URLS.admin}/manage-villages/population`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Village Education", ["admin"], `${BASE_URLS.admin}/manage-villages/education`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Village Infrastructure", ["admin"], `${BASE_URLS.admin}/manage-villages/infrastructure`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Village Health", ["admin"], `${BASE_URLS.admin}/manage-villages/health`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Village Agriculture", ["admin"], `${BASE_URLS.admin}/manage-villages/agriculture`, FaChevronCircleRight, COLORS.cyan),
    ]),
    createMenuItem("Water Tanker Management", ["admin"], undefined, FaTruck, COLORS.blue, [
      createMenuItem("Service Fee Management", ["admin"], `${BASE_URLS.admin}/water-tanker/fees`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Tanker Scheduling", ["admin"], `${BASE_URLS.admin}/water-tanker/schedule`, FaChevronCircleRight, COLORS.yellow),
      createMenuItem("Tanker Requests", ["admin"], `${BASE_URLS.admin}/water-tanker/requests`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Tanker Maintenance", ["admin"], `${BASE_URLS.admin}/water-tanker/availability`, FaChevronCircleRight, COLORS.purple),
    ]),
  ]),

  // System & Administration
  createMenuItem("System", ["admin", "superadmin"], undefined, MdSettingsApplications, COLORS.gray, [
    createMenuItem("User Management", ["admin", "superadmin"], undefined, FaChevronCircleRight, COLORS.green, [
      createMenuItem("User Accounts", ["admin", "superadmin"], undefined, FaChevronDown, COLORS.blue, [
        createMenuItem("Create User", ["admin", "superadmin"], `${BASE_URLS.admin}/user/add`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Modify User", ["admin", "superadmin"], `${BASE_URLS.admin}/user/edit`, FaChevronCircleRight, COLORS.red),
      ]),
      createMenuItem("Directories", ["admin", "superadmin"], undefined, FaChevronDown, COLORS.purple, [
        createMenuItem("User Directory", ["admin", "superadmin"], `${BASE_URLS.admin}/user`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Staff Directory", ["admin", "superadmin"], `${BASE_URLS.admin}/staff`, FaChevronCircleRight, COLORS.red),
      ]),
      createMenuItem("Personnel Directory", ["admin", "superadmin"], `${BASE_URLS.admin}/viewmenberdetails`, FaChevronCircleRight, COLORS.purple),
    ]),
    createMenuItem("System Configuration", ["admin", "superadmin"], undefined, FaChevronCircleRight, COLORS.red, [
      createMenuItem("Services", ["admin", "superadmin"], undefined, FaChevronDown, COLORS.purple, [
        createMenuItem("Email Services", ["admin", "superadmin"], `${BASE_URLS.admin}/master/utils/emails-service`, FaChevronCircleRight, COLORS.purple),
        createMenuItem("Notifications", ["admin", "superadmin"], `${BASE_URLS.admin}/master/utils/notifications`, FaChevronCircleRight, COLORS.purple),
      ]),
      createMenuItem("Content", ["admin", "superadmin"], undefined, FaChevronDown, COLORS.teal, [
        createMenuItem("System Messages", ["admin", "superadmin"], `${BASE_URLS.admin}/master/addimpsmessage`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Forms Repository", ["admin", "superadmin"], `${BASE_URLS.admin}/master/uploadform`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Gallery Management", ["admin", "superadmin"], `${BASE_URLS.admin}/manage-gallery`, MdImage, COLORS.purple),
      ]),
      createMenuItem("Work Item Catalog", ["admin", "superadmin"], `${BASE_URLS.admin}/master/addworkitems`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Monitoring", ["admin", "superadmin"], undefined, FaChevronCircleRight, COLORS.cyan, [
      createMenuItem("Audit Logs", ["admin", "superadmin"], `${BASE_URLS.admin}/monitoring/audit-logs`, FaChevronCircleRight, COLORS.gray),
      createMenuItem("System Health", ["admin", "superadmin"], `${BASE_URLS.admin}/monitoring/health`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Integrations", ["admin", "superadmin"], undefined, MdImportantDevices, COLORS.indigo, [
      createMenuItem("Payment Gateways", ["admin", "superadmin"], `${BASE_URLS.admin}/integrations/payments`, FaChevronCircleRight, COLORS.green),
      createMenuItem("API Management", ["admin", "superadmin"], `${BASE_URLS.admin}/integrations/api`, FaChevronCircleRight, COLORS.red),
    ]),
    createMenuItem("Notice Management", ["admin"], undefined, MdAnnouncement, COLORS.indigo, [
      createMenuItem("Create Notice", ["admin"], `${BASE_URLS.admin}/notice/add`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("View Notices", ["admin"], `${BASE_URLS.admin}/notice/view`, FaChevronCircleRight, COLORS.cyan),
    ]),
  ]),
];

// =============== STAFF MENU ===============
// =============== STAFF MENU (ENHANCED) ===============
export const employeeMenuItems: MenuItemProps[] = [
  createMenuItem("Staff Dashboard", ["staff"], `${BASE_URLS.staff}/home`, MdDashboard, COLORS.blue),

  // Certificate Processing (expanded)
  createMenuItem("Certificate Processing", ["staff"], undefined, MdAssignment, COLORS.red, [
    createMenuItem("Inheritance Certificate", ["staff"], undefined, FaRegFileAlt, COLORS.yellow, [
      createMenuItem("Process Applications", ["staff"], `${BASE_URLS.staff}/warish/process`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Verify Assigned", ["staff"], `${BASE_URLS.staff}/warish/view-assigned`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Issue Certificate", ["staff"], `${BASE_URLS.staff}/warish/issue`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Apply Corrections", ["staff"], `${BASE_URLS.staff}/warish/apply-correction`, FaChevronCircleRight, COLORS.red),
    ]),
    createMenuItem("Land Conversion NOC", ["staff"], undefined, FaRegFileAlt, COLORS.green, [
      createMenuItem("New Applications", ["staff"], `${BASE_URLS.staff}/land-conversion/new`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Document Verification", ["staff"], `${BASE_URLS.staff}/land-conversion/verify`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Inspection Reports", ["staff"], `${BASE_URLS.staff}/land-conversion/inspection`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Linkage Certificate", ["staff"], undefined, FaRegFileAlt, COLORS.blue, [
      createMenuItem("Application Processing", ["staff"], `${BASE_URLS.staff}/linkage/process`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Ownership Verification", ["staff"], `${BASE_URLS.staff}/linkage/verify`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Bulk Processing", ["staff"], `${BASE_URLS.staff}/certificates/bulk`, HiDocumentDuplicate, COLORS.cyan),
    createMenuItem("Certificate Status", ["staff"], `${BASE_URLS.staff}/certificates/status`, MdAssessment, COLORS.purple),
    createMenuItem("Print Certificates", ["staff"], `${BASE_URLS.staff}/certificates/print`, MdPrint, COLORS.orange),
  ]),

  // Work & Tasks (expanded)
  createMenuItem("Work & Tasks", ["staff"], undefined, MdAssignmentTurnedIn, COLORS.cyan, [
    createMenuItem("My Tasks", ["staff"], `${BASE_URLS.staff}/tasks`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Team Tasks", ["staff"], `${BASE_URLS.staff}/tasks/team`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Task Calendar", ["staff"], `${BASE_URLS.staff}/tasks/calendar`, MdCalendarToday, COLORS.orange),
    createMenuItem("Work Orders", ["staff"], `${BASE_URLS.staff}/work-orders`, MdWork, COLORS.red),
    createMenuItem("Site Inspection Reports", ["staff"], `${BASE_URLS.staff}/inspections`, MdAssignment, COLORS.teal),
    createMenuItem("Task Reports", ["staff"], `${BASE_URLS.staff}/tasks/reports`, FaChartBar, COLORS.purple),
  ]),

  // Procurement & Tenders (new)
  createMenuItem("Procurement & Tenders", ["staff"], undefined, MdBusinessCenter, COLORS.purple, [
    createMenuItem("View Tenders", ["staff"], `${BASE_URLS.staff}/tenders/view`, MdSearch, COLORS.blue),
    createMenuItem("Bid Preparation", ["staff"], `${BASE_URLS.staff}/tenders/bid-prep`, MdAssignment, COLORS.green),
    createMenuItem("Vendor Communication", ["staff"], `${BASE_URLS.staff}/vendors/communication`, MdPeople, COLORS.orange),
    createMenuItem("Quotations", ["staff"], `${BASE_URLS.staff}/quotations`, MdReceipt, COLORS.cyan),
    createMenuItem("Contract Details", ["staff"], `${BASE_URLS.staff}/contracts`, FaFileContract, COLORS.red),
  ]),

  // Financial Tasks (new)
  createMenuItem("Financial Tasks", ["staff"], undefined, MdAttachMoney, COLORS.lime, [
    createMenuItem("Payment Processing", ["staff"], `${BASE_URLS.staff}/finance/payments`, MdPayment, COLORS.green),
    createMenuItem("Receipt Generation", ["staff"], `${BASE_URLS.staff}/finance/receipts`, MdReceipt, COLORS.blue),
    createMenuItem("Expense Reporting", ["staff"], `${BASE_URLS.staff}/finance/expenses`, MdAnalytics, COLORS.orange),
    createMenuItem("Budget Tracking", ["staff"], `${BASE_URLS.staff}/finance/budget`, MdInsertChart, COLORS.purple),
  ]),

  // Community Services (expanded)
  createMenuItem("Community Services", ["staff"], undefined, FaTruck, COLORS.blue, [
    createMenuItem("Village Management", ["staff"], undefined, MdHolidayVillage, COLORS.cyan, [
      createMenuItem("Mouza Details", ["staff"], `${BASE_URLS.staff}/village/mouza`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Sansad Details", ["staff"], `${BASE_URLS.staff}/village/sansad`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Member Details", ["staff"], `${BASE_URLS.staff}/village/member`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Population Entry", ["staff"], `${BASE_URLS.staff}/village/population`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Population Summary", ["staff"], `${BASE_URLS.staff}/village/population-summary`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Voter Details", ["staff"], `${BASE_URLS.staff}/village/voter`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Toilet Details", ["staff"], `${BASE_URLS.staff}/village/toilet`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Water Details", ["staff"], `${BASE_URLS.staff}/village/water`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Education Details", ["staff"], `${BASE_URLS.staff}/village/education`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Village Report", ["staff"], `${BASE_URLS.staff}/village/report`, FaChevronCircleRight, COLORS.cyan),
    ]),
    createMenuItem("Water Tanker Booking", ["staff"], `${BASE_URLS.staff}/water-tanker/booking`, FaChevronCircleRight, COLORS.yellow),
    createMenuItem("Service History", ["staff"], `${BASE_URLS.staff}/water-tanker/history`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Grievance Redressal", ["staff"], `${BASE_URLS.staff}/grievances`, MdFeedback, COLORS.orange),
    createMenuItem("Public Feedback", ["staff"], `${BASE_URLS.staff}/feedback`, MdAnnouncement, COLORS.green),
  ]),

  // Personal & Development (expanded)
  createMenuItem("Personal & Development", ["staff"], undefined, MdPersonAdd, COLORS.purple, [
    createMenuItem("Leave Management", ["staff"], undefined, FaChevronCircleRight, COLORS.pink, [
      createMenuItem("Apply Leave", ["staff"], `${BASE_URLS.staff}/leave/apply`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Leave Balance", ["staff"], `${BASE_URLS.staff}/leave/balance`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Leave History", ["staff"], `${BASE_URLS.staff}/leave/history`, FaChevronCircleRight, COLORS.orange),
    ]),
    createMenuItem("Attendance", ["staff"], `${BASE_URLS.staff}/attendance`, MdDateRange, COLORS.teal),
    createMenuItem("Training", ["staff"], undefined, FaChevronCircleRight, COLORS.purple, [
      createMenuItem("Available Courses", ["staff"], `${BASE_URLS.staff}/training/courses`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("My Certifications", ["staff"], `${BASE_URLS.staff}/training/certifications`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Training Calendar", ["staff"], `${BASE_URLS.staff}/training/calendar`, FaChevronCircleRight, COLORS.orange),
    ]),
    createMenuItem("Performance Review", ["staff"], `${BASE_URLS.staff}/performance`, MdAnalytics, COLORS.red),
  ]),

  // Reports & Analytics (new)
  createMenuItem("Reports & Analytics", ["staff"], undefined, MdAnalytics, COLORS.teal, [
    createMenuItem("Daily Reports", ["staff"], `${BASE_URLS.staff}/reports/daily`, FaChartBar, COLORS.blue),
    createMenuItem("Monthly Summaries", ["staff"], `${BASE_URLS.staff}/reports/monthly`, FaChartBar, COLORS.green),
    createMenuItem("Performance Metrics", ["staff"], `${BASE_URLS.staff}/reports/metrics`, MdAssessment, COLORS.purple),
    createMenuItem("Certificate Issuance", ["staff"], `${BASE_URLS.staff}/reports/certificates`, MdDescription, COLORS.orange),
    createMenuItem("Financial Reports", ["staff"], `${BASE_URLS.staff}/reports/finance`, MdMoney, COLORS.lime),
  ]),

  // Communication (new)
  createMenuItem("Communication", ["staff"], undefined, MdAnnouncement, COLORS.orange, [
    createMenuItem("Notifications", ["staff"], `${BASE_URLS.staff}/notifications`, MdNotifications, COLORS.red),
    createMenuItem("Announcements", ["staff"], `${BASE_URLS.staff}/announcements`, MdAnnouncement, COLORS.blue),
    createMenuItem("Calendar", ["staff"], `${BASE_URLS.staff}/calendar`, MdCalendarToday, COLORS.green),
    createMenuItem("Messages", ["staff"], `${BASE_URLS.staff}/messages`, MdFeedback, COLORS.purple),
  ]),

  // Document Management (new)
  createMenuItem("Document Management", ["staff"], undefined, MdFolder, COLORS.indigo, [
    createMenuItem("Document Upload", ["staff"], `${BASE_URLS.staff}/documents/upload`, MdCloudUpload, COLORS.blue),
    createMenuItem("Document Search", ["staff"], `${BASE_URLS.staff}/documents/search`, MdSearch, COLORS.green),
    createMenuItem("Document Archive", ["staff"], `${BASE_URLS.staff}/documents/archive`, MdFolder, COLORS.orange),
    createMenuItem("Templates", ["staff"], `${BASE_URLS.staff}/documents/templates`, MdDescription, COLORS.purple),
  ]),
];

// =============== AGENCY MENU ===============
export const agencyMenuItems: MenuItemProps[] = [
  createMenuItem("Dashboard", ["agency"], `${BASE_URLS.agency}/home`, MdDashboard, COLORS.blue),

  createMenuItem("Work Management", ["agency"], undefined, MdWork, COLORS.green, [
    createMenuItem("Assigned Works", ["agency"], `${BASE_URLS.agency}/works`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Work Progress Update", ["agency"], `${BASE_URLS.agency}/works/progress`, FaChevronCircleRight, COLORS.teal),
    createMenuItem("Upload Work Photos", ["agency"], `${BASE_URLS.agency}/works/photos`, MdImage, COLORS.orange),
    createMenuItem("Site Inspection Reports", ["agency"], `${BASE_URLS.agency}/works/inspection`, MdAssignment, COLORS.blue),
  ]),

  createMenuItem("Measurement & Billing", ["agency"], undefined, MdReceipt, COLORS.purple, [
    createMenuItem("Measurement Book", ["agency"], `${BASE_URLS.agency}/mb`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Bill Submission", ["agency"], `${BASE_URLS.agency}/bill/submit`, MdPayment, COLORS.green),
    createMenuItem("Bill Status", ["agency"], `${BASE_URLS.agency}/bill/status`, MdAnalytics, COLORS.orange),
    createMenuItem("Deduction Details", ["agency"], `${BASE_URLS.agency}/bill/deduction`, MdMoney, COLORS.red),
  ]),

  createMenuItem("Contract & AOC", ["agency"], undefined, MdDescription, COLORS.orange, [
    createMenuItem("AOC Details", ["agency"], `${BASE_URLS.agency}/aoc`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Agreement Documents", ["agency"], `${BASE_URLS.agency}/agreement`, FaFileContract, COLORS.red),
    createMenuItem("Security Deposit", ["agency"], `${BASE_URLS.agency}/security`, MdLock, COLORS.teal),
  ]),

  createMenuItem("Payments", ["agency"], undefined, MdPayment, COLORS.teal, [
    createMenuItem("Payment History", ["agency"], `${BASE_URLS.agency}/payments`, MdPayment, COLORS.green),
    createMenuItem("Pending Payments", ["agency"], `${BASE_URLS.agency}/payments/pending`, MdMoney, COLORS.red),
    createMenuItem("Receipts", ["agency"], `${BASE_URLS.agency}/payments/receipts`, MdReceipt, COLORS.blue),
  ]),

  createMenuItem("Documents", ["agency"], undefined, MdFolder, COLORS.indigo, [
    createMenuItem("Upload Documents", ["agency"], `${BASE_URLS.agency}/documents/upload`, MdCloudUpload, COLORS.blue),
    createMenuItem("My Documents", ["agency"], `${BASE_URLS.agency}/documents`, MdFolder, COLORS.green),
  ]),

  createMenuItem("Communication", ["agency"], undefined, MdAnnouncement, COLORS.cyan, [
    createMenuItem("Notices", ["agency"], `${BASE_URLS.agency}/notices`, MdAnnouncement, COLORS.orange),
    createMenuItem("Messages", ["agency"], `${BASE_URLS.agency}/messages`, MdFeedback, COLORS.blue),
    createMenuItem("Meeting Schedule", ["agency"], `${BASE_URLS.agency}/meetings`, MdCalendarToday, COLORS.green),
  ]),

  createMenuItem("Profile", ["agency"], `${BASE_URLS.agency}/profile`, MdAccountCircle, COLORS.purple),
];

// =============== SUPER ADMIN MENU ===============
export const superAdminMenuItems: MenuItemProps[] = [
  createMenuItem("Super Admin Dashboard", ["superadmin"], `${BASE_URLS.superadmin}/home`, MdDashboard, COLORS.blue),

  createMenuItem("System Management", ["superadmin"], undefined, MdSettingsApplications, COLORS.gray, [
    createMenuItem("API Management", ["superadmin"], undefined, MdApi, COLORS.purple, [
      createMenuItem("Generate API Key", ["superadmin"], `${BASE_URLS.superadmin}/apiKeyGenerator`, FaKey, COLORS.purple),
      createMenuItem("API Configuration", ["superadmin"], `${BASE_URLS.superadmin}/integrations/api`, FaChevronCircleRight, COLORS.red),
    ]),
    createMenuItem("User & Access Control", ["superadmin"], undefined, MdPeople, COLORS.green, [
      createMenuItem("User Accounts", ["superadmin"], `${BASE_URLS.superadmin}/user`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Access Controls", ["superadmin"], `${BASE_URLS.superadmin}/access-controls`, FaChevronCircleRight, COLORS.indigo),
      createMenuItem("Security Policies", ["superadmin"], `${BASE_URLS.superadmin}/security/policies`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Infrastructure", ["superadmin"], undefined, MdCloudUpload, COLORS.blue, [
      createMenuItem("Data Management", ["superadmin"], undefined, FaChevronCircleRight, COLORS.indigo, [
        createMenuItem("Backup & Restore", ["superadmin"], `${BASE_URLS.superadmin}/infrastructure/backup`, FaChevronCircleRight, COLORS.blue),
      ]),
      createMenuItem("Configuration", ["superadmin"], undefined, FaChevronCircleRight, COLORS.teal, [
        createMenuItem("Environment Settings", ["superadmin"], `${BASE_URLS.superadmin}/infrastructure/environment`, FaChevronCircleRight, COLORS.green),
        createMenuItem("System Defaults", ["superadmin"], `${BASE_URLS.superadmin}/infrastructure/defaults`, FaChevronCircleRight, COLORS.cyan),
      ]),
    ]),
    createMenuItem("Audit & Monitoring", ["superadmin"], undefined, MdSecurity, COLORS.red, [
      createMenuItem("Audit Logs", ["superadmin"], `${BASE_URLS.superadmin}/audit-logs`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("System Health", ["superadmin"], `${BASE_URLS.superadmin}/monitoring/health`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Menu Access Control", ["superadmin"], undefined, MdApartment, COLORS.yellow, [
      createMenuItem("Public User Menu", ["superadmin"], `${BASE_URLS.superadmin}/menu-acces-control/publicuser`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Employee Menu", ["superadmin"], `${BASE_URLS.superadmin}/menu-acces-control/employeeuser`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Admin Menu", ["superadmin"], `${BASE_URLS.superadmin}/menu-acces-control/adminuser`, FaChevronCircleRight, COLORS.purple),
    ]),
  ]),
];
