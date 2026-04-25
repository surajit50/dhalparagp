// Example parent page usage
import { WorkDetails } from "./WorkDetails";

export default function ParentPage({
  searchParams,
}: {
  searchParams: Promise<{ nitNo?: string }>;
}) {
  // Intentionally not awaited here since WorkDetails likely handles undefined initially; if needed, await and pass resolved value
  return <WorkDetails nitNo={undefined} />;
}
