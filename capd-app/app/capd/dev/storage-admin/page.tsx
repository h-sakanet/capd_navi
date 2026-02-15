import { notFound } from "next/navigation";

import { StorageAdminPanel } from "@/components/capd/storage-admin-panel";
import { CapdShell } from "@/components/capd/shell";

export default function StorageAdminPage() {
  const envFlag = process.env.NEXT_PUBLIC_ENABLE_STORAGE_ADMIN;
  const enabled =
    envFlag === "true" || (process.env.NODE_ENV !== "production" && envFlag !== "false");

  if (!enabled) {
    notFound();
  }

  return (
    <CapdShell>
      <StorageAdminPanel />
    </CapdShell>
  );
}
