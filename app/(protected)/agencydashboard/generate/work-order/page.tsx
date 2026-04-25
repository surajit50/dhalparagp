import React from "react";
import WorkOrderForm from "./WorkOrderForm";

interface WorkOrderPageProps {
  searchParams: Promise<{ financialYear?: string; nitNo?: string; workSlNo?: string }>;
}

const WorkOrderPage = async ({ searchParams }: WorkOrderPageProps) => {
  const { financialYear } = await searchParams;

  return <WorkOrderForm initialFinancialYear={financialYear} />;
};

export default WorkOrderPage;
