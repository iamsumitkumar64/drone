"use client";

import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";
import { StockHistoryItem } from "@/service/api.service";
import PaginationBar from "@/component/pagination-bar/pagination-bar";
import styles from "./history-table.module.css";

interface HistoryTableProps {
  history: StockHistoryItem[];
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
  onPageChange?: (newPage: number) => void;
}

export default function HistoryTable({
  history,
  total,
  page,
  totalPages,
  limit,
  onPageChange,
}: HistoryTableProps) {
  const displayTotal = total ?? history.length;

  const getStatusChip = (status: string) => {
    switch (status) {
      case "IN_STOCK":
        return <Chip label="IN STOCK" color="success" size="small" className={styles.stockChip} />;
      case "OUT_OF_STOCK":
        return <Chip label="OUT OF STOCK" color="error" size="small" className={styles.stockChip} />;
      case "PRE_ORDER":
        return <Chip label="PRE-ORDER" color="warning" size="small" className={styles.stockChip} />;
      default:
        return <Chip label="UNKNOWN" size="small" />;
    }
  };

  return (
    <Paper className={styles.container}>
      <Typography variant="h6" className={styles.title}>
        📊 Stock & Price Change History ({displayTotal})
      </Typography>
      {history.length === 0 ? (
        <Typography className={styles.emptyText}>No history entries recorded yet.</Typography>
      ) : (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell className={styles.tableHeaderCell}>Recorded Time</TableCell>
                <TableCell className={styles.tableHeaderCell}>Old Status</TableCell>
                <TableCell className={styles.tableHeaderCell}>New Status</TableCell>
                <TableCell className={styles.tableHeaderCell}>Old Price</TableCell>
                <TableCell className={styles.tableHeaderCell}>New Price</TableCell>
                <TableCell className={styles.tableHeaderCell}>Reason / Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.uuid}>
                  <TableCell>{new Date(h.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={h.oldStatus || "N/A"} size="small" />
                  </TableCell>
                  <TableCell>{getStatusChip(h.newStatus)}</TableCell>
                  <TableCell>{h.oldPrice ? `₹${Number(h.oldPrice).toLocaleString()}` : "-"}</TableCell>
                  <TableCell>{h.newPrice ? `₹${Number(h.newPrice).toLocaleString()}` : "-"}</TableCell>
                  <TableCell>{h.changeReason || "-"}</TableCell>
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
