"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdImage, MdSecurity, MdVerifiedUser } from "react-icons/md";

export const ProfileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="shadow-md flex  w-full ">
      <div
        className={`flex gap-1 items-center w-full  p-2 ${
          pathname === "/dashboard/profile/changeprofile" ? "bg-slate-300" : ""
        }`}
      >
        <MdVerifiedUser size={20} className="  text-orange-300 text-sm" />
        <Link href="/dashboard/profile/changeprofile">Profie Detail</Link>
      </div>
      <div
        className={`flex gap-1 items-center w-full  p-2 ${
          pathname === "/dashboard/profile/changepassword"
            ? "bg-slate-300 "
            : ""
        }`}
      >
        <MdSecurity size={20} className=" text-orange-300 text-sm" />
        <Link href="/dashboard/profile/changepassword">Password</Link>
      </div>
      <div
        className={`flex gap-1 items-center w-full  p-2 ${
          pathname === "/dashboard/profile/changeprofileimage"
            ? "bg-slate-300"
            : ""
        }`}
      >
        <MdImage size={20} className=" text-orange-300 text-sm" />
        <Link href="/dashboard/profile/changeprofileimage">Upload Image</Link>
      </div>
      <div
        className={`flex gap-1 items-center w-full  p-2 ${
          pathname === "/admindashboard/manage-villages/add-village"
            ? "bg-slate-300"
            : ""
        }`}
      >
        <MdVerifiedUser size={20} className="  text-orange-300 text-sm" />
        <Link href="/admindashboard/manage-villages/add-village">
          Add Village Information
        </Link>
      </div>
    </nav>
  );
};
