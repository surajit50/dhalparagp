import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Retrieve user role directly from NextAuth session to be 100% edge-safe and prevent database / Prisma calls in middleware
  const user = req.auth?.user?.role;

  // ⭐ EDGE SAFE MAINTENANCE CHECK
  const isMaintenance = process.env.MAINTENANCE_MODE === "true";

  // ⭐ Superadmin bypass maintenance
  if (isMaintenance && user !== "superadmin") {
    if (!nextUrl.pathname.startsWith("/maintenance")) {
      return Response.redirect(new URL("/maintenance", nextUrl));
    }
  }

  const admindashboard = nextUrl.pathname.startsWith("/admindashboard");
  const staffdashboard = nextUrl.pathname.startsWith("/employeedashboard");
  const publicdashboard = nextUrl.pathname.startsWith("/dashboard");
  const superadmindashboard = nextUrl.pathname.startsWith("/superadmindashboard");
  const agencydashboard = nextUrl.pathname.startsWith("/agencydashboard");

  // Redirect if accessing a protected dashboard but role doesn't match
  if (admindashboard && user !== "admin") {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (staffdashboard && user !== "staff") {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (publicdashboard && user !== "user") {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (superadmindashboard && user !== "superadmin") {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (agencydashboard && user !== "agency") {
    return Response.redirect(new URL("/", nextUrl));
  }

  // Redirect to home page if trying to access any protected dashboard when not logged in
  if (!isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admindashboard/:path*",
    "/employeedashboard/:path*",
    "/superadmindashboard/:path*",
    "/agencydashboard/:path*",
  ],
};
