import ClientAddPaymentPage from "./ClientPage";

export default async function AddPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientAddPaymentPage id={id} />;
}
