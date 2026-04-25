"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Emailpage = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admindashboard/manage-email");
  }, [router]);
  return null;
};

export default Emailpage;
