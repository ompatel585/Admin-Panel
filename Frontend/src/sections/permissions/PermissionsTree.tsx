"use client";

import { Badge, Button, Card, EmptyState, PageSpinner, StatusBadge, uiStyles } from "@/components/ui";
import type { PermissionNode } from "@/types/permission";
import styles from "./permissionsTree.module.css";

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

export function PermissionsTree({
  tree,
  loading,
  canCreate,
  canUpdate,
  canDelete,
  onAddSub,
  onEdit,
  onDelete,
}: PermissionsTreeProps) {
  if (loading && !tree) return <PageSpinner />;
  if (!tree || tree.length === 0) return <EmptyState message="No permissions yet. Create a module to get started." />;

  const actions = (node: PermissionNode, isModule: boolean) => (
    <div className={uiStyles.actions}>
      {isModule && canCreate && (
        <Button variant="ghost" size="sm" onClick={() => onAddSub(node)}>
          Add sub-permission
        </Button>
      )}
      {canUpdate && (
        <Button variant="ghost" size="sm" onClick={() => onEdit(node)}>
          Edit
        </Button>
      )}
      {canDelete && !node.isSystem && (
        <Button variant="ghost" size="sm" onClick={() => onDelete(node)}>
          Delete
        </Button>
      )}
    </div>
  );

  return (
    <div className={styles.list}>
      {tree.map((module) => (
        <Card key={module.id} padded={false} className={styles.module}>
          <div className={styles.moduleHeader}>
            <div>
              <div className={styles.titleRow}>
                <strong>{module.name}</strong>
                <span className={styles.key}>{module.key}</span>
                {module.isSystem && <Badge tone="warning">System</Badge>}
                <StatusBadge active={module.isActive} />
              </div>
              {module.description && <div className={styles.desc}>{module.description}</div>}
            </div>
            {actions(module, true)}
          </div>

          {module.children.length === 0 ? (
            <div className={styles.noSubs}>No sub-permissions.</div>
          ) : (
            module.children.map((child) => (
              <div key={child.id} className={styles.row}>
                <div>
                  <div className={styles.titleRow}>
                    <span>{child.name}</span>
                    <span className={styles.key}>{child.key}</span>
                    {child.isSystem && <Badge tone="warning">System</Badge>}
                    {!child.isActive && <StatusBadge active={false} />}
                  </div>
                  {child.description && <div className={styles.desc}>{child.description}</div>}
                </div>
                {actions(child, false)}
              </div>
            ))
          )}
        </Card>
      ))}
    </div>
  );
}
