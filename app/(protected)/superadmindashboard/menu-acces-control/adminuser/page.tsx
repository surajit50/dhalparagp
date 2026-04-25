"use client";
import { adminMenuItems, type MenuItemProps } from "@/constants/protected-menu";
import { useState } from "react";

function RoleBadges({ roles }: { roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {roles.map((role) => (
        <span
          key={role}
          className="inline-block px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 font-semibold border border-blue-200"
        >
          {role}
        </span>
      ))}
    </div>
  );
}

function CollapsibleMenu({ items }: { items: MenuItemProps[] }) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggle = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div>
      {items.map((item, idx) => (
        <div
          key={item.menuItemText}
          className="mb-4 border rounded-lg shadow-sm bg-white"
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 rounded-t-lg"
            onClick={() =>
              item.submenu && item.subMenuItems.length > 0 && toggle(idx)
            }
          >
            <div>
              <span className="font-semibold text-lg">{item.menuItemText}</span>
              {item.menuItemLink && (
                <a
                  href={item.menuItemLink}
                  className="ml-2 text-blue-600 text-xs underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.menuItemLink}
                </a>
              )}
              <RoleBadges roles={item.allowedRoles || []} />
            </div>
            {item.submenu && item.subMenuItems.length > 0 && (
              <span className="ml-4 text-blue-400 text-xl select-none">
                {openIndexes.includes(idx) ? "−" : "+"}
              </span>
            )}
          </div>
          {item.submenu &&
            item.subMenuItems.length > 0 &&
            openIndexes.includes(idx) && (
              <div className="pl-6 pb-3">
                <CollapsibleMenu items={item.subMenuItems} />
              </div>
            )}
        </div>
      ))}
    </div>
  );
}

export default function AdminUserMenuAccessPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Admin User Menu Access
      </h1>
      <CollapsibleMenu items={adminMenuItems} />
    </div>
  );
}
