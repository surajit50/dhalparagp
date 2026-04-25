"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardWrapper from "./card-wrapper";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/action/new-verify";
import BeatLoader from "react-spinners/BeatLoader";
import SuccessForm from "../SuccessForm";
import ErrorForm from "../ErrorForm";

const VerifyForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing Token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        if (data.success) {
          setSuccess(data.success);
          router.push("/auth/login");
        }
        if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token, success, error, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirm your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        {success && <SuccessForm message={success} />}
        {!success && error && <ErrorForm message={error} />}
      </div>
    </CardWrapper>
  );
};

export default VerifyForm;
