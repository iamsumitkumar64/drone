"use client";

import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import { AlertLog } from "@/service/api.service";
import PaginationBar from "@/component/pagination-bar/pagination-bar";
import styles from "./alerts-table.module.css";

interface AlertsTableProps {
  alerts: AlertLog[];
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
  onPageChange?: (newPage: number) => void;
}

export default function AlertsTable({
  alerts,
  total,
  page,
  totalPages,
  limit,
  onPageChange,
}: AlertsTableProps) {
  const displayTotal = total ?? alerts.length;

  return (
    <Paper className={styles.container}>
      <Typography variant="h6" className={styles.title}>
        🚨 Dispatched Push Notifications ({displayTotal})
      </Typography>
      {alerts.length === 0 ? (
        <Typography className={styles.emptyText}>No alerts triggered yet. Click &quot;Simulate Stock Alert&quot; to test!</Typography>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell className={styles.tableHeaderCell}>Timestamp</TableCell>
                <TableCell className={styles.tableHeaderCell}>Channel</TableCell>
                <TableCell className={styles.tableHeaderCell}>Status Transition</TableCell>
                <TableCell className={styles.tableHeaderCell}>Price</TableCell>
                <TableCell className={styles.tableHeaderCell}>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((a) => (
                <TableRow key={a.uuid}>
                  <TableCell>{new Date(a.sentAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={a.channel} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <code>{a.oldStatus || "N/A"}</code> ➡️ <strong>{a.newStatus}</strong>
                  </TableCell>
                  <TableCell>₹{Number(a.newPrice || 0).toLocaleString()}</TableCell>
                  <TableCell>{a.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {page && totalPages && limit && onPageChange && (
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={displayTotal}
              limit={limit}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </Paper>
  );
}
