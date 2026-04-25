"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanchayatwebsidemenuProps } from "@/constants";

export const PublicSubmenuItem = ({
  submenus,
  showSubMenu,
}: {
  submenus: PanchayatwebsidemenuProps[];
  showSubMenu: boolean;
}) => {
  return (
    <ul
      className={`ml-4 mt-1 space-y-1 transition-all duration-300 ${
        showSubMenu ? "block" : "hidden"
      }`}
    >
      {submenus.map((submenuitem, subindex) => (
        <PublicMenuItem items={submenuitem} key={subindex} />
      ))}
    </ul>
  );
};

export const PublicMenuItem = ({
  items,
}: {
  items: PanchayatwebsidemenuProps;
}) => {
  const [showSubMenu, setShowSubMenu] = useState(false);
  const pathname = usePathname();

  return (
    <li className="px-3 py-2 hover:bg-[#1e40af] transition">
      {items.submenu ? (
        <div>
          <button
            className="flex justify-between w-full text-left text-white text-sm font-medium"
            onClick={() => setShowSubMenu(!showSubMenu)}
          >
            {items.menuItemText}
          </button>
          <PublicSubmenuItem
            submenus={items.subMenuItems}
            showSubMenu={showSubMenu}
          />
        </div>
      ) : (
        <Link href={items.menuItemLink || ""}>
          <span
            className={`text-sm font-medium text-white ${
              pathname === items.menuItemLink
                ? "underline font-semibold"
                : ""
            }`}
          >
            {items.menuItemText}
          </span>
        </Link>
      )}
    </li>
  );
};
