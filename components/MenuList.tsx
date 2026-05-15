"use client";

import { useState } from "react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Menu, ChevronRight } from "lucide-react";
import { gpnameinshort } from "@/constants/gpinfor";

// Assuming this is the structure of your menu items
const Panchayatwebsidemenu = [
  {
    title: "About Us",
    items: ["Overview", "History", "Leadership"],
  },
  {
    title: "Services",
    items: ["Birth Certificate", "Death Certificate", "Property Tax"],
  },
  {
    title: "Schemes",
    items: ["Rural Employment", "Education", "Healthcare"],
  },
  {
    title: "Contact",
    items: ["Office Address", "Phone Numbers", "Email"],
  },
];

const MenuList = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          Menu <Menu className="ml-2 h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 bg-orange-600 text-white">
            <h2 className="text-xl font-bold">
              {gpnameinshort} Gram Panchayat
            </h2>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            <Accordion type="single" collapsible className="w-full">
              {Panchayatwebsidemenu.map((section, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-medium">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="pl-4 space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Link
                            href="#"
                            className="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            <ChevronRight className="mr-2 h-4 w-4" />
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuList;
