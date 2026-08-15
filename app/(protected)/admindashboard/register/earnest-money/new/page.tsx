import { getEligibleEarnestMoneyCandidates } from "@/lib/earnest-money";
import ClientNewEmdPage from "./ClientPage";

export default async function NewEmdPage() {
  const { candidates, blockedOnlineWorksCount } =
    await getEligibleEarnestMoneyCandidates();

  return (
    <ClientNewEmdPage
      candidates={candidates}
      blockedOnlineWorksCount={blockedOnlineWorksCount}
    />
  );
}
