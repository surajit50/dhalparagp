'use client'
import { adminLoginAction } from "@/action/adminloginAction";
import React, { useState, useTransition, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Lock, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  captcha: z.string().length(6, { message: "CAPTCHA must be 6 characters" }),
  rememberMe: z.boolean().default(false),
  code: z.string().optional(),
})

export default function LoginFormAdmin() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [captchaCode, setCaptchaCode] = useState("")

  const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Another account already exists with the same e-mail address"
    : ""

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      captcha: "",
      rememberMe: false,
      code: "",
    },
  })

  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setCaptchaCode(result)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("")
    setSuccess("")

    if (values.captcha !== captchaCode) {
      setError("Invalid CAPTCHA. Please try again.")
      generateCaptcha()
      form.setValue("captcha", "")
      return
    }

    startTransition(() => {
      adminLoginAction(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error)
          }
          if (data?.success) {
            form.reset()
            setSuccess("Login successful")
          }
          if (data?.twoFactor) {
            setShowTwoFactor(true)
          }
        })
        .catch(() => setError("Something went wrong"))
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-2xl border-0 bg-gradient-to-b from-background to-muted/10">
      <CardHeader className="space-y-2 text-center">
        <Lock className="mx-auto h-8 w-8 text-primary" />
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Admin Portal
        </CardTitle>
        <p className="text-muted-foreground">Enter your credentials to continue</p>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {showTwoFactor ? (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two-Factor Authentication</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter 6-digit code" 
                          className="pl-10"
                          disabled={isPending} 
                          {...field} 
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="name@example.com" 
                            className="pl-10"
                            type="email" 
                            disabled={isPending} 
                            {...field} 
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="••••••" 
                            className="pl-10"
                            type="password" 
                            disabled={isPending} 
                            {...field} 
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label>CAPTCHA Verification</Label>
                  <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1 text-center text-2xl font-mono tracking-widest select-none">
                      {captchaCode}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateCaptcha}
                      className="rounded-full"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="captcha"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Type the CAPTCHA above" 
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
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 cursor-pointer">
                        Remember this device
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </>
            )}

            {(error || urlError) && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>{error || urlError}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 transition-all"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Authenticating...
                </div>
              ) : showTwoFactor ? 'Verify Identity' : 'Continue'}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          User account?{' '}
          <a 
            href="/login" 
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Switch to user login
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
