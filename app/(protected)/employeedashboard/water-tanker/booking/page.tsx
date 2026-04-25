import React from "react";

import TankerBookingForm from "@/components/form/tanker-booking-form";
const page = () => {
  return (
    <div>
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Service Management System</h1>
          <p className="text-muted-foreground">
            Manage water tanker and dustbin van services
          </p>
        </div>

        <h1>Book Service</h1>

        <TankerBookingForm />
      </div>
    </div>
  );
};

export default page;
