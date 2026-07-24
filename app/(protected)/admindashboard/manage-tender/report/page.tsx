import { WorkDetails } from "./WorkDetails";

export default async function ParentPage(props: {
  searchParams: Promise<{ nitNo?: string; fundType?: string; schemeName?: string; }>;
}) {
  const searchParams = await props.searchParams;
  return (
    <WorkDetails
      nitNo={searchParams.nitNo}
      schemeName={searchParams.schemeName}
    />
  );
}
