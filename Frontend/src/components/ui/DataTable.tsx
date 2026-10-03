import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";
import { PageSpinner } from "./Spinner";
import styles from "./ui.module.css";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage: string;
}

export function DataTable<T>({ columns, rows, rowKey, loading, emptyMessage }: DataTableProps<T>) {
  if (loading && !rows) return <PageSpinner />;
  if (!rows || rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} style={column.align ? { textAlign: column.align } : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.header} style={column.align ? { textAlign: column.align } : undefined}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
