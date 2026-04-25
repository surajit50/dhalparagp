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

// =============== USER MENU ===============
export const publicUserMenuItems: MenuItemProps[] = [
  createMenuItem("Dashboard", ["user", "citizen"], `${BASE_URLS.user}/home`, MdDashboard, COLORS.blue),

  createMenuItem("Certificates", ["user", "citizen"], undefined, MdDescription, COLORS.red, [
    createMenuItem("Inheritance Certificate", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.yellow, [
      createMenuItem("Apply for Certificate", ["user", "citizen"], `${BASE_URLS.user}/warish/apply`, FaChevronCircleRight, COLORS.yellow),
      createMenuItem("Check Status", ["user", "citizen"], `${BASE_URLS.user}/warish/status`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Land Conversion NOC", ["user", "citizen"], `${BASE_URLS.user}/land-conversion/application`, FaRegFileAlt, COLORS.green),
    createMenuItem("Linkage Certificate", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.blue, [
      createMenuItem("Apply for Certificate", ["user", "citizen"], `${BASE_URLS.user}/linkage/apply`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Check Status", ["user", "citizen"], `${BASE_URLS.user}/linkage/status`, FaChevronCircleRight, COLORS.teal),
    ]),
    createMenuItem("Bulk Processing", ["user", "citizen"], `${BASE_URLS.user}/certificates/bulk`, HiDocumentDuplicate, COLORS.cyan),
    createMenuItem("Issuance Reports", ["user", "citizen"], `${BASE_URLS.user}/analytics/certificates/issuance`, FaChartBar, COLORS.blue),
  ]),

  createMenuItem("Samabyathi Scheme", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.green, [
    createMenuItem("Apply for Scheme", ["user", "citizen"], `${BASE_URLS.user}/samabyathi/apply`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Check Status", ["user", "citizen"], `${BASE_URLS.user}/samabyathi/status`, FaChevronCircleRight, COLORS.blue),
  ]),

  createMenuItem("Profile & Account", ["user", "citizen"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("Personal Information", ["user", "citizen"], undefined, MdPersonAdd, COLORS.indigo, [
      createMenuItem("View Profile", ["user", "citizen"], `${BASE_URLS.user}/profile/view`, FaChevronCircleRight, COLORS.indigo),
      createMenuItem("Edit Profile", ["user", "citizen"], `${BASE_URLS.user}/profile/edit`, FaChevronCircleRight, COLORS.pink),
    ]),
    createMenuItem("Security Settings", ["user", "citizen"], undefined, MdSecurity, COLORS.red, [
      createMenuItem("Change Password", ["user", "citizen"], `${BASE_URLS.user}/profile/change-password`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Two-Factor Auth", ["user", "citizen"], `${BASE_URLS.user}/profile/2fa`, FaChevronCircleRight, COLORS.orange),
    ]),
    createMenuItem("Notifications", ["user", "citizen"], `${BASE_URLS.user}/notifications`, MdNotifications, COLORS.pink),
  ]),

  createMenuItem("Financial Services", ["user", "citizen"], undefined, MdAttachMoney, COLORS.lime, [
    createMenuItem("Payments", ["user", "citizen"], undefined, MdPayment, COLORS.lime, [
      createMenuItem("Payment History", ["user", "citizen"], `${BASE_URLS.user}/payments/history`, FaChevronCircleRight, COLORS.lime),
      createMenuItem("Payment Methods", ["user", "citizen"], `${BASE_URLS.user}/payments/methods`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Receipts", ["user", "citizen"], `${BASE_URLS.user}/payments/receipts`, MdReceipt, COLORS.green),
  ]),

  createMenuItem("Support & Resources", ["user", "citizen"], undefined, MdHelp, COLORS.orange, [
    createMenuItem("Help Desk", ["user", "citizen"], undefined, MdFeedback, COLORS.orange, [
      createMenuItem("Submit Feedback", ["user", "citizen"], `${BASE_URLS.user}/feedback`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("File Complaint", ["user", "citizen"], `${BASE_URLS.user}/record-complaint`, FaChevronCircleRight, COLORS.red),
    ]),
    createMenuItem("Knowledge Base", ["user", "citizen"], undefined, MdLocalLibrary, COLORS.teal, [
      createMenuItem("FAQs", ["user", "citizen"], `${BASE_URLS.user}/resources/faqs`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("User Guides", ["user", "citizen"], `${BASE_URLS.user}/resources/user-guide`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Documents", ["user", "citizen"], `${BASE_URLS.user}/resources/documents`, MdFolder, COLORS.teal),
    createMenuItem("Announcements", ["user", "citizen"], `${BASE_URLS.user}/announcements`, MdAnnouncement, COLORS.red),
    createMenuItem("Calendar", ["user", "citizen"], `${BASE_URLS.user}/calendar`, MdCalendarToday, COLORS.red),
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
  //samabathy application
  createMenuItem("Samabyathi Application", ["admin"], undefined, FaRegFileAlt, COLORS.green, [
    createMenuItem("Verify Applications", ["admin"], `${baseUrl}/manage-samabyathi/verify`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("All Applications", ["admin"], `${baseUrl}/manage-samabyathi/applications`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Allotment", ["admin"], `${baseUrl}/manage-samabyathi/allotment`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Muster Roll", ["admin"], `${baseUrl}/manage-samabyathi/muster-roll`, FaChevronCircleRight, COLORS.green),
  ]),

  createMenuItem("Land Conversion NOC", ["admin"], undefined, FaRegFileAlt, COLORS.green, [
    createMenuItem("Application Lifecycle", ["admin"], undefined, FaChevronDown, COLORS.teal, [
      createMenuItem("New Application", ["admin"], `${baseUrl}/manage-land-conversion/application`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Document Verification", ["admin"], `${baseUrl}/manage-land-conversion/verify`, FaChevronCircleRight, COLORS.teal),
    ]),
    createMenuItem("Workflow & Inspection", ["admin"], undefined, FaChevronDown, COLORS.blue, [
      createMenuItem("Site Inspection", ["admin"], `${baseUrl}/manage-land-conversion/inspection`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Approval Workflow", ["admin"], `${baseUrl}/manage-land-conversion/approve`, FaChevronCircleRight, COLORS.purple),
    ]),
    createMenuItem("Output & Issuance", ["admin"], undefined, FaChevronDown, COLORS.green, [
      createMenuItem("NOC Issuance", ["admin"], `${baseUrl}/manage-land-conversion/issue`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Print Certificate", ["admin"], `${baseUrl}/manage-land-conversion/print`, FaChevronCircleRight, COLORS.cyan),
    ]),
    createMenuItem("Compliance", ["admin"], undefined, FaChevronDown, COLORS.red, [
      createMenuItem("Compliance Check", ["admin"], `${baseUrl}/manage-land-conversion/compliance`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),
  createMenuItem("Linkage Certificate", ["admin"], undefined, FaRegFileAlt, COLORS.blue, [
    createMenuItem("Application Lifecycle", ["admin"], undefined, FaChevronDown, COLORS.teal, [
      createMenuItem("New Application", ["admin"], `${baseUrl}/manage-linkage/application`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Document Validation", ["admin"], `${baseUrl}/manage-linkage/validate`, FaChevronCircleRight, COLORS.teal),
    ]),
    createMenuItem("Workflow", ["admin"], undefined, FaChevronDown, COLORS.blue, [
      createMenuItem("Ownership Verification", ["admin"], `${baseUrl}/manage-linkage/ownership`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Certificate Issuance", ["admin"], `${baseUrl}/manage-linkage/issue`, FaChevronCircleRight, COLORS.purple),
    ]),
    createMenuItem("Output", ["admin"], undefined, FaChevronDown, COLORS.green, [
      createMenuItem("Certificate Printing", ["admin"], `${baseUrl}/manage-linkage/print`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Renewal Process", ["admin"], `${baseUrl}/manage-linkage/renew`, FaChevronCircleRight, COLORS.orange),
    ]),
    createMenuItem("Monitoring", ["admin"], undefined, FaChevronDown, COLORS.red, [
      createMenuItem("Dispute Resolution", ["admin"], `${baseUrl}/manage-linkage/disputes`, FaChevronCircleRight, COLORS.red),
    ]),
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
  ]),
];

// Reusable Document Generation Structure
const documentGenerationItems = (baseUrl: string): MenuItemProps[] => [
  createMenuItem("Income Certificate", ["admin"], `${baseUrl}/generate-income`, FaRegFileAlt, COLORS.blue),
  createMenuItem("Residential Certificate", ["admin"], `${baseUrl}/generate-residential`, FaRegFileAlt, COLORS.green),
  createMenuItem("Caste Certificate", ["admin"], `${baseUrl}/generate-caste`, FaRegFileAlt, COLORS.orange),
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
      createMenuItem("Upload Work Photo", ["admin"], `${BASE_URLS.admin}/work-manage/upload-photo`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),

  // Certificate & Document Management (expanded)
  createMenuItem("Certificates & Documents", ["admin"], undefined, MdDescription, COLORS.red, [
    ...certificateManagementItems(BASE_URLS.admin),
    ...documentGenerationItems(BASE_URLS.admin),
  ]),

  // Financial Management (expanded)
  createMenuItem("Financial Management", ["admin"], undefined, MdAttachMoney, COLORS.green, [
    createMenuItem("Tax Collection", ["admin"], undefined, MdPayment, COLORS.blue, [
      createMenuItem("Collection Dashboard", ["admin"], `${BASE_URLS.admin}/tax-collection`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Arrear Management", ["admin"], `${BASE_URLS.admin}/tax-collection/arrears`, FaChevronCircleRight, COLORS.red),
    ]),
    createMenuItem("Expenditure Tracking", ["admin"], undefined, MdMoney, COLORS.green, [
      createMenuItem("Scheme Expenditure", ["admin"], `${BASE_URLS.admin}/expenditure/schemes`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Office Expenses", ["admin"], `${BASE_URLS.admin}/expenditure/office`, FaChevronCircleRight, COLORS.green),
    ]),
  ]),

  // APA Reports
  createMenuItem("APA Reports", ["admin"], undefined, MdAssessment, COLORS.purple, [
    ...apaReportItems(BASE_URLS.admin),
  ]),

  // Public Services
  createMenuItem("Public Services", ["admin"], undefined, MdPeople, COLORS.orange, [
    createMenuItem("Water Tanker Service", ["admin"], undefined, FaTruck, COLORS.blue, [
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
      createMenuItem("Staff Attendance Control", ["admin"], `${BASE_URLS.admin}/staff-attendance`, MdDateRange, COLORS.teal),
      createMenuItem("Leave Management", ["admin"], `${BASE_URLS.admin}/leave`, MdCalendarToday, COLORS.pink),
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

  createMenuItem("Profile & Account", ["admin"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("Security Settings", ["admin"], undefined, MdSecurity, COLORS.red, [
      createMenuItem("Change Password", ["admin"], `${BASE_URLS.admin}/profile/change-password`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),
];

// =============== STAFF MENU ===============
export const employeeMenuItems: MenuItemProps[] = [
  createMenuItem("Staff Dashboard", ["staff"], `${BASE_URLS.staff}/home`, MdDashboard, COLORS.blue),

  // Certificate Processing (expanded)
  createMenuItem("Certificate Processing", ["staff"], undefined, MdAssignment, COLORS.red, [
    createMenuItem("Inheritance Certificate", ["staff"], undefined, FaRegFileAlt, COLORS.yellow, [
      createMenuItem("New Application", ["staff"], `${BASE_URLS.staff}/manage-warish/application`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Document Upload", ["staff"], `${BASE_URLS.staff}/manage-warish/pending-uploaddoc`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Verification", ["staff"], `${BASE_URLS.staff}/manage-warish/verify-document`, FaChevronCircleRight, COLORS.teal),
    ]),
    createMenuItem("Land Conversion NOC", ["staff"], undefined, FaRegFileAlt, COLORS.green, [
      createMenuItem("New Application", ["staff"], `${BASE_URLS.staff}/manage-land-conversion/application`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Verification", ["staff"], `${BASE_URLS.staff}/manage-land-conversion/verify`, FaChevronCircleRight, COLORS.teal),
    ]),
    createMenuItem("Linkage Certificate", ["staff"], undefined, FaRegFileAlt, COLORS.blue, [
      createMenuItem("New Application", ["staff"], `${BASE_URLS.staff}/manage-linkage/application`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Validation", ["staff"], `${BASE_URLS.staff}/manage-linkage/validate`, FaChevronCircleRight, COLORS.teal),
    ]),
  ]),

  // Profile & Account
  createMenuItem("Profile & Account", ["staff"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("View Profile", ["staff"], `${BASE_URLS.staff}/profile`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("Performance Review", ["staff"], `${BASE_URLS.staff}/performance`, MdAnalytics, COLORS.red),
    createMenuItem("Security Settings", ["staff"], undefined, MdSecurity, COLORS.red, [
      createMenuItem("Change Password", ["staff"], `${BASE_URLS.staff}/profile/change-password`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),

  // Reports & Analytics
  createMenuItem("Reports & Analytics", ["staff"], undefined, MdAnalytics, COLORS.teal, [
    createMenuItem("Daily Reports", ["staff"], `${BASE_URLS.staff}/reports/daily`, FaChartBar, COLORS.blue),
    createMenuItem("Monthly Summaries", ["staff"], `${BASE_URLS.staff}/reports/monthly`, FaChartBar, COLORS.green),
    createMenuItem("Performance Metrics", ["staff"], `${BASE_URLS.staff}/reports/metrics`, MdAssessment, COLORS.purple),
    createMenuItem("Certificate Issuance", ["staff"], `${BASE_URLS.staff}/reports/certificates`, MdDescription, COLORS.orange),
    createMenuItem("Financial Reports", ["staff"], `${BASE_URLS.staff}/reports/finance`, MdMoney, COLORS.lime),
  ]),

  // Communication
  createMenuItem("Communication", ["staff"], undefined, MdAnnouncement, COLORS.orange, [
    createMenuItem("Notifications", ["staff"], `${BASE_URLS.staff}/notifications`, MdNotifications, COLORS.red),
    createMenuItem("Announcements", ["staff"], `${BASE_URLS.staff}/announcements`, MdAnnouncement, COLORS.blue),
    createMenuItem("Calendar", ["staff"], `${BASE_URLS.staff}/calendar`, MdCalendarToday, COLORS.green),
    createMenuItem("Messages", ["staff"], `${BASE_URLS.staff}/messages`, MdFeedback, COLORS.purple),
  ]),

  // Document Management
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
    createMenuItem("Upload Work Photos", ["agency"], `${BASE_URLS.agency}/works/photos`, MdImage, COLORS.orange),
  ]),

  createMenuItem("Certificates & Documents", ["admin"], undefined, MdDescription, COLORS.red, [
    ...documentGenerationItems(BASE_URLS.agency),
  ]),

  createMenuItem("Security Deposit", ["agency"], `${BASE_URLS.agency}/security`, MdLock, COLORS.teal),

  createMenuItem("Payments", ["agency"], undefined, MdPayment, COLORS.teal, [
    createMenuItem("Payment History", ["agency"], `${BASE_URLS.agency}/payments`, MdPayment, COLORS.green),
    createMenuItem("Pending Payments", ["agency"], `${BASE_URLS.agency}/payments/pending`, MdMoney, COLORS.red),
  ]),

  createMenuItem("Profile & Account", ["agency"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("View Profile", ["agency"], `${BASE_URLS.agency}/profile`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("Security Settings", ["agency"], undefined, MdSecurity, COLORS.red, [
      createMenuItem("Change Password", ["agency"], `${BASE_URLS.agency}/profile/change-password`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),
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

  createMenuItem("Profile & Account", ["superadmin"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("Security Settings", ["superadmin"], undefined, MdSecurity, COLORS.red, [
      createMenuItem("Change Password", ["superadmin"], `${BASE_URLS.superadmin}/profile/change-password`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),
];
