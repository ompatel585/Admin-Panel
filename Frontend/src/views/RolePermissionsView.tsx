"use client";

import { ArrowLeft, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { EmptyState } from "@/components/shared/empty-state";
import { PageSpinner } from "@/components/shared/page-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { PermissionMatrix } from "@/sections/roles/permission-matrix";
import { useGetPermissionTreeQuery, useGetRoleQuery, useUpdateRolePermissionsMutation } from "@/services/api";
import type { PermissionNode } from "@/types/permission";
import type { Role } from "@/types/role";
import { succeeded } from "@/utils/safe-unwrap";

function Editor({ role, tree }: { role: Role; tree: PermissionNode[] }) {
  const router = useRouter();
  const [updatePermissions, { isLoading }] = useUpdateRolePermissionsMutation();
  const [selected, setSelected] = useState(() => new Set(role.permissions.map((permission) => permission.id)));

  const leafIds = new Set(tree.flatMap((module) => module.children.map((child) => child.id)));
  const granted = [...selected].filter((id) => leafIds.has(id)).length;

  const save = async () => {
    if (await succeeded(updatePermissions({ id: role.id, permissionIds: [...selected] }).unwrap())) {
      router.push(ROUTES.roles);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{role.name}</p>
            {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
          </div>
          <StatusBadge status={role.isActive ? "active" : "inactive"} />
        </CardContent>
      </Card>

      <PermissionMatrix tree={tree} selected={selected} onChange={setSelected} />

      <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 sm:-mx-6 sm:px-6">
        <span className="text-sm text-muted-foreground">{granted} permissions granted</span>
        <div className="flex gap-2">
          <Link href={ROUTES.roles} className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
          <Button onClick={save} disabled={isLoading}>
            {isLoading ? "Saving…" : "Save permissions"}
          </Button>
        </div>
      </div>
    </>
  );
}

export function RolePermissionsView({ roleId }: { roleId: string }) {
  const { data: role, isLoading, isError } = useGetRoleQuery(roleId);
  const { data: tree } = useGetPermissionTreeQuery();

  return (
    <RequirePermission permission={PERMISSIONS.roles.update}>
      <Link href={ROUTES.roles} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Roles
      </Link>

      {isError ? (
        <Card>
          <EmptyState icon={ShieldOff} title="Role not found" description="It may have been deleted." />
        </Card>
      ) : isLoading || !role || !tree ? (
        <PageSpinner />
      ) : role.isAdmin ? (
        <Card>
          <EmptyState icon={ShieldOff} title="Can't be edited" description="This role holds every permission." />
        </Card>
      ) : (
        // Keyed so a refetch after saving starts from the fresh server state.
        <Editor key={role.id} role={role} tree={tree} />
      )}
    </RequirePermission>
  );
}
