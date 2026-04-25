"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CardWrapper from "@/components/auth/card-wrapper";
import ErrorForm from "@/components/ErrorForm";
import SuccessForm from "@/components/SuccessForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePasswordSchema } from "@/schema";
import { useForm } from "react-hook-form";
import { reset } from "@/action/reset";
import { newPassword } from "@/action/new-password";
import { useSearchParams } from "next/navigation";
import { updateUserPasword } from "@/action/update-pasword";

const UserPasswordUpdateform = () => {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransiton] = useTransition();

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      newpassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    console.log(values);

    setError("");
    setSuccess("");

    startTransiton(() => {
      updateUserPasword(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <div className="w-96 shadow-lg bg-white rounded-lg">
      <h4 className="text-center text-2xl p-2 text-teal-500">
        Update your password
      </h4>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <div className="">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter current Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      disabled={isPending}
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newpassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      type="password"
                      disabled={isPending}
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ErrorForm message={error}></ErrorForm>
            <SuccessForm message={success}></SuccessForm>

            <Button type="submit" disabled={isPending} className="w-full mt-2">
              Change Password
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserPasswordUpdateform;
