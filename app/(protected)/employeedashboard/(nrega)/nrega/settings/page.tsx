import { fetchSignatureSettings } from "@/action/nrega/master-data-actions";
import SettingsPageClient from "@/components/nrega/SettingsPageClient";

export default async function SettingsPage() {
  const settings = await fetchSignatureSettings();

  return <SettingsPageClient initialSettings={settings} />;
}
