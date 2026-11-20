import type { Metadata } from "next";
import { Newsletter } from "@/components/dash/admin/Content";

export const metadata: Metadata = { title: "Newsletter" };

export default function Page() {
  return <Newsletter />;
}
