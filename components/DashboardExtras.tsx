import React from "react";

export default function DashboardExtras({ data }: { data: any }) {
  const pending = data?.pendingPaymentsByFundType || {};
  const tender = data?.tenderStatusCounts || {};
  const workOrdersPending = data?.workOrdersPending ?? 0;

  const tiedAmount = Number(pending.tied?.amount || 0);
  const untiedAmount = Number(pending.untied?.amount || 0);
  const unknownAmount = Number(pending.unknown?.amount || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Pending payments by fund type */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Pending Payments (by fund)</h3>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Tied</span>
            <span className="font-semibold">₹{tiedAmount.toLocaleString()} <span className="text-xs text-slate-500">({pending.tied?.count || 0})</span></span>
          </div>
          <div className="flex justify-between">
            <span>Untied</span>
            <span className="font-semibold">₹{untiedAmount.toLocaleString()} <span className="text-xs text-slate-500">({pending.untied?.count || 0})</span></span>
          </div>
          <div className="flex justify-between">
            <span>Unknown</span>
            <span className="font-semibold">₹{unknownAmount.toLocaleString()} <span className="text-xs text-slate-500">({pending.unknown?.count || 0})</span></span>
          </div>

          <div className="mt-3 pt-2 border-t text-sm text-slate-600">
            <div className="flex justify-between">
              <span className="font-medium">Total Pending</span>
              <span className="font-bold">₹{(tiedAmount + untiedAmount + unknownAmount).toLocaleString()}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Tied vs Untied pending balances</div>
          </div>
        </div>
      </div>

      {/* Work orders pending */}
      <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold">Work Orders Pending</h3>
          <p className="text-xs text-slate-500 mt-1">Works not yet started or in progress</p>
        </div>
        <div className="text-3xl font-extrabold mt-4 text-orange-600">{workOrdersPending}</div>
      </div>

      {/* Tender status summary */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-bold">Tender Status</h3>
        <div className="mt-3 space-y-1 text-sm">
          {Object.keys(tender).length === 0 ? (
            <div className="text-slate-400">No tender data</div>
          ) : (
            Object.entries(tender).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize">{k}</span>
                <span className="font-semibold">{String(v)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
