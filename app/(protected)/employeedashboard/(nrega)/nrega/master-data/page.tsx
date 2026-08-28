import { fetchAllMasterData } from "@/action/nrega/master-data-actions";
import MasterDataPageClient from "@/components/nrega/MasterDataPageClient";

export default async function MasterDataPage() {
  const masterData = await fetchAllMasterData();

  return <MasterDataPageClient initialData={masterData} />;
}
