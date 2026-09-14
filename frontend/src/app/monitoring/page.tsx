"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import HeaderComp from "@/component/header-comp/header-comp";
import AlertsTable from "@/component/alerts-table/alerts-table";
import HistoryTable from "@/component/history-table/history-table";
import { ApiService, AlertLog, StockHistoryItem, Product } from "@/service/api.service";
import { connectSocket } from "@/service/socket.service";
import styles from "./monitoring.module.css";

export default function MonitoringPage() {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [alertsTotal, setAlertsTotal] = useState(0);
  const [alertsPage, setAlertsPage] = useState(1);
  const [alertsTotalPages, setAlertsTotalPages] = useState(1);
  const [alertsLimit] = useState(10);

  const [history, setHistory] = useState<StockHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLimit] = useState(10);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [altRes, histRes, prodsRes] = await Promise.all([
        ApiService.getAlerts(alertsPage, alertsLimit),
        ApiService.getHistory(historyPage, historyLimit),
        ApiService.getProducts({ page: 1, limit: 100 }),
      ]);
      setAlerts(altRes.data);
      setAlertsTotal(altRes.total);
      setAlertsTotalPages(altRes.totalPages);

      setHistory(histRes.data);
      setHistoryTotal(histRes.total);
      setHistoryTotalPages(histRes.totalPages);

      setProducts(prodsRes.data);
    } catch (err: any) {
      console.error("Monitoring load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const socket = connectSocket();
    socket.on("stock_alert", (data: any) => {
      enqueueSnackbar(`🚨 Real-time alert: ${data.title} transitioned to ${data.newStatus}!`, {
        variant: "success",
      });
      loadData();
    });

    socket.on("monitoring_completed", () => {
      loadData();
    });

    return () => {
      socket.off("stock_alert");
      socket.off("monitoring_completed");
    };
  }, [alertsPage, alertsLimit, historyPage, historyLimit]);

  const handleRunMonitoring = async () => {
    try {
      setActionLoading(true);
      const res = await ApiService.runMonitoringNow();
      enqueueSnackbar(
        `Monitoring completed! Checked: ${res.result.checkedCount}, Changed: ${res.result.changedCount}, Alerts: ${res.result.alertsCount}`,
        { variant: "success" },
      );
      loadData();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateAlert = async () => {
    try {
      setActionLoading(true);
      const target =
        products.find((p) => p.stockStatus === "OUT_OF_STOCK") ||
        products[0];

      if (!target) {
        enqueueSnackbar("No product available to simulate.", { variant: "warning" });
        return;
      }

      await ApiService.simulateStatusChange(target.uuid, "IN_STOCK", target.currentPrice);
      enqueueSnackbar(`⚡ Simulated stock transition for "${target.title}"! Push notification sent to Telegram & Web.`, {
        variant: "success",
      });
      loadData();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box className={styles.container}>
      <HeaderComp />

      <Box className={styles.contentWrapper}>
        {/* Header & Controls */}
        <Box className={styles.header}>
          <Box>
            <Typography variant="h5" className={styles.title}>
              📊 Monitoring & Alerting Operations
            </Typography>
            <Typography variant="body2" className={styles.subtitle}>
              Real-time audit log of stock status transitions, favorable change detections, and Telegram/Web alerts.
            </Typography>
          </Box>

          <Box className={styles.actions}>
            <Button
              variant="contained"
              onClick={handleRunMonitoring}
              disabled={actionLoading}
              className={styles.runBtn}
            >
              {actionLoading ? <CircularProgress size={18} color="inherit" /> : "🔄 Run Monitoring Check"}
            </Button>
            <Button
              variant="contained"
              onClick={handleSimulateAlert}
              disabled={actionLoading}
              className={styles.simulateBtn}
            >
              ⚡ Simulate Stock Alert
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className={styles.tablesContainer}>
            <AlertsTable
              alerts={alerts}
              total={alertsTotal}
              page={alertsPage}
              totalPages={alertsTotalPages}
              limit={alertsLimit}
              onPageChange={setAlertsPage}
            />
            <HistoryTable
              history={history}
              total={historyTotal}
              page={historyPage}
              totalPages={historyTotalPages}
              limit={historyLimit}
              onPageChange={setHistoryPage}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
