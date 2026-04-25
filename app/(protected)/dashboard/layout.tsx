import Header from "@/components/protectedComponent/Header";
import UnifiedSidebar from "@/components/protectedComponent/unified-sidebar";
import "react-datepicker/dist/react-datepicker.css";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 flex">

      {/* Sidebar */}
      <UnifiedSidebar role="user" />

      {/* Content Area */}
      <div className="flex flex-col flex-1 lg:ml-72">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <Header />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* Page Content */}
            <div className="space-y-6">
              {children}
            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
