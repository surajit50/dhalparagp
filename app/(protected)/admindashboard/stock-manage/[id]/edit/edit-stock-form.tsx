"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTubewellStock } from "@/action/tubewell-stock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Edit, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditStockFormProps {
  stock: {
    id: string;
    tubewellType: string;
    quantity: number;
  };
}

export function EditStockForm({ stock }: EditStockFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tubewellType = formData.get('tubewellType') as string;
    const quantity = parseInt(formData.get('quantity') as string);

    startTransition(async () => {
      try {
        await updateTubewellStock(stock.id, { tubewellType, quantity });
        toast.success("Stock updated successfully!");
        router.push("/admindashboard/stock-manage/add");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update stock.");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admindashboard/stock-manage/add">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Stock</h1>
          <p className="text-sm text-muted-foreground">Modify details for an existing tubewell stock item.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Update Stock Details
          </CardTitle>
          <CardDescription>Update tubewell type or current quantity.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tubewellType">Tubewell Type</Label>
              <Input
                id="tubewellType"
                name="tubewellType"
                defaultValue={stock.tubewellType}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                defaultValue={stock.quantity}
                required
                disabled={isPending}
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild disabled={isPending}>
                <Link href="/admindashboard/stock-manage/add">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {isPending ? "Updating..." : "Update Stock"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
