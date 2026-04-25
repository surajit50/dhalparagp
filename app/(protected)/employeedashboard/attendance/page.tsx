import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AttendanceStatus } from "@prisma/client";
import { format } from "date-fns";
import { createAttendance } from "./actions";

const AttendancePage = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return (
      <div className="rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        User not found or not logged in.
      </div>
    );
  }

  const records = await db.attendance.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const badgeClasses = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-50 text-green-700 ring-1 ring-green-200";
      case "ABSENT":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";
      case "LEAVE":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";
      case "HALF_DAY":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
      case "WORK_FROM_HOME":
        return "bg-purple-50 text-purple-700 ring-1 ring-purple-200";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
        <p className="mt-1 text-sm text-gray-600">
          Record and view your daily attendance.
        </p>
      </div>

      <form
        action={createAttendance}
        className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4"
      >
        <div className="space-y-1 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700" htmlFor="checkIn">
            Check-in
          </label>
          <input
            id="checkIn"
            name="checkIn"
            type="time"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700" htmlFor="checkOut">
            Check-out
          </label>
          <input
            id="checkOut"
            name="checkOut"
            type="time"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            defaultValue="PRESENT"
          >
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LEAVE">Leave</option>
            <option value="HALF_DAY">Half day</option>
            <option value="WORK_FROM_HOME">Work from home</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-3">
          <label className="block text-sm font-medium text-gray-700" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Optional remarks"
          />
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Save attendance
          </button>
        </div>
      </form>

      {records.length === 0 ? (
        <div className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800">
          No attendance records found for your account yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Check-in</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Check-out</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-900">
                    {format(record.date, "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {record.checkIn ? format(record.checkIn, "HH:mm") : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {record.checkOut ? format(record.checkOut, "HH:mm") : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses(
                        record.status
                      )}`}
                    >
                      {record.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {record.notes ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;


