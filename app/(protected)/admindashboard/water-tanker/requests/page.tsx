import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TankerBookingForm from "@/components/form/tanker-booking-form";
import { Truck } from "lucide-react";

const page = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            New Service Request
          </CardTitle>
          <CardDescription>
            Create a new water tanker service booking request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TankerBookingForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
