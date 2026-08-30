"use client"
import { useState, useTransition, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, Mail } from "lucide-react"
import { login, resendTwoFactorCode } from "@/action/login"
import Link from "next/link"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  
  code: z.string().optional(),
})

export default function LoginForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [captchaCode, setCaptchaCode] = useState("")
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isResending, setIsResending] = useState(false)

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Another account already exists with the same email address"
      : ""

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      
      code: "",
    },
  })

  const generateCaptcha = () => {
    setIsRefreshingCaptcha(true)
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setCaptchaCode(result)
    setIsRefreshingCaptcha(false)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    

    startTransition(() => {
      login(values)
        .then((data) => {
          if (data && "error" in data) {
            if (showTwoFactor) {
              form.setValue("code", "")
            } else {
              form.setValue("password", "")
              
              form.setValue("code", "")
              generateCaptcha()
            }
            setError(data.error)
          } else if (data && "twoFactor" in data) {
            setShowTwoFactor(true)
          } else if (data && "success" in data) {
            const successData = data as { success: string; redirectUrl?: string }
            if (successData.success.includes("Confirmation email sent")) {
              setVerificationMessage(successData.success)
              setShowVerificationDialog(true)
            } else {
              setSuccess(successData.success)
              window.location.href = successData.redirectUrl ?? DEFAULT_LOGIN_REDIRECT
            }
          }
        })
        .catch(() => {
          if (showTwoFactor) {
            form.setValue("code", "")
          } else {
            form.setValue("password", "")
            
            form.setValue("code", "")
            generateCaptcha()
          }
          setError("Something went wrong. Please try again.")
        })
        .finally(() => setIsLoading(false))
    })
  }

  const handleResendCode = async () => {
    const email = form.getValues("email")
    if (!email) {
      setError("Email is required to resend code")
      return
    }

    setIsResending(true)
    setError("")
    setSuccess("")

    try {
      await resendTwoFactorCode(email)
      setSuccess("New verification code sent to your email")
    } catch (error) {
      setError("Failed to resend code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-4 px-8 pt-10 pb-4 text-center">
          <div className="flex justify-center">
            <Link href="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
              <Image
                src="/images/logo.png"
                width={100}
                height={35}
                alt="Dhalpara Gram Panchayat Logo"
                className="object-contain"
                priority
              />
            </Link>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {showTwoFactor ? "Verify Your Identity" : "Welcome Back"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {showTwoFactor ? "Enter the code from your authenticator app" : "Sign in to access your account"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {(error || urlError) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">{error}</p>
                    {urlError && <p className="text-xs text-red-700/80 mt-1">{urlError}</p>}
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              )}

              {showTwoFactor ? (
                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-foreground">Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000"
                            className="py-2.5 text-center font-mono tracking-widest text-lg font-semibold focus-visible:ring-orange-500"
                            autoFocus
                            maxLength={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto p-0 text-orange-600 hover:text-orange-800"
                    disabled={isResending}
                    onClick={handleResendCode}
                    type="button"
                  >
                    {isResending ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Resending...
                      </span>
                    ) : (
                      "Didn't receive a code? Resend"
                    )}
                  </Button>
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-foreground">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500 pointer-events-none" />
                            <Input
                              placeholder="you@company.com"
                              type="email"
                              className="pl-10 py-2.5 transition-colors focus:ring-orange-500 focus:border-orange-500"
                              disabled={isPending}
                              autoComplete="email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-1.5">
                          <FormLabel className="text-sm font-semibold text-foreground">Password</FormLabel>
                          <Link
                            href="/auth/reset"
                            className="text-xs font-medium text-orange-600 hover:text-orange-800 transition-colors"
                          >
                            Forgot?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500 pointer-events-none" />
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10 py-2.5 transition-colors focus:ring-orange-500 focus:border-orange-500"
                              disabled={isPending}
                              autoComplete="current-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-orange-600 transition-colors p-1"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  

              <Button
                type="submit"
                className="w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 mt-6 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isPending || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    {showTwoFactor ? "Verifying..." : "Signing in..."}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {showTwoFactor ? "Verify Code" : "Continue"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                )}
              </Button>
            </form>
          </Form>

        </CardContent>


      
      </Card>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Verify Your Email</DialogTitle>
            <DialogDescription className="text-center">Check your inbox for a verification link</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="rounded-full bg-orange-50 p-4">
              <CheckCircle2 className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-center text-sm text-foreground font-medium">{verificationMessage}</p>
            <p className="text-center text-xs text-muted-foreground">
              Please click the verification link in your email to activate your account.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
