import { Metadata } from 'next'
import CertificateForm from "@/components/certificate-form"

export const metadata: Metadata = {
  title: 'Family Lineage Certificate System',
  description: 'Complete system for managing family lineage certificates with workflow management'
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Family Lineage Certificate System
          </h1>
          <p className="text-gray-600">
            Complete system for managing family lineage certificates with workflow management
          </p>
        </header>
        <section className="max-w-4xl mx-auto">
          <CertificateForm />
        </section>
      </div>
    </main>
  )
}
