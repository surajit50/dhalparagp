import "./globals.css";
import React, { ReactNode } from "react";
import Script from "next/script";
import "react-datepicker/dist/react-datepicker.css";
import { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { StoreProvider } from "./StoreProvider";
import { Toaster } from "@/components/ui/toaster";
import { ReactTanstankQuery } from "@/components/ReactTanstankQuery";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdSenseProvider } from "@/components/adsense-provider";
 
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import IndianClock from "@/components/IndianClock";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dhalparagp.in"),
  title: {
    default: "Dhalpara Gram Panchayat | Official Website",
    template: "%s | Dhalpara Gram Panchayat",
  },
  description:
    "Official website of Dhalpara Gram Panchayat, Hili Subdivision, Dakshin Dinajpur, West Bengal. Access government services, rural development programs, and panchayat information.",
  generator: "Next.js",
  applicationName: "Dhalpara Gram Panchayat Portal",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Dhalpara Gram Panchayat",
    "West Bengal Government",
    "Rural Development India",
    "Panchayati Raj Services",
    "Hili Subdivision",
    "Dakshin Dinajpur District",
    "Village Administration",
    "Public Services West Bengal",
    "Gram Panchayat Schemes",
    "Local Government India",
    "বাংলাদেশের গ্রাম পঞ্চায়েত",
    "পশ্চিমবঙ্গ সরকার",
  ],
  authors: [
    {
      name: "Dhalpara Gram Panchayat",
      url: "https://www.dhalparagp.in",
    },
    {
      name: "Government of West Bengal",
      url: "https://www.wb.gov.in",
    },
  ],
  creator: "Dhalpara Gram Panchayat",
  publisher: "Panchayati Raj Department, Government of West Bengal",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Dhalpara Gram Panchayat",
    url: "https://www.dhalparagp.in",
    title: "Dhalpara Gram Panchayat | Official Portal",
    description:
      "Access government services, development programs, and official information from Dhalpara Gram Panchayat, West Bengal",
    images: [
      {
        url: "https://res.cloudinary.com/dqkmkxgdo/image/upload/v1694944115/heroImage/heroImage_gctqcl.jpg",
        width: 1200,
        height: 630,
        alt: "Dhalpara Gram Panchayat Office Building",
      },
      {
        url: "/og-images/community-center.jpg",
        width: 800,
        height: 600,
        alt: "Community Center Facilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhalpara Gram Panchayat | स्थानीय सरकार सेवाएँ",
    description:
      "Official Twitter portal for Dhalpara Gram Panchayat services and updates",
    creator: "@DhalparaGP",
    site: "@WBGovernment",
    images: ["/social-banners/twitter-banner.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "7OCsme-YSWMmcZIhfBJl6a6746gMNRm0oRYQN1RCnhs",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Government",
  classification: "Gram Panchayat Website",
  alternates: {
    canonical: "https://www.dhalparagp.in",
    languages: {
      en: "https://www.dhalparagp.in/en",
      bn: "https://www.dhalparagp.in/bn",
      hi: "https://www.dhalparagp.in/hi",
    },
  },
  appleWebApp: {
    capable: true,
    title: "Dhalpara GP",
    statusBarStyle: "black-translucent",
  },
  other: {
    "geo.region": "IN-WB",
    "geo.placename": "Dakshin Dinajpur",
    "geo.position": "25.3755° N; 88.7742° E",
    "revisit-after": "7 days",
    copyright: "Copyright © 2024 Dhalpara Gram Panchayat",
    "og:email": "contact@dhalparagp.in",
    "og:phone_number": "+91 12345 67890",
    "fb:app_id": "YOUR_FACEBOOK_APP_ID",
    "twitter:site": "@DhalparaGP",
    "DC.title": "Dhalpara Gram Panchayat Portal",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#2b5797",
    "msapplication-config": "/browserconfig.xml",
  },
};

type Props = {
  children: ReactNode;
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Dhalpara Gram Panchayat",
  url: "https://www.dhalparagp.in",
  logo: "https://www.dhalparagp.in/logo.png",
  description: "Official government website of Dhalpara Gram Panchayat",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dhalpara, Hili Subdivision",
    addressLocality: "Dakshin Dinajpur",
    addressRegion: "West Bengal",
    postalCode: "733126",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-12345-67890",
    contactType: "customer service",
    email: "contact@dhalparagp.in",
    availableLanguage: ["en", "bn", "hi"],
  },
  sameAs: ["https://facebook.com/DhalparaGP", "https://twitter.com/DhalparaGP"],
};

export default async function RootLayout({ children }: Props) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
<meta name="google-adsense-account" content="ca-pub-8852774290896525" />
        <meta
          name="google-site-verification"
          content="7OCsme-YSWMmcZIhfBJl6a6746gMNRm0oRYQN1RCnhs"
        />
        <meta
          name="facebook-domain-verification"
          content="YOUR_FACEBOOK_DOMAIN_VERIFICATION"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactTanstankQuery>
            <StoreProvider>
              <SessionProvider session={session}>
                <Toaster />

                <AdSenseProvider
                  pId={
                    process.env.NEXT_PUBLIC_ADSENSE_PID || "ca-pub-8852774290896525"
                  }
                  enableAutoAds={true}
                >
                  <main>
                    
                    {children}
                  </main>
                </AdSenseProvider>
              </SessionProvider>
            </StoreProvider>
          </ReactTanstankQuery>
        </ThemeProvider>
      </body>
    </html>
  );
}
