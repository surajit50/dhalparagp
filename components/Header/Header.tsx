
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun } from "lucide-react";
import PublicNavbar from "../PublicNavbar/PublicNavbar";
import MenuList from "../MenuList";
import DigitalClock from "../DigitalClock";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3">
        {/* Top Navbar */}
        <div className="flex justify-between items-center py-1.5 border-b">
          <div className="flex items-center space-x-2">
            
          </div>
          <div className="flex items-center space-x-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="hover:bg-accent h-8 w-8"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            <Link href="/auth/login" passHref>
              <Button
                variant="outline"
                size="sm"
                className="text-primary hover:bg-primary hover:text-primary-foreground transition-colors h-8"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Logo and Main Navigation */}
        <div className="flex justify-between items-center py-2">
          <Link
            href="/"
            className="flex-shrink-0 hover:opacity-90 transition-opacity"
            aria-label="Home"
          >
            <Image
              src="/images/logo.png"
              width={70}
              height={25}
              alt="Dhalpara Gram Panchayat Logo"
              sizes="(max-width: 768px) 50px, 70px"
              priority
              className="object-contain"
            />
          </Link>

          {/* Public Navbar */}
          <nav aria-label="Main navigation" className="md:block">
            <PublicNavbar />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
