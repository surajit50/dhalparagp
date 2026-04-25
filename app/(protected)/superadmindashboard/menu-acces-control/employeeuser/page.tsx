"use client";
import {
  employeeMenuItems,
  type MenuItemProps,
} from "@/constants/protected-menu";
import { JSX } from "react";

function renderMenu(items: MenuItemProps[]): JSX.Element {
  return (
    <ul className="pl-4 list-disc">
      {items.map((item) => (
        <li key={item.menuItemText} className="mb-2">
          <div>
            <span className="font-semibold">{item.menuItemText}</span>
            {item.menuItemLink && (
              <span className="ml-2 text-blue-600 text-xs">
                [{item.menuItemLink}]
              </span>
            )}
            <span className="ml-2 text-gray-500 text-xs">
              Roles: {item.allowedRoles?.join(", ")}
            </span>
          </div>
          {item.submenu &&
            item.subMenuItems?.length > 0 &&
            renderMenu(item.subMenuItems)}
        </li>
      ))}
    </ul>
  );
}

export default function EmployeeUserMenuAccessPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Employee User Menu Access</h1>
      {renderMenu(employeeMenuItems)}
    </div>
  );
}
