"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ErrorForm from "../ErrorForm";
import SuccessForm from "../SuccessForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ResetSchema } from "@/schema";
import { useForm } from "react-hook-form";
import { reset } from "@/action/reset";
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransiton] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    startTransiton(() => {
      reset(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          Password Reset
        </h1>
        <p className="text-gray-500">
          Enter your email to receive reset instructions
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-600 font-medium">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      disabled={isPending}
                      className="py-5 rounded-lg focus-visible:ring-indigo-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full py-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending Email...</span>
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>

            <div className="text-center mt-4">
              <Link
                href="/auth/login"
                className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to login</span>
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ResetForm;
