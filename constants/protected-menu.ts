import type { IconType } from "react-icons";
import {
  MdDashboard, MdAssessment, MdBusinessCenter, MdPeople, MdMoney,
  MdAssignment, MdPrint, MdSettingsCell, MdDescription, MdDateRange, MdAnnouncement,
  MdPersonAdd, MdSearch, MdFeedback, MdLocalLibrary, MdPayment,
  MdNotifications, MdCalendarToday, MdCloudUpload, MdApi, MdLock,
  MdSettingsApplications, MdSchool, MdAssignmentTurnedIn, MdHolidayVillage,
  MdWork, MdListAlt, MdAnalytics, MdReceipt, MdImportantDevices, MdBlock,

  MdHome, MdAccountCircle, MdSecurity, MdAttachMoney, MdHelp, MdFolder,
  MdInsertChart, MdGavel, MdDescription as MdDoc, MdApartment, MdImage, MdBuild, MdWater,
  MdLightbulb
} from "react-icons/md";
import { FaChevronCircleRight, FaChartBar, FaChevronDown, FaTruck, FaKey, FaMeetup, FaFileContract, FaRegFileAlt, FaRegListAlt } from "react-icons/fa";
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
  exact?: boolean;
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
  subItems: MenuItemProps[] = [],
  exact?: boolean
): MenuItemProps => ({
  menuItemText: text,
  menuItemLink: link,
  Icon,
  color,
  submenu: subItems.length > 0,
  subMenuItems: subItems,
  allowedRoles: roles,
  exact,
});

