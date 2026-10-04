"use client";

import { KeyRound } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageSpinner } from "@/components/shared/page-spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PermissionNode } from "@/types/permission";

interface PermissionsTreeProps {
  tree: PermissionNode[] | undefined;
  loading: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onAddSub: (module: PermissionNode) => void;
  onEdit: (permission: PermissionNode) => void;
  onDelete: (permission: PermissionNode) => void;
}

export function PermissionsTree({ tree, loading, canCreate, canUpdate, canDelete, onAddSub, onEdit, onDelete }: PermissionsTreeProps) {
  if (loading && !tree) return <PageSpinner />;
  if (!tree || tree.length === 0) {
    return (
      <Card>
        <EmptyState icon={KeyRound} title="No permissions yet" description="Create a module to get started." />
      </Card>
    );
  }

  const actions = (node: PermissionNode, isModule: boolean) => (
    <div className="flex shrink-0 items-center">
      {isModule && canCreate && (
        <Button variant="ghost" size="sm" onClick={() => onAddSub(node)}>
          Add
        </Button>
      )}
      {canUpdate && (
        <Button variant="ghost" size="sm" onClick={() => onEdit(node)}>
          Edit
        </Button>
      )}
      {canDelete && !node.isSystem && (
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(node)}>
          Delete
        </Button>
      )}
    </div>
  );

  return (
    <div className="grid gap-4">
      {tree.map((module) => (
        <Card key={module.id} className="gap-0 py-0">
          <div className="flex items-start justify-between gap-3 border-b bg-muted/40 px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm">{module.name}</strong>
                <span className="font-mono text-xs text-muted-foreground">{module.key}</span>
                {module.isSystem && <Badge variant="secondary">System</Badge>}
                <StatusBadge status={module.isActive ? "active" : "inactive"} />
              </div>
              {module.description && <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>}
            </div>
            {actions(module, true)}
          </div>

          {module.children.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No sub-permissions.</p>
          ) : (
            <ul className="divide-y">
              {module.children.map((child) => (
                <li key={child.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span>{child.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{child.key}</span>
                      {child.isSystem && <Badge variant="secondary">System</Badge>}
                      {!child.isActive && <StatusBadge status="inactive" />}
                    </div>
                    {child.description && <p className="text-xs text-muted-foreground">{child.description}</p>}
                  </div>
                  {actions(child, false)}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}
