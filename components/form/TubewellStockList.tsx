
import { db } from '@/lib/db'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteTubewellStock } from '@/action/tubewell-stock'

export default async function TubewellStockList() {
  const tubewellStocks = await db.tubewellStock.findMany({
    orderBy: { lastUpdated: 'desc' }
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tubewell Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tubewellStocks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No stock items found.</TableCell>
          </TableRow>
        ) : (
          tubewellStocks.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell className="font-medium">{stock.tubewellType}</TableCell>
              <TableCell>{stock.quantity}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(stock.lastUpdated).toLocaleString()}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/admindashboard/stock-manage/${stock.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <form action={async () => {
                  "use server";
                  await deleteTubewellStock(stock.id);
                }} className="inline">
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
