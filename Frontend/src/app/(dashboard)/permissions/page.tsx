import type { Metadata } from "next";
import { PermissionsView } from "@/views/PermissionsView";

export const metadata: Metadata = { title: "Permissions · Admin Panel" };

export default function Page() {
  return <PermissionsView />;
}
