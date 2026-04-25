import ClientPage from "./ClientPage";

export default async function MeetingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientPage id={id} />;
}
