"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PermissionNode } from "@/types/permission";

/** The standard actions that get their own column; anything else lands in "Other". */
const COLUMNS = ["read", "create", "update", "delete"] as const;
type Column = (typeof COLUMNS)[number];

const actionOf = (node: PermissionNode) => node.key.slice(node.key.lastIndexOf(".") + 1);
const isColumn = (action: string): action is Column => (COLUMNS as readonly string[]).includes(action);

/**
 * Applies a change to the selected ids and keeps each subject's own id in sync:
 * a subject is selected exactly when at least one of its sub-permissions is.
 */
function change(
  selected: Set<string>,
  subjects: PermissionNode[],
  ids: string[],
  on: boolean,
  locked: Set<string>,
): Set<string> {
  const next = new Set(selected);
  // Locked permissions (granted by the user's role) can never be switched off here.
  ids.forEach((id) => (on ? next.add(id) : locked.has(id) || next.delete(id)));
  for (const subject of subjects) {
    if (subject.children.some((child) => next.has(child.id))) next.add(subject.id);
    else if (!locked.has(subject.id)) next.delete(subject.id);
  }
  return next;
}

interface PermissionMatrixProps {
  tree: PermissionNode[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  /** Permissions that are always on and can't be changed, e.g. those a user's role already grants. */
  locked?: Set<string>;
}

/**
 * Subjects down the side, actions across the top. Rows come from the API's
 * permission tree, so a permission added later shows up here with no code change.
 */
const NONE = new Set<string>();

export function PermissionMatrix({ tree, selected, onChange, locked = NONE }: PermissionMatrixProps) {
  const allIds = tree.flatMap((subject) => subject.children.map((child) => child.id));
  const allCount = allIds.filter((id) => selected.has(id)).length;
  const toggle = (ids: string[], on: boolean) => onChange(change(selected, tree, ids, on, locked));
  const allLocked = allIds.length > 0 && allIds.every((id) => locked.has(id));

  return (
    <div className="grid gap-4">
      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium">
        <Checkbox
          checked={allIds.length > 0 && allCount === allIds.length}
          indeterminate={allCount > 0 && allCount < allIds.length}
          disabled={allLocked}
          onCheckedChange={(checked) => toggle(allIds, checked)}
        />
        Select all permissions
      </label>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-56">Subject</TableHead>
              <TableHead className="w-20 text-center">All</TableHead>
              {COLUMNS.map((column) => (
                <TableHead key={column} className="w-20 text-center capitalize">
                  {column}
                </TableHead>
              ))}
              <TableHead className="min-w-48">Other</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tree.map((subject) => {
              const ids = subject.children.map((child) => child.id);
              const count = ids.filter((id) => selected.has(id)).length;
              const byColumn = new Map(subject.children.filter((child) => isColumn(actionOf(child))).map((child) => [actionOf(child), child]));
              const other = subject.children.filter((child) => !isColumn(actionOf(child)));

              return (
                <TableRow key={subject.id}>
                  <TableCell>
                    <p className="font-medium">
                      {subject.name}
                      {!subject.isActive && <span className="ml-2 text-xs font-normal text-muted-foreground">(inactive)</span>}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">{subject.key}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      aria-label={`All ${subject.name} permissions`}
                      disabled={ids.length === 0 || ids.every((id) => locked.has(id))}
                      checked={ids.length > 0 && count === ids.length}
                      indeterminate={count > 0 && count < ids.length}
                      onCheckedChange={(checked) => toggle(ids, checked)}
                    />
                  </TableCell>
                  {COLUMNS.map((column) => {
                    const child = byColumn.get(column);
                    return (
                      <TableCell key={column} className="text-center">
                        {child ? (
                          <Checkbox
                            aria-label={`${child.name} (${child.key})`}
                            title={locked.has(child.id) ? "Granted by the role" : child.description || child.key}
                            checked={selected.has(child.id)}
                            disabled={locked.has(child.id)}
                            onCheckedChange={(checked) => toggle([child.id], checked)}
                          />
                        ) : (
                          <span className="text-muted-foreground/40">–</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {other.length === 0 ? (
                      <span className="text-muted-foreground/40">–</span>
                    ) : (
                      <div className="grid gap-1.5">
                        {other.map((child) => (
                          <div key={child.id} className="flex items-center gap-2" title={child.description || child.key}>
                            <Checkbox
                              id={`perm-${child.id}`}
                              checked={selected.has(child.id)}
                              disabled={locked.has(child.id)}
                              onCheckedChange={(checked) => toggle([child.id], checked)}
                            />
                            <Label htmlFor={`perm-${child.id}`} className="text-sm font-normal">
                              {child.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
