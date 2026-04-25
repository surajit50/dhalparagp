"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdInbox, MdSend, MdDrafts, MdDelete } from "react-icons/md";

const folders = [
  {
    name: "Inbox",
    href: "/admindashboard/manage-email/inbox",
    icon: <MdInbox className="w-5 h-5 mr-2" />,
    key: "inbox",
  },
  {
    name: "Sent",
    href: "/admindashboard/manage-email/view-sent-email",
    icon: <MdSend className="w-5 h-5 mr-2" />,
    key: "sent",
  },
  {
    name: "Drafts",
    href: "/admindashboard/manage-email/drafts",
    icon: <MdDrafts className="w-5 h-5 mr-2" />,
    key: "drafts",
  },
  {
    name: "Trash",
    href: "/admindashboard/manage-email/trash",
    icon: <MdDelete className="w-5 h-5 mr-2" />,
    key: "trash",
  },
];

const EmailLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const [counts, setCounts] = useState({ inbox: 0, drafts: 0, trash: 0 });
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    // Fetch unread/unsent counts for Inbox, Drafts, Trash
    async function fetchCounts() {
      try {
        const [inboxRes, draftsRes, trashRes] = await Promise.all([
          fetch("/api/email/inbox/count"),
          fetch("/api/email/drafts/count"),
          fetch("/api/email/trash/count"),
        ]);
        const inbox = await inboxRes.json();
        const drafts = await draftsRes.json();
        const trash = await trashRes.json();
        setCounts({
          inbox: inbox.count || 0,
          drafts: drafts.count || 0,
          trash: trash.count || 0,
        });
      } catch (e) {
        // fallback: do nothing
      }
    }
    fetchCounts();
    // Optionally, fetch user info for avatar/email
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUser({ name: data.name, email: data.email });
        }
      } catch (e) {}
    }
    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-6 px-4 shadow-sm justify-between">
        <div>
          <button
            className="w-full mb-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors text-base flex items-center justify-center"
            onClick={() =>
              (window.location.href = "/admindashboard/manage-email/sent-email")
            }
          >
            + Compose
          </button>
          <h2 className="text-lg font-bold mb-6 text-blue-700">Mail Folders</h2>
          <nav className="flex flex-col gap-2">
            {folders.map((folder) => {
              const active = pathname.startsWith(folder.href);
              const badge =
                folder.key === "inbox"
                  ? counts.inbox
                  : folder.key === "drafts"
                  ? counts.drafts
                  : folder.key === "trash"
                  ? counts.trash
                  : 0;
              return (
                <Link
                  key={folder.name}
                  href={folder.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 ${
                    active ? "bg-blue-100 text-blue-800 font-semibold" : ""
                  }`}
                >
                  {folder.icon}
                  <span className="flex-1">{folder.name}</span>
                  {badge > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        {/* User avatar/email at bottom */}
        <div className="mt-8 flex flex-col items-center border-t pt-6">
          <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700 mb-2">
            {user?.name ? user.name[0] : "U"}
          </div>
          <div className="text-sm font-semibold text-gray-800">
            {user?.name || "User Name"}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email || "user@email.com"}
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-0 md:p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default EmailLayout;
