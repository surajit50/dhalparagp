"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronDown,
  ChevronUp,
  Menu,
  User,
  X,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  publicUserMenuItems,
  adminMenuItems,
  employeeMenuItems,
  superAdminMenuItems,
  agencyMenuItems,
  type MenuItemProps,
} from "@/constants/protected-menu";
import type { RootState } from "@/redux/store";
import { toggleMenu } from "@/redux/slices/menuSlice";


type Role = "user" | "admin" | "staff" | "superadmin" | "agency";

interface DashboardConfig {
  title: string;
  items: MenuItemProps[];
}

const DASHBOARD_CONFIG: Record<Role, DashboardConfig> = {
  user: { title: "User Dashboard", items: publicUserMenuItems },
  admin: { title: "Admin Portal", items: adminMenuItems },
  staff: { title: "Staff Portal", items: employeeMenuItems },
  superadmin: { title: "Super Admin Portal", items: superAdminMenuItems },
  agency: { title: "Agency Portal", items: agencyMenuItems },
};

function isActivePath(pathname: string, link?: string): boolean {
  if (!link || link === "#") return false;
  return pathname === link || pathname.startsWith(link + "/");
}

/* ===========================
   Menu Item Component
=========================== */
function MenuItem({
  item,
  pathname,
  level = 0,
}: {
  item: MenuItemProps;
  pathname: string;
  level?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const isActive = isActivePath(pathname, item.menuItemLink);

  const hasActiveChild =
    item.subMenuItems?.some(
      (sub) =>
        isActivePath(pathname, sub.menuItemLink) ||
        sub.subMenuItems?.some((subSub) =>
          isActivePath(pathname, subSub.menuItemLink),
        ),
    ) || false;

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  const handleNavigation = () => {
    if (item.submenu) {
      setIsOpen(!isOpen);
      return;
    }

    if (item.menuItemLink && item.menuItemLink !== "#") {
      router.push(item.menuItemLink);
    }
  };

  return (
    <div className="mb-1 px-2">
      <Button
        variant="ghost"
        onClick={handleNavigation}
        className={cn(
          "w-full justify-start px-3 py-2 text-sm transition-all duration-200 group relative overflow-hidden",
          "hover:bg-blue-50/80 hover:text-blue-700",
          isActive
            ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-200 hover:bg-blue-700 hover:text-white"
            : "text-slate-600",
          level > 0 ? "pl-9 rounded-md" : "rounded-lg",
        )}
      >
        <div className="flex items-center w-full gap-1 text-left">
          {item.Icon && (
            <item.Icon
              className={cn(
                "w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : item.color || "text-slate-500",
              )}
            />
          )}

          <span className="flex-1 truncate">{item.menuItemText}</span>

          {item.submenu && (
            <div
              className={cn(
                "transition-transform duration-200",
                isOpen ? "rotate-180" : "",
              )}
            >
              <ChevronDown
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-white" : "text-slate-400",
                )}
              />
            </div>
          )}
        </div>
      </Button>

      {item.submenu && isOpen && (
        <div className="ml-5 mt-1 border-l-2 border-slate-100 pl-2 space-y-1">
          {item.subMenuItems.map((subItem) => (
            <MenuItem
              key={subItem.menuItemText}
              item={subItem}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===========================
   Sidebar Content
=========================== */
function SidebarContent({
  role,
  pathname,
  onClose,
}: {
  role: Role;
  pathname: string;
  onClose?: () => void;
}) {
  const config = DASHBOARD_CONFIG[role];

  return (
    <div className="w-72 h-screen flex flex-col bg-white border-r border-slate-200 fixed left-0 top-0 z-30 shadow-sm">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <h1 className="text-lg font-bold">D</h1>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-900 leading-none">
              {config.title}
            </h1>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
              Management Portal
            </span>
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </header>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-0 py-4">
        <div className="px-4 mb-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {config.items.map((item) => (
              <MenuItem
                key={item.menuItemText}
                item={item}
                pathname={pathname}
              />
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Footer Profile Section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-slate-200 hover:shadow-sm">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              Administrator
            </p>
            <p className="text-xs text-slate-500 truncate capitalize">{role}</p>
          </div>

          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-slate-400 hover:text-blue-600"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full mt-3 justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg py-2 h-9 text-sm transition-colors group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}

/* ===========================
   Main Export
=========================== */
export default function UnifiedSidebar({ role = "user" }: { role?: Role }) {
  const isMenuOpen = useSelector((state: RootState) => state.menu.isOpen);
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleToggle = () => {
    dispatch(toggleMenu());
    setIsMobileOpen(!isMobileOpen);
  };

  const handleClose = () => {
    setIsMobileOpen(false);
    dispatch(toggleMenu());
  };

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggle}
              className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl w-10 h-10 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="p-0 w-72 bg-white border-r border-slate-200"
          >
            <SidebarContent
              role={role}
              pathname={pathname}
              onClose={handleClose}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <SidebarContent role={role} pathname={pathname} />
      </div>
    </>
  );
}
