import type { Metadata } from "next";
import { RolesView } from "@/views/RolesView";

export const metadata: Metadata = { title: "Roles · Admin Panel" };

export default function Page() {
  return <RolesView />;
}
