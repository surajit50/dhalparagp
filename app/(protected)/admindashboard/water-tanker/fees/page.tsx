import React from "react";
import { db } from "@/lib/db";
import ServiceFeeForm from "@/components/form/ServiceFeeForm";

enum ServiceType {
  WATER_TANKER = "WATER_TANKER",
  DUSTBIN_VAN = "DUSTBIN_VAN",
}

const Page = async () => {
  const fees = await db.serviceFee.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert enum to array with formatted display names
  const serviceTypes = Object.values(ServiceType).map((type) => ({
    id: type,
    name: type
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Service Fees Management</h1>
      <div className="grid gap-6">
        {serviceTypes.map((serviceType) => {
          const currentFee = fees.find(
            (fee) => fee.serviceType === serviceType.id
          );

          return (
            <ServiceFeeForm
              key={serviceType.id}
              serviceType={serviceType}
              currentFee={currentFee}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Page;
