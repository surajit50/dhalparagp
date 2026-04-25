import { db } from "@/lib/db";
import React from "react";
import { UserActions, UserStatusToggle } from "./user-actions";
import { Pagination } from "./pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 10;

const UserStatusPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [users, totalUsers] = await Promise.all([
    db.user.findMany({
      where: {
        role: {
          in: ["user", "staff"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        userStatus: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: {
        name: "asc",
      },
    }),
    db.user.count({
      where: {
        role: {
          in: ["user", "staff"],
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">User Status Management</h1>
        <UserActions />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      user.userStatus === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.userStatus}
                  </span>
                </TableCell>
                <TableCell>
                  <UserStatusToggle
                    userId={user.id}
                    currentStatus={user.userStatus}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalUsers}
        itemsPerPage={ITEMS_PER_PAGE}
        skip={skip}
      />
    </div>
  );
};

export default UserStatusPage;
