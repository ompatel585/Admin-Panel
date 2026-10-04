"use client";

import { ArrowLeft, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RequirePermission } from "@/components/guards/RequirePermission";
import { EmptyState } from "@/components/shared/empty-state";
import { PageSpinner } from "@/components/shared/page-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { PermissionMatrix } from "@/sections/roles/permission-matrix";
import {
  useGetPermissionTreeQuery,
  useGetRoleQuery,
  useGetUserQuery,
  useUpdateUserPermissionsMutation,
} from "@/services/api";
import type { PermissionNode } from "@/types/permission";
import type { Role } from "@/types/role";
import type { UserDetail } from "@/types/user";
import { succeeded } from "@/utils/safe-unwrap";

function Editor({ user, role, tree }: { user: UserDetail; role: Role; tree: PermissionNode[] }) {
  const router = useRouter();
  const [updatePermissions, { isLoading }] = useUpdateUserPermissionsMutation();

  // What the role already grants is shown on and locked; only the extras are editable.
  const [locked] = useState(() => new Set(role.permissions.map((permission) => permission.id)));
  const [selected, setSelected] = useState(
    () => new Set([...locked, ...user.permissions.map((permission) => permission.id)]),
  );

  const leafIds = new Set(tree.flatMap((module) => module.children.map((child) => child.id)));
  const extras = [...selected].filter((id) => leafIds.has(id) && !locked.has(id)).length;

  const save = async () => {
    const permissionIds = [...selected].filter((id) => !locked.has(id));
    if (await succeeded(updatePermissions({ id: user.id, permissionIds }).unwrap())) router.push(ROUTES.users);
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{role.name}</Badge>
            <StatusBadge status={user.isActive ? "active" : "inactive"} />
          </div>
        </CardContent>
      </Card>

      <p className="mb-3 text-sm text-muted-foreground">
        Permissions from the <strong>{role.name}</strong> role are locked on. Anything you tick here is given to {user.name} in
        addition.
      </p>

      <PermissionMatrix tree={tree} selected={selected} onChange={setSelected} locked={locked} />

      <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 sm:-mx-6 sm:px-6">
        <span className="text-sm text-muted-foreground">{extras} extra permissions</span>
        <div className="flex gap-2">
          <Link href={ROUTES.users} className={cn(buttonVariants({ variant: "outline" }))}>
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

export function UserPermissionsView({ userId }: { userId: string }) {
  const { isAdmin } = usePermissions();
  const { data: user, isLoading, isError } = useGetUserQuery(userId, { skip: !isAdmin });
  const { data: role } = useGetRoleQuery(user?.role.id ?? "", { skip: !user });
  const { data: tree } = useGetPermissionTreeQuery(undefined, { skip: !isAdmin });

  return (
    <RequirePermission permission={PERMISSIONS.users.update}>
      <Link href={ROUTES.users} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Users
      </Link>

      {!isAdmin ? (
        <Card>
          <EmptyState
            icon={ShieldOff}
            title="Super admin only"
            description="Only a super admin can give a user individual permissions."
          />
        </Card>
      ) : isError ? (
        <Card>
          <EmptyState icon={ShieldOff} title="User not found" description="They may have been deleted." />
        </Card>
      ) : isLoading || !user || !role || !tree ? (
        <PageSpinner />
      ) : (
        // Keyed so a refetch after saving starts from the fresh server state.
        <Editor key={user.id} user={user} role={role} tree={tree} />
      )}
    </RequirePermission>
  );
}
