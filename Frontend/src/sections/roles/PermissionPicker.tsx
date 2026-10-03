"use client";

import { useField } from "formik";
import { useEffect, useRef } from "react";
import { EmptyState, PageSpinner } from "@/components/ui";
import { useGetPermissionTreeQuery } from "@/services/api";
import type { PermissionNode } from "@/types/permission";
import styles from "./permissionPicker.module.css";

/**
 * Formik-bound checkbox tree for a role's `permissionIds`. The tree comes from
 * the API, so permissions added later appear here without any code change.
 * Ticking a module selects/clears the module and all of its sub-permissions.
 */
export function PermissionPicker({ name = "permissionIds" }: { name?: string }) {
  const { data: tree, isLoading } = useGetPermissionTreeQuery();
  const [field, , helpers] = useField<string[]>(name);
  const selected = new Set(field.value);

  const set = (ids: string[], on: boolean) => {
    const next = new Set(selected);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    helpers.setValue([...next]);
  };

  if (isLoading) return <PageSpinner />;
  if (!tree || tree.length === 0) return <EmptyState message="No permissions exist yet." />;

  return (
    <div className={styles.picker}>
      {tree.map((module) => (
        <ModuleGroup key={module.id} module={module} selected={selected} onToggle={set} />
      ))}
    </div>
  );
}

interface ModuleGroupProps {
  module: PermissionNode;
  selected: Set<string>;
  onToggle: (ids: string[], on: boolean) => void;
}

function ModuleGroup({ module, selected, onToggle }: ModuleGroupProps) {
  const ids = [module.id, ...module.children.map((child) => child.id)];
  const count = ids.filter((id) => selected.has(id)).length;
  const all = count === ids.length;
  const some = count > 0 && !all;

  const checkbox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (checkbox.current) checkbox.current.indeterminate = some;
  }, [some]);

  return (
    <div className={styles.group}>
      <label className={styles.groupHeader}>
        <input ref={checkbox} type="checkbox" checked={all} onChange={(event) => onToggle(ids, event.target.checked)} />
        <span>{module.name}</span>
        <span className={styles.muted}>{module.key}</span>
        {!module.isActive && <span className={styles.muted}>(inactive)</span>}
      </label>
      {module.children.length > 0 && (
        <div className={styles.children}>
          {module.children.map((child) => (
            <label key={child.id} className={styles.child} title={child.description || child.key}>
              <input
                type="checkbox"
                checked={selected.has(child.id)}
                onChange={(event) => onToggle([child.id], event.target.checked)}
              />
              <span>{child.name}</span>
              {!child.isActive && <span className={styles.muted}>(inactive)</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
