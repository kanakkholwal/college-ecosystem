import type { Metadata } from "next";
import AppearanceForm from "./appearance-form";

export const metadata: Metadata = { title: "Appearance settings" };

export default function AppearancePage() {
  return <AppearanceForm />;
}
