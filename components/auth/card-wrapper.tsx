import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { gpnameinshort } from "@/constants/gpinfor";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel?: string;
  backButtonLabel?: string;
  backButtonHref?: string;
  socilbutton?: Boolean;
}

const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
}: CardWrapperProps) => {
  return (
    <Card className="w-full max-w-full sm:max-w-[500px] shadow-lg">
      <CardHeader className="space-y-1">
        {backButtonHref && (
          <Button
            variant="ghost"
            className="w-fit h-fit p-0 hover:bg-transparent"
            asChild
          >
            <Link
              href={backButtonHref}
              className="flex items-center text-sm text-muted-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {backButtonLabel || "Back"}
            </Link>
          </Button>
        )}
        {headerLabel && (
          <h2 className="text-2xl font-semibold tracking-tight">
            {headerLabel}
          </h2>
        )}
      </CardHeader>
      <CardContent>
        {}
        {children}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {gpnameinshort} Gram Panchayat
        </p>
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
