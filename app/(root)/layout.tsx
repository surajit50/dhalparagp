import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import type { ReactNode } from "react";
import { AdUnit } from "@/components/adsense-provider";
import DigitalClock from "@/components/IndianClock";

interface Props {
  children: ReactNode;
}

export default function HomeLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header Section */}
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}

        {/* Main Content Section */}
        <main className="flex-grow overflow-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
