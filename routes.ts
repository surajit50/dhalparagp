/**
 *
 *@type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verify"];

/**
 *
 *@type {string[]}
 */

export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 *
 *@type {string}
 */

export const apiAuthPrefix = "/api/auth";

/**
 *
 *@type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = "/dashboard/home";
export const DEFAULT_ADMINLOGIN_REDIRECT = "/admindashboard/home";
export const DEFAULT_STAFFLOGIN_REDIRECT = "/employeedashboard/home";
export const DEFAULT_AGENCYLOGIN_REDIRECT = "/agencydashboard";
export const DEFAULT_SUPERADMINLOGIN_REDIRECT = "/superadmindashboard";
