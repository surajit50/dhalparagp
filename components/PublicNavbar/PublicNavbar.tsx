"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  submenu?: NavItem[];
}

interface PublicNavbarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "/aboutus",
    submenu: [
      { name: "Our History", href: "/aboutus/history" },
      { name: "Team", href: "/aboutus/team" },
      { name: "Vision & Mission", href: "/aboutus/vision-mission" },
      { name: "Achievements", href: "/aboutus/achivement" },
    ],
  },
  {
    name: "Services",
    href: "/services",
    submenu: [
      {
        name: "E-Governance",
        href: "/services/egovernance",
        submenu: [
          {
            name: "Online Applications",
            href: "/services/e-governance/applications",
          },
          {
            name: "Document Verification",
            href: "/services/e-governance/verification",
          },
          {
            name: "Grievance Redressal",
            href: "/services/e-governance/grievance",
          },
        ],
      },
      {
        name: "Social Welfare",
        href: "/services/social-welfare",
        submenu: [
          {
            name: "Pension Schemes",
            href: "/services/social-welfare/pension",
          },
          {
            name: "Education Support",
            href: "/services/social-welfare/education",
          },
          {
            name: "Healthcare Initiatives",
            href: "/services/social-welfare/healthcare",
          },
        ],
      },
      { name: "Infrastructure Development", href: "/services/infrastructure" },
    ],
  },
  {
    name: "Population",
    href: "/populationinfo",
    submenu: [
      { name: "Demographics", href: "/populationinfo/demographics" },
      { name: "Census Data", href: "/populationinfo/census" },
      { name: "Population Trends", href: "/populationinfo/trends" },
    ],
  },
  {
    name: "Development",
    href: "/development",
    submenu: [
      { name: "Agriculture", href: "/development/agriculture" },
      { name: "Rural Industries", href: "/development/rural-industries" },
      { name: "Skill Development", href: "/development/skill-development" },
      { name: "Women Empowerment", href: "/development/women-empowerment" },
    ],
  },
  {
    name: "Tender",
    href: "/tender",
    submenu: [
      { name: "Current Tenders", href: "/tender/current" },
      { name: "Past Tenders", href: "/tender/past" },
      { name: "How to Apply", href: "/tender/how-to-apply" },
      { name: "Tender Guidelines", href: "/tender/guidelines" },
    ],
  },
  {
    name: "Resources",
    href: "/resources",
    submenu: [
      { name: "Forms & Documents", href: "/resources/forms" },
      { name: "Acts & Rules", href: "/resources/acts-rules" },
      { name: "Reports", href: "/resources/reports" },
      { name: "FAQs", href: "/resources/faqs" },
    ],
  },
  { name: "Contact Us", href: "/contact" },
];

function DropdownMenu({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "text-primary bg-primary/10"
            : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
        )}
      >
        <span>{item.name}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-70 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && item.submenu && (
          <div
            
            className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-lg border bg-popover p-1.5 shadow-md"
          >
            {item.submenu.map((subItem) => (
              <div key={subItem.name}>
                {subItem.submenu ? (
                  <NestedDropdown item={subItem} />
                ) : (
                  <Link
                    href={subItem.href}
                    className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {subItem.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NestedDropdown({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const nestedRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative"
      ref={nestedRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent/50 transition-colors cursor-default">
        <span>{item.name}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-70" />
      </div>

      <AnimatePresence>
        {isOpen && item.submenu && (
          <div className="absolute left-full top-0 ml-1 min-w-[200px] rounded-lg border bg-popover p-1.5 shadow-md">
            <div>
              {item.submenu.map((subItem) => (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenuItem({ item }: { item: NavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (item.submenu) {
    return (
      <div className="border-b border-border/10 last:border-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-3 py-3 text-sm font-medium hover:bg-accent/30 transition-colors"
        >
          <span>{item.name}</span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <div
              
              className="overflow-hidden"
            >
              <div className="ml-4 border-l border-border/20 pl-2 py-1">
                {item.submenu.map((subItem) => (
                  <MobileMenuItem key={subItem.name} item={subItem} />
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "block px-3 py-3 text-sm font-medium transition-colors hover:bg-accent/30",
        pathname === item.href
          ? "text-primary bg-primary/5"
          : "text-foreground/80"
      )}
    >
      {item.name}
    </Link>
  );
}

export function PublicNavbar({ className, ...props }: PublicNavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "relative z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
      {...props}
    >
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return item.submenu ? (
            <DropdownMenu key={item.name} item={item} isActive={isActive} />
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-foreground/80 hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-accent/50 h-8 w-8"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm sm:w-[300px] p-0"
          >
            <nav className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto py-3">
                {navItems.map((item) => (
                  <MobileMenuItem key={item.name} item={item} />
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default PublicNavbar;
