"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetTenantOptionsQuery } from "@/services/api";

const ALL = "all";

interface TenantFilterProps {
  value: string;
  onChange: (tenantId: string) => void;
}

/** Admin-only workspace filter for the list screens; renders nothing for everyone else. */
export function TenantFilter({ value, onChange }: TenantFilterProps) {
  const { isAdmin } = usePermissions();
  const { data: tenants = [] } = useGetTenantOptionsQuery(undefined, { skip: !isAdmin });
  if (!isAdmin) return null;

  const items = [{ value: ALL, label: "All workspaces" }, ...tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))];

  return (
    <Select items={items} value={value || ALL} onValueChange={(next) => onChange(next === ALL ? "" : (next as string))}>
      <SelectTrigger className="w-48" aria-label="Filter by workspace">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
