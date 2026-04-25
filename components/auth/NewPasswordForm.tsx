'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { NewPasswordSchema } from '@/schema'
import { useForm } from 'react-hook-form'
import { newPassword } from '@/action/new-password'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { PasswordStrengthIndicator } from './password-strength-indicator' // Optional component

const NewPasswordForm = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0) // Optional
  const [error, setError] = useState<string | undefined>('')
  const [success, setSuccess] = useState<string | undefined>('')
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '', // Added confirmation field
    },
  })

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid password reset link. Please request a new one.')
    }
  }, [token])

  // Optional: Calculate password strength
  const calculateStrength = (password: string) => {
    let strength = 0
    if (password.length > 5) strength += 1
    if (password.length > 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
  }

  const onSubmit = async (values: z.infer<typeof NewPasswordSchema>) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setSuccess('')

    startTransition(() => {
      newPassword(values, token).then((data) => {
        setError(data?.error)
        setSuccess(data?.success)
      })
    })
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="space-y-2 mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Set New Password
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter a new password for your account
        </p>
      </div>

      {!token && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Missing reset token. Please use the link from your email.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      disabled={isPending}
                      className="h-11 pr-10"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        calculateStrength(e.target.value) // Optional
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                {/* Optional password strength indicator */}
                {passwordStrength > 0 && (
                  <PasswordStrengthIndicator strength={passwordStrength} />
                )}
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={isPending}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {(error || success) && (
            <Alert variant={error ? 'destructive' : 'default'}>
              <AlertDescription>
                {error || success}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isPending || !token}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isPending ? 'Saving...' : 'Save Password'}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Remember your password?{' '}
        <a
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign in
        </a>
      </div>
    </div>
  )
}

export default NewPasswordForm
