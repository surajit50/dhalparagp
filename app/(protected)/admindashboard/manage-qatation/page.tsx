import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Eye,
  FileCheck2,
  ShoppingCart,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  ClipboardList,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils";

export default async function QuotationDashboardPage() {
  // Fetch stats and latest quotations directly from DB
  const [totalQuotes, draftsCount, publishedCount, closedCount, latestQuotes, totalOrders] = await Promise.all([
    db.quotation.count(),
    db.quotation.count({ where: { status: "DRAFT" } }),
    db.quotation.count({ where: { status: "PUBLISHED" } }),
    db.quotation.count({ where: { status: "CLOSED" } }),
    db.quotation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    db.order.count(),
  ]);

  const totalValueAggregate = await db.quotation.aggregate({
    _sum: {
      estimatedAmount: true,
    },
  });
  const totalValue = totalValueAggregate._sum.estimatedAmount || 0;

  const statCards = [
    {
      title: "Draft Notices",
      value: draftsCount,
      description: "Saved as draft, ready to publish",
      color: "text-amber-600 border-amber-100 bg-amber-50/50",
      icon: FileText,
    },
    {
      title: "Active Published",
      value: publishedCount,
      description: "Accepting bids from vendors",
      color: "text-emerald-600 border-emerald-100 bg-emerald-50/50",
      icon: FileCheck2,
    },
    {
      title: "Closed / Awarded",
      value: closedCount,
      description: "Closed bidding periods",
      color: "text-blue-600 border-blue-100 bg-blue-50/50",
      icon: FolderOpen,
    },
    {
      title: "Purchase Orders",
      value: totalOrders,
      description: "Orders issued to selected vendors",
      color: "text-purple-600 border-purple-100 bg-purple-50/50",
      icon: ShoppingCart,
    },
  ];

  const quickLinks = [
    {
      title: "Create Quotation",
      description: "Launch new WORK, SUPPLY, or SALE notice",
      href: "/admindashboard/manage-qatation/templates",
      icon: Plus,
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    },
    {
      title: "View All Notices",
      description: "Edit, delete, and inspect all draft/active notices",
      href: "/admindashboard/manage-qatation/view",
      icon: Eye,
      color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100",
    },
    {
      title: "Publish Notices",
      description: "Verify details and publish active draft notices",
      href: "/admindashboard/manage-qatation/publish",
      icon: FileCheck2,
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
    },
    {
      title: "Comparative Statements",
      description: "Compare bidder quotes and select winning bids",
      href: "/admindashboard/manage-qatation/comparative-statement",
      icon: ClipboardList,
      color: "text-sky-600 bg-sky-50 hover:bg-sky-100",
    },
    {
      title: "Order Management",
      description: "Generate and view work/supply purchase orders",
      href: "/admindashboard/manage-qatation/orders",
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Reports & Analytics",
      description: "Detailed summary charts and compliance registers",
      href: "/admindashboard/manage-qatation/reports",
      icon: TrendingUp,
      color: "text-rose-600 bg-rose-50 hover:bg-rose-100",
    },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Header section with page summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
            Quotation Management
          </h1>
          <p className="text-muted-foreground mt-2 text-base max-w-2xl">
            Overview of Gram Panchayat procurement tenders, item sales, comparative evaluation, and purchase order tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="shadow-sm">
            <Link href="/admindashboard/manage-qatation/templates">
              <Plus className="h-4 w-4 mr-2" />
              New Quotation
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-md transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {card.title}
                    </p>
                    <p className="text-3xl font-extrabold text-foreground tracking-tight">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1 font-medium">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Quick links + Latest activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Links Section */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              <CardDescription>
                Direct access links to manage various parts of the quotation lifecycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map((link) => {
                  const LinkIcon = link.icon;
                  return (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="group flex gap-4 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-all duration-200"
                    >
                      <div className={`p-3 rounded-xl transition-colors ${link.color}`}>
                        <LinkIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          {link.title}
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotations Section */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Recent Notices</CardTitle>
                <CardDescription>
                  Latest notices created in the system.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/admindashboard/manage-qatation/view" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {latestQuotes.length > 0 ? (
                <div className="space-y-4">
                  {latestQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-muted-foreground truncate">
                            {quote.nitNo}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 font-medium ${
                              quote.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : quote.status === "CLOSED"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {quote.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {quote.workName}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(quote.nitDate)} • {formatCurrency(quote.estimatedAmount)}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" asChild className="h-8 w-8 rounded-full shrink-0">
                        <Link href={`/admindashboard/manage-qatation/view/${quote.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No quotations found.</p>
                  <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link href="/admindashboard/manage-qatation/templates">Create First Quotation</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
