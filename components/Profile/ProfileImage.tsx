"use client";
import { useCurrentUser } from "@/hooks/use-current-user";
import Image from "next/image";

export const ProfileImage = () => {
  const user = useCurrentUser();
  return (
    <div className="w-40 h-40 border bg-white rounded-lg">
      <Image
        src={user?.image || ""}
        alt="profile"
        width={100}
        height={100}
        className="object-cover h-full w-full"
      />
    </div>
  );
};
