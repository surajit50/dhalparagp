"use client";

import { getAgencyDetailsById } from "@/action/bookNitNuber";
import { useEffect, useState } from "react";

// Props passed to this component
interface AgencyCellProps {
  agencyId: string;
}

// Shape of data returned from the API
interface AgencyData {
  id?: string;
  name: string;
  contactDetails?: string | null;
}

// Strongly type the return of getAgencyDetailsById
// (only if you control that function; otherwise keep ?? null)
type GetAgencyDetailsFn = (id: string) => Promise<AgencyData | null>;

// Cast the imported function so TS knows the type
const getAgencyDetails = getAgencyDetailsById as GetAgencyDetailsFn;

export function AgencyCell({ agencyId }: AgencyCellProps) {
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgency() {
      try {
        const agencyData = await getAgencyDetails(agencyId);
        setAgency(agencyData ?? null); // handles both null & undefined
      } catch (error) {
        console.error("Failed to fetch agency:", error);
        setAgency(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAgency();
  }, [agencyId]);

  if (loading) {
    return (
      <div className="flex items-center py-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!agency) {
    return <div className="text-muted-foreground py-2">No Agency Found</div>;
  }

  return (
    <div className="font-medium text-primary truncate max-w-[220px] py-2">
      {agency.name}
    </div>
  );
}
