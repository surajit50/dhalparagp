import Header from "@/components/protectedComponent/Header"
import UnifiedSidebar from "@/components/protectedComponent/unified-sidebar"
import "react-datepicker/dist/react-datepicker.css";

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background w-full overflow-hidden">
      <UnifiedSidebar role="staff" />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden pt-12 pl-12 sm:pt-16 sm:pl-16 lg:pt-0 lg:pl-0 lg:ml-72">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/20" style={{ height: 'calc(100vh - 4rem)' }}>
          <div className="container mx-auto pl-0 pr-4 sm:pl-0 sm:pr-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 max-w-full">
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
