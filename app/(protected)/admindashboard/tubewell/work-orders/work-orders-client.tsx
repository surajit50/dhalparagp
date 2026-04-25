"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { createColumns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TubewelWorkOrder } from "@/components/PrintTemplet/tubewel-work-order";
import { TubewellWorkOrderWithRelations } from "@/types";

interface WorkOrdersClientProps {
  orders: TubewellWorkOrderWithRelations[];
  allMaterials: Array<{ id: string; name: string; stock: number; unit: string; rate: number }>;
  gpProfile: any;
}

export function WorkOrdersClient({
  orders,
  allMaterials,
  gpProfile,
}: WorkOrdersClientProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Build columns once — memoised so they don't rebuild on every render
  const columns = useMemo(() => createColumns(allMaterials), [allMaterials]);

  const issuedOrders = orders.filter((o) => o.status === "ISSUED" || o.status === "IN_PROGRESS");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  const getSelectedOrders = (table: any) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    return selectedRows.map((row: any) => row.original);
  };

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <Tabs defaultValue="issued" className="w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <TabsList>
            <TabsTrigger value="issued">
              Issued ({issuedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="issued" className="p-4 m-0">
          <DataTable
            columns={columns}
            data={issuedOrders}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            renderBulkActions={(table) => (
              <TubewelWorkOrder
                workOrders={getSelectedOrders(table)}
                allMaterials={allMaterials}
                gpProfile={gpProfile}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="completed" className="p-4 m-0">
          <DataTable
            columns={columns}
            data={completedOrders}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            renderBulkActions={(table) => (
              <TubewelWorkOrder
                workOrders={getSelectedOrders(table)}
                allMaterials={allMaterials}
                gpProfile={gpProfile}
              />
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
