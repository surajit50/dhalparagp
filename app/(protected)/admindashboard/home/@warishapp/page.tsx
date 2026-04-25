import React from "react";
import { db } from "@/lib/db";
import { FaChartLine } from "react-icons/fa";
import TempleteCart from "@/components/TempleteCart";
const page = async () => {
  const warish = await db.warishApplication.count({});

  const status = {
    title: "Total Application",
    value: warish,
    icon: FaChartLine,
    change: "+3%",
    color: "text-yellow-500",
  };
  return <TempleteCart stat={status} />;
};

export default page;
