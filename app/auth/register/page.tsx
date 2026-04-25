import RegisterForm from '@/components/auth/RegisterForm'
import React from 'react'
import Image from 'next/image'

import Link from 'next/link'

const RegisterPage = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left column - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo.svg" 
                alt="Logo" 
                width={120} 
                height={40} 
                className="mx-auto"
              />
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-gray-600">
              Join our community and get started today
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>

      {/* Right column - Visual */}
      <div className="hidden lg:block relative bg-gray-900">
        
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-gray-900/20" />
          <div className="absolute bottom-10 left-10 text-white">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;The best way to predict the future is to create it.&rdquo;
              </p>
              <footer className="text-sm">— Abraham Lincoln</footer>
            </blockquote>
          </div>
        
      </div>
    </div>
  )
}

export default RegisterPage
