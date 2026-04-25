import React from "react";
import { FaUnlock } from "react-icons/fa";
import { Button } from "../ui/button";
import Link from "next/link";
import { gpnameinshort } from "@/constants/gpinfor";

interface HeaderProps {
  label?: string;
}

const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-2 items-center justify-center">
      <h1 className="flex font-semibold text-2xl gap-4 text-slate-600">
        <FaUnlock size={10} />
        {gpnameinshort} Gram Panchayat
      </h1>

      <p className=" text-lg mt-3"> {label} </p>
      <Link href="/">
        <Button variant="link" className="text-md text-blue-700">
          Back to Website
        </Button>
      </Link>
    </div>
  );
};

export default Header;
