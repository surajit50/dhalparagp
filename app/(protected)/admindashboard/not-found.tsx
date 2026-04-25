import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <p className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</p>
          <div className="w-16 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link 
          href="/admindashboard" 
          className="flex items-center justify-center w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition duration-300 ease-in-out"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </main>
  )
}
