
"use client";
import React, { useState, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { staffLoginaction } from "@/action/staffLoginaction";

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  captcha: z.string().length(6, { message: "CAPTCHA must be 6 characters" }),
  rememberMe: z.boolean().default(false),
  code: z.string().optional(),
});

export default function LoginFormstaff() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Another account already exists with the same e-mail address"
      : "";

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      captcha: "",
      rememberMe: false,
      code: "",
    },
  });

  const generateCaptcha = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    if (values.captcha !== captchaCode) {
      setError("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      form.setValue("captcha", "");
      return;
    }

    startTransition(() => {
      staffLoginaction(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            form.reset();
            setSuccess("Login successful");
          }
          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        })
        .catch(() => setError("Something went wrong"));
    });
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl border-0 bg-gradient-to-b from-indigo-50/20 to-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold text-indigo-600 text-center mb-4">
          Staff Portal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {showTwoFactor ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Two-Factor Authentication</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter 6-digit code"
                            className="py-5 text-center text-xl tracking-[0.5em]"
                            disabled={isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-gray-500 text-center">
                  Check your authenticator app for the verification code
                </p>
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@company.com"
                          type="email"
                          className="py-5 rounded-lg focus-visible:ring-indigo-500"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="••••••••"
                          type="password"
                          className="py-5 rounded-lg focus-visible:ring-indigo-500"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <FormLabel className="text-gray-600">CAPTCHA Verification</FormLabel>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-0 bg-indigo-50/50 rounded-lg blur-sm" />
                      <div className="relative bg-white border border-indigo-100 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-2xl font-bold text-indigo-600 select-none skew-x-6">
                          {captchaCode}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={generateCaptcha}
                          className="text-indigo-500 hover:bg-indigo-50 rounded-lg"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="captcha"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Type the code above"
                            className="py-5 rounded-lg focus-visible:ring-indigo-500"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                      </FormControl>
                      <FormLabel className="text-gray-600 !mt-0">
                        Remember this device
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </>
            )}
            {(error || urlError) && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error || urlError}</p>
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
              className="w-full py-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : showTwoFactor ? (
                "Verify Code"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Not staff?{" "}
          <a
            href="/login"
            className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 group"
          >
            User Login
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
