import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "Generate NOC for Puja/Festival",
  description: "Create and print No Objection Certificate (NOC) for Puja or Festival",
};

export default function Page() {
  return <ClientPage />;
}
