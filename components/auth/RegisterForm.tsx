"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CardWrapper from "./card-wrapper";
import ErrorForm from "../ErrorForm";
import SuccessForm from "../SuccessForm";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";
import { useForm } from "react-hook-form";
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
import { RegisterSchema } from "@/schema";
import { register } from "@/action/register";
import { Loader2, Check, X, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const RegisterForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      mobileNumber: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    setIsRedirecting(false);

    startTransition(() => {
      register(values).then((data) => {
        setError(data.error);
        setSuccess(data.success);

        if (data.success) {
          toast.success("Registration successful! Redirecting to login...");
          form.reset();
          setIsRedirecting(true);
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
      });
    });
  };

  // Password validation checks
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasLowerCase = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(passwordValue);
  const hasMinLength = passwordValue.length >= 8;

  // Calculate password strength
  const getPasswordStrength = () => {
    let strength = 0;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;
    if (hasMinLength) strength++;

    if (strength <= 2) return { label: "Weak", color: "bg-red-500" };
    if (strength <= 4) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="John Doe"
                        type="text"
                        className="pl-4 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        className="pl-4 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Mobile number field */}

            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="9876543210"
                      type="text"
                      className="pl-4 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="pl-4 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setPasswordValue(e.target.value);
                        }}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  {/* Password strength indicator */}
                  {passwordFocused && passwordValue.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Password Strength:
                        </span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            passwordStrength.label === "Weak" && "text-red-500",
                            passwordStrength.label === "Medium" &&
                              "text-yellow-500",
                            passwordStrength.label === "Strong" &&
                              "text-green-500"
                          )}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      

                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-300",
                            passwordStrength.color
                          )}
                          style={{
                            width: `${
                              getPasswordStrength().label === "Weak"
                                ? 33
                                : getPasswordStrength().label === "Medium"
                                ? 66
                                : 100
                            }%`,
                          }}
                        />
                      </div>

                      {/* Password requirements */}
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          {hasUpperCase ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              hasUpperCase ? "text-green-500" : "text-red-500"
                            }
                          >
                            Uppercase letter
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          {hasLowerCase ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              hasLowerCase ? "text-green-500" : "text-red-500"
                            }
                          >
                            Lowercase letter
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          {hasNumber ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              hasNumber ? "text-green-500" : "text-red-500"
                            }
                          >
                            Number
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          {hasSpecialChar ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              hasSpecialChar ? "text-green-500" : "text-red-500"
                            }
                          >
                            Special character
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          {hasMinLength ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              hasMinLength ? "text-green-500" : "text-red-500"
                            }
                          >
                            At least 8 characters
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}

                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="pl-4 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={isPending}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Error and Success Messages */}
            <ErrorForm message={error} />
            <SuccessForm message={success} />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending || isRedirecting}
              className={cn(
                "w-full py-2.5 rounded-lg text-white font-medium transition-all",
                "bg-blue-600 hover:bg-blue-700",
                "disabled:bg-blue-400 disabled:cursor-not-allowed"
              )}
            >
              {isPending || isRedirecting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {isRedirecting ? "Redirecting..." : "Creating account..."}
                  </span>
                </div>
              ) : (
                "Create account"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
