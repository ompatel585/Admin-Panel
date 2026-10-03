import type { Metadata } from "next";
import { UsersView } from "@/views/UsersView";

export const metadata: Metadata = { title: "Users · Admin Panel" };

export default function Page() {
  return <UsersView />;
}