export const publicUserMenuItems: MenuItemProps[] = [
  createMenuItem("Dashboard", ["user", "citizen"], `${BASE_URLS.user}/home`, MdDashboard, COLORS.blue),

  createMenuItem("Certificates", ["user", "citizen"], undefined, MdDescription, COLORS.red, [
    createMenuItem("Inheritance Certificate", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.yellow, [
      createMenuItem("Apply for Certificate", ["user", "citizen"], `${BASE_URLS.user}/warish/apply`, FaChevronCircleRight, COLORS.yellow),
      createMenuItem("Check Status", ["user", "citizen"], `${BASE_URLS.user}/warish/status`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Land Conversion NOC", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.green, [
      createMenuItem("Apply for NOC", ["user", "citizen"], `${BASE_URLS.user}/land-conversion/apply`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Check Status", ["user", "citizen"], `${BASE_URLS.user}/land-conversion/status`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Linkage Certificate", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.blue, [
      createMenuItem("Apply for Certificate", ["user", "citizen"], `${BASE_URLS.user}/linkage/apply`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Check Status", ["user", "citizen"], `${BASE_URLS.user}/linkage/status`, FaChevronCircleRight, COLORS.teal),
    ]),
    createMenuItem("Puja NOC", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.orange, [
      createMenuItem("Apply for NOC", ["user", "citizen"], `${BASE_URLS.user}/puja-noc/apply`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Check Status", ["user", "citizen"], `${BASE_URLS.user}/puja-noc/status`, FaChevronCircleRight, COLORS.blue),
    ]),
    createMenuItem("Digital Birth & Death", ["user", "citizen"], undefined, FaRegFileAlt, COLORS.cyan, [
      createMenuItem("Apply for Certificate", ["user", "citizen"], `${BASE_URLS.user}/digital-certificate/apply`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Check Status & Print", ["user", "citizen"], `${BASE_URLS.user}/digital-certificate/status`, FaChevronCircleRight, COLORS.blue),
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

      createMenuItem("Correction Requests", ["admin"], `${baseUrl}/manage-warish/correction-requests`, FaChevronCircleRight, COLORS.red),
    ]),
  ]),
  //Parmanent Residenrial and warish includ 



  createMenuItem("Land Conversion NOC", ["admin"], undefined, FaRegFileAlt, COLORS.green, [
    createMenuItem("New Application", ["admin"], `${baseUrl}/manage-land-conversion/application`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Document Verification", ["admin"], `${baseUrl}/manage-land-conversion/verify`, FaChevronCircleRight, COLORS.teal),
    createMenuItem("Site Inspection", ["admin"], `${baseUrl}/manage-land-conversion/inspection`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Approval Workflow", ["admin"], `${baseUrl}/manage-land-conversion/approve`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("NOC Issuance", ["admin"], `${baseUrl}/manage-land-conversion/issue`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Print Certificate", ["admin"], `${baseUrl}/manage-land-conversion/print`, FaChevronCircleRight, COLORS.cyan),
    createMenuItem("Compliance Check", ["admin"], `${baseUrl}/manage-land-conversion/compliance`, FaChevronCircleRight, COLORS.red),
  ]),
  createMenuItem("Samabyathi Application", ["admin"], undefined, FaRegFileAlt, COLORS.green, [
    createMenuItem("Verify Applications", ["admin"], `${baseUrl}/manage-samabyathi/verify`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("All Applications", ["admin"], `${baseUrl}/manage-samabyathi/applications`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Allotment", ["admin"], `${baseUrl}/manage-samabyathi/allotment`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Muster Roll", ["admin"], `${baseUrl}/manage-samabyathi/muster-roll`, FaChevronCircleRight, COLORS.green),
  ]),



  createMenuItem("Puja/Festival NOC", ["admin"], undefined, FaRegFileAlt, COLORS.orange, [
    createMenuItem("Verify & Approve", ["admin"], `${baseUrl}/verify/puja-noc`, FaChevronCircleRight, COLORS.red),
    createMenuItem("NOC Dashboard", ["admin"], `${baseUrl}/generate/puja-noc?tab=dashboard`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Generate New NOC", ["admin"], `${baseUrl}/generate/puja-noc?tab=form`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Issued NOC Records", ["admin"], `${baseUrl}/generate/puja-noc?tab=history`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Settings", ["admin"], `${baseUrl}/generate/puja-noc?tab=settings`, FaChevronCircleRight, COLORS.purple),
  ]),
  createMenuItem("Birth Verification Report", ["admin"], `${baseUrl}/birth-verification`, FaRegFileAlt, COLORS.orange),
  createMenuItem("Digital Birth & Death", ["admin"], undefined, FaRegFileAlt, COLORS.cyan, [
    createMenuItem("Manage Applications", ["admin"], `${baseUrl}/manage-digital-certificate`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("New Application", ["admin"], `${baseUrl}/manage-digital-certificate/new`, FaChevronCircleRight, COLORS.green),
  ]),
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
];

export const adminMenuItems: MenuItemProps[] = [
  createMenuItem("Admin Dashboard", ["admin", "superadmin"], `${BASE_URLS.admin}/home`, MdDashboard, COLORS.blue),

  createMenuItem("Profile & Account", ["admin", "superadmin"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("View Profile", ["admin", "superadmin"], `${BASE_URLS.admin}/profile`, FaChevronCircleRight, COLORS.indigo),
    createMenuItem("Change Password", ["admin", "superadmin"], `${BASE_URLS.admin}/profile/change-password`, FaChevronCircleRight, COLORS.red),
  ]),

  // GP Plan Book
  createMenuItem("GP Plan Book", ["admin"], undefined, MdDoc, COLORS.teal, [
    // Budget Entry Forms
    createMenuItem("Budget Entry Forms", ["admin"], undefined, FaChevronCircleRight, COLORS.green, [
      createMenuItem("CCER Budget Entry", ["admin"], `${BASE_URLS.admin}/ccer-entry`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Budget Entry", ["admin"], `${BASE_URLS.admin}/reports/budget-entry`, FaChevronCircleRight, COLORS.green),
    ]),

    // Budget Print Section
    createMenuItem("Budget Print Section", ["admin"], undefined, FaChevronCircleRight, COLORS.blue, [
      createMenuItem("Form-35 (Artho o Parikalpana)", ["admin"], `${BASE_URLS.admin}/reports/form-35-artho`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Form-35 (KoPSB)", ["admin"], `${BASE_URLS.admin}/reports/form-35-kopsb`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Form-35 (SJ)", ["admin"], `${BASE_URLS.admin}/reports/form-35-sj`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Form-35(NoSU&Sk)", ["admin"], `${BASE_URLS.admin}/reports/form-35-nosu`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Form-35(SP)", ["admin"], `${BASE_URLS.admin}/reports/form-35-sp`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Sector wise Budget", ["admin"], `${BASE_URLS.admin}/reports/upasamiti-plan`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Form-36 (Receipts)", ["admin"], `${BASE_URLS.admin}/reports/form-36`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Form-36 (Expenditure)", ["admin"], `${BASE_URLS.admin}/reports/form-36-expenditure`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Form-37 (Notice)", ["admin"], `${BASE_URLS.admin}/reports/form-37`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Form-38", ["admin"], `${BASE_URLS.admin}/reports/form-38`, FaChevronCircleRight, COLORS.green),
      createMenuItem("SDG", ["admin"], `${BASE_URLS.admin}/reports/sdg`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Diagram", ["admin"], `${BASE_URLS.admin}/reports/diagram`, FaChevronCircleRight, COLORS.cyan),
    ]),
  ]),

  // Project & Works Management
  // Project & Works Management
  createMenuItem("Project Management", ["admin"], undefined, MdWork, COLORS.blue, [
    createMenuItem("Meeting Management", ["admin"], undefined, MdDateRange, COLORS.purple, [
      createMenuItem("All Meetings", ["admin"], `${BASE_URLS.admin}/meeting-manage`, MdCalendarToday, COLORS.blue),
      createMenuItem("Schedule Meeting", ["admin"], `${BASE_URLS.admin}/meeting-manage/add-meeting`, MdDateRange, COLORS.green),
      createMenuItem("Meeting Reports", ["admin"], `${BASE_URLS.admin}/meeting-manage/reports`, MdAssessment, COLORS.orange),
    ]),
    createMenuItem("Operations", ["admin"], undefined, MdWork, COLORS.red, [
      createMenuItem("Add Action Plan", ["admin"], `${BASE_URLS.admin}/work-manage/add`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Action Plans", ["admin"], `${BASE_URLS.admin}/work-manage/view`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Work Status Tracking", ["admin"], `${BASE_URLS.admin}/manage-tender/work-status-change`, FaChevronCircleRight, COLORS.indigo),
      createMenuItem("Fund Status", ["admin"], `${BASE_URLS.admin}/fundstatus`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Fund Details", ["admin"], `${BASE_URLS.admin}/fund-details`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Work Details", ["admin"], `${BASE_URLS.admin}/work-manage/scheme-wise`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Upload Work Photo", ["admin"], `${BASE_URLS.admin}/work-manage/upload-photo`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Work Photos Validation", ["admin"], `${BASE_URLS.admin}/work-manage/photos`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Work Estimate & Billing", ["admin"], undefined, MdReceipt, COLORS.teal, [
      createMenuItem("Estimate Preparation", ["admin"], `${BASE_URLS.admin}/work-manage/estimate-preparation`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("MB Create", ["admin"], `${BASE_URLS.admin}/work-manage/mb-create`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Bill Abstract", ["admin"], `${BASE_URLS.admin}/work-manage/bill-abstract`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Bill Deduction", ["admin"], `${BASE_URLS.admin}/work-manage/bill-deduction`, FaChevronCircleRight, COLORS.orange),
    ]),
    createMenuItem("Development Works", ["admin"], undefined, MdAssignmentTurnedIn, COLORS.orange, [

      createMenuItem("Manage Estimate Types", ["admin"], `${BASE_URLS.admin}/development-works/manage-estimate-types`, FaChevronCircleRight, COLORS.cyan),
      createMenuItem("Estimate Library", ["admin"], undefined, MdLocalLibrary, COLORS.teal, [
        createMenuItem("Library Items", ["admin"], `${BASE_URLS.admin}/development-works/estimate-library`, FaChevronCircleRight, COLORS.blue),
        createMenuItem("Add Item", ["admin"], `${BASE_URLS.admin}/development-works/estimate-library/add`, FaChevronCircleRight, COLORS.green),
        createMenuItem("Bulk Upload", ["admin"], `${BASE_URLS.admin}/development-works/estimate-library/bulk-upload`, FaChevronCircleRight, COLORS.orange),
        createMenuItem("Estimate Templates", ["admin"], `${BASE_URLS.admin}/work-manage/estimate-preparation/templates`, FaChevronCircleRight, COLORS.purple),
      ]),
    ]),
    createMenuItem("Approved Action Plans", ["admin"], undefined, MdListAlt, COLORS.green, [
      createMenuItem("Annual Plan Form", ["admin"], `${BASE_URLS.admin}/approvedactionplan`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Upasamiti Wise Report", ["admin"], `${BASE_URLS.admin}/reports/upasamiti-plan`, FaChevronCircleRight, COLORS.orange),
    ]),
  ]),

  // Certificate & Application Management
  createMenuItem(
    "Certificate & Application Management",
    ["admin", "superadmin"],
    undefined,
    MdDescription,
    COLORS.red,
    certificateManagementItems(BASE_URLS.admin)
  ),

  // Document Generation
  createMenuItem(
    "Document Generation",
    ["admin", "superadmin"],
    undefined,
    MdPrint,
    COLORS.indigo,
    documentGenerationItems(BASE_URLS.admin)
  ),

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
      createMenuItem("Tender Document Upload", ["admin"], `${BASE_URLS.admin}/manage-tender/document-upload`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Tender Status Report", ["admin"], `${BASE_URLS.admin}/manage-tender/tender-status-report`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Tender Report", ["admin"], `${BASE_URLS.admin}/manage-tender/report`, FaChevronCircleRight, COLORS.purple),
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
    createMenuItem("Procurement Management", ["admin"], undefined, FaChevronCircleRight, COLORS.green, [
      createMenuItem("Manage Categories", ["admin"], `${BASE_URLS.admin}/manage-quotation/categories`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Create Quotation", ["admin"], `${BASE_URLS.admin}/manage-quotation/create`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("View Quotations", ["admin"], `${BASE_URLS.admin}/manage-quotation/view`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Publish Quotations", ["admin"], `${BASE_URLS.admin}/manage-quotation/publish`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Comparative Statements", ["admin"], `${BASE_URLS.admin}/manage-quotation/comparative-statement`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Bidder Management", ["admin"], `${BASE_URLS.admin}/manage-quotation/bidders`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Published Quotations", ["admin"], `${BASE_URLS.admin}/manage-quotation/published`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Order Management", ["admin"], `${BASE_URLS.admin}/manage-quotation/orders`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Quotation Reports", ["admin"], `${BASE_URLS.admin}/manage-quotation/reports`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Payment Processing", ["admin"], `${BASE_URLS.admin}/manage-quotation/payment`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Vendor Relations", ["admin"], `${BASE_URLS.admin}/manage-quotation/vendor`, FaChevronCircleRight, COLORS.green),
      createMenuItem("Quotation Status", ["admin"], `${BASE_URLS.admin}/manage-quotation/status`, FaChevronCircleRight, COLORS.red),
      createMenuItem("Quotation Analytics", ["admin"], `${BASE_URLS.admin}/manage-quotation/analytics`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Print Quotations", ["admin"], `${BASE_URLS.admin}/manage-quotation/orders/print-menu`, FaChevronCircleRight, COLORS.green),
    ]),
  ]),

  //varios Enqury Report

  createMenuItem("Enquiry Report", ["admin"], undefined, FaRegListAlt, COLORS.green, [
    createMenuItem("Permanent Residential", ["admin"], `${BASE_URLS.admin}/enquiry-report`, FaChevronCircleRight, COLORS.orange, [], true),
    createMenuItem("Reprint Reports", ["admin"], `${BASE_URLS.admin}/enquiry-report/reprint`, FaChevronCircleRight, COLORS.blue),
  ]),

  // Content Management
  createMenuItem("Blog Management", ["admin"], undefined, MdAnnouncement, COLORS.orange, [
    createMenuItem("View All Posts", ["admin"], `${BASE_URLS.admin}/manage-blog`, FaChevronCircleRight, COLORS.green),
    createMenuItem("Add Blog Post", ["admin"], `${BASE_URLS.admin}/manage-blog/add`, FaChevronCircleRight, COLORS.blue),
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
        createMenuItem("Labour cess", ["admin"], `${BASE_URLS.admin}/register/lebour-cess`, FaChevronCircleRight, COLORS.green),



      ]),
      createMenuItem("Deposits", ["admin"], undefined, FaChevronDown, COLORS.teal, [
        createMenuItem("Security Deposits", ["admin"], `${BASE_URLS.admin}/register/security`, FaChevronCircleRight, COLORS.yellow),
        createMenuItem("Earnest Money", ["admin"], `${BASE_URLS.admin}/register/earnest-money`, FaChevronCircleRight, COLORS.red),
      ]),

    ]),
    createMenuItem("Reports & Analytics", ["admin"], undefined, MdAnalytics, COLORS.blue, [
      createMenuItem("Financial Reports", ["admin"], undefined, FaChartBar, COLORS.green, [
        createMenuItem("Budget Analysis", ["admin"], `${BASE_URLS.admin}/reports/budget`, FaChevronCircleRight, COLORS.blue),
        createMenuItem("Expenditure Summary", ["admin"], `${BASE_URLS.admin}/reports/expenditure`, FaChevronCircleRight, COLORS.green),
      ]),
      createMenuItem("Performance Metrics", ["admin"], `${BASE_URLS.admin}/reports/performance`, FaChevronCircleRight, COLORS.purple),
      createMenuItem("Internal Audit Report", ["admin"], `${BASE_URLS.admin}/reports/internal-audit`, FaChevronCircleRight, COLORS.orange),
      createMenuItem("Other Reports", ["admin"], `${BASE_URLS.admin}/reports`, FaChevronCircleRight, COLORS.indigo),
    ]),
  ]),

  // Pond Management System
  createMenuItem("Pond Management", ["admin"], undefined, MdWater, COLORS.cyan, [
    createMenuItem("Ponds Inventory", ["admin"], `${BASE_URLS.admin}/register/ponds`, FaChevronCircleRight, COLORS.blue),
    createMenuItem("Lease & Revenue", ["admin"], undefined, FaChevronDown, COLORS.green, [
      createMenuItem("Dashboard & Analytics", ["admin"], `${BASE_URLS.admin}/register/pond-lease?tab=dashboard`, FaChevronCircleRight, COLORS.teal),
      createMenuItem("Lease Records", ["admin"], `${BASE_URLS.admin}/register/pond-lease?tab=records`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Public Ponds", ["admin"], `${BASE_URLS.admin}/register/pond-lease?tab=public`, FaChevronCircleRight, COLORS.orange),
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

  // Street Light Register System
  createMenuItem("Street Light Register", ["admin"], undefined, MdLightbulb, COLORS.orange, [
    createMenuItem("Dashboard", ["admin"], `${BASE_URLS.admin}/street-lights`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Mouza Master", ["admin"], `${BASE_URLS.admin}/street-lights/mouza`, FaChevronCircleRight, COLORS.teal),
    createMenuItem("Light Register", ["admin"], undefined, FaChevronDown, COLORS.blue, [
      createMenuItem("All Lights", ["admin"], `${BASE_URLS.admin}/street-lights/register`, FaChevronCircleRight, COLORS.blue),
      createMenuItem("Add New Light", ["admin"], `${BASE_URLS.admin}/street-lights/register/add`, FaChevronCircleRight, COLORS.green),
    ]),
    createMenuItem("Complaints & Repairs", ["admin"], `${BASE_URLS.admin}/street-lights/complaints`, FaChevronCircleRight, COLORS.red),
    createMenuItem("Issue Work Orders", ["admin"], `${BASE_URLS.admin}/street-lights/work-orders`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Map View", ["admin"], `${BASE_URLS.admin}/street-lights/map`, FaChevronCircleRight, COLORS.indigo),
    createMenuItem("Reports", ["admin"], `${BASE_URLS.admin}/street-lights/reports`, FaChevronCircleRight, COLORS.purple),
    createMenuItem("Field Survey", ["admin", "staff"], `${BASE_URLS.admin}/street-lights/survey`, FaChevronCircleRight, COLORS.cyan),
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
    createMenuItem("Staff Attendance & Holidays", ["admin", "superadmin"], `${BASE_URLS.admin}/staff-attendance`, MdCalendarToday, COLORS.orange),
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
      createMenuItem("GP Profile Settings", ["admin", "superadmin"], `${BASE_URLS.admin}/settings/gp-profile`, FaChevronCircleRight, COLORS.blue),
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

  createMenuItem("Profile & Account", ["staff"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("View Profile", ["staff"], `${BASE_URLS.staff}/profile`, FaChevronCircleRight, COLORS.indigo),
    createMenuItem("Change Password", ["staff"], `${BASE_URLS.staff}/profile/change-password`, FaChevronCircleRight, COLORS.red),
  ]),

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

  // Street Light Management
  createMenuItem("Street Light Register", ["staff"], undefined, MdLightbulb, COLORS.orange, [
    createMenuItem("Assigned Complaints", ["staff"], `${BASE_URLS.staff}/street-lights/assigned`, FaChevronCircleRight, COLORS.red),
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

  createMenuItem("Street Light Survey and Repair", ["agency"], undefined, MdLightbulb, COLORS.orange, [
    createMenuItem("Survey Dashboard", ["agency"], `${BASE_URLS.agency}/street-lights`, FaChevronCircleRight, COLORS.orange),
    createMenuItem("Field Survey", ["agency"], `${BASE_URLS.agency}/street-lights/survey`, FaChevronCircleRight, COLORS.cyan),
    createMenuItem("Assigned Repairs", ["agency"], `${BASE_URLS.agency}/street-lights/repairs`, FaChevronCircleRight, COLORS.red),
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


  createMenuItem("Profile & Account", ["agency"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("View Profile", ["agency"], `${BASE_URLS.agency}/profile`, FaChevronCircleRight, COLORS.indigo),
    createMenuItem("Change Password", ["agency"], `${BASE_URLS.agency}/profile/change-password`, FaChevronCircleRight, COLORS.red),
  ]),
];

// =============== SUPER ADMIN MENU ===============
export const superAdminMenuItems: MenuItemProps[] = [
  createMenuItem("Super Admin Dashboard", ["superadmin"], `${BASE_URLS.superadmin}/home`, MdDashboard, COLORS.blue),

  createMenuItem("Profile & Account", ["superadmin"], undefined, MdAccountCircle, COLORS.purple, [
    createMenuItem("View Profile", ["superadmin"], `${BASE_URLS.superadmin}/profile`, FaChevronCircleRight, COLORS.indigo),
    createMenuItem("Change Password", ["superadmin"], `${BASE_URLS.superadmin}/profile/change-password`, FaChevronCircleRight, COLORS.red),
  ]),

  createMenuItem("Vouchers", ["superadmin"], "/vouchers", MdReceipt, COLORS.green),

  createMenuItem("Birth Verification Report", ["superadmin"], `${BASE_URLS.superadmin}/birth-verification`, FaRegFileAlt, COLORS.orange),

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
