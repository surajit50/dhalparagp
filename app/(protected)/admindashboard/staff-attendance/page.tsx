import { Metadata } from "next";
import AttendanceClient from "./AttendanceClient";
import { getHolidays } from "./actions";

export const metadata: Metadata = {
  title: "Staff Attendance Control | Admin Dashboard",
  description: "Manage GP staff attendance and holiday schedule",
};

export default async function AttendancePage() {
  const holidays = await getHolidays();

  return (
    <div className="container mx-auto py-6">
      <AttendanceClient initialHolidays={holidays as any} />
    </div>
  );
}
