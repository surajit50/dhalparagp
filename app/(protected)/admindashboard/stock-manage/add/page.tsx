import { Suspense } from 'react'
import TubewellStockList from '@/components/form/TubewellStockList'
import AddTubewellStockForm from '@/components/form/AddTubewellStockForm'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Gram Panchayat Tubewell Stock Management</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Tubewell Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <AddTubewellStockForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tubewell Stock List</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <TubewellStockList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
