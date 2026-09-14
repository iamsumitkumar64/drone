"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import HeaderComp from "@/component/header-comp/header-comp";
import WatchlistTable from "@/component/watchlist-table/watchlist-table";
import TrackUrlDialog from "@/component/track-url-dialog/track-url-dialog";
import PaginationBar from "@/component/pagination-bar/pagination-bar";
import { ApiService, WatchlistItem, Product } from "@/service/api.service";
import { connectSocket } from "@/service/socket.service";
import styles from "./watchlist.module.css";

export default function WatchlistPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getWatchlist(page, limit);
      setWatchlist(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      console.error("Watchlist error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();

    const socket = connectSocket();
    socket.on("stock_alert", () => loadWatchlist());
    return () => {
      socket.off("stock_alert");
    };
  }, [page, limit]);

  const handleRemove = async (productUuid: string) => {
    try {
      await ApiService.removeFromWatchlist(productUuid);
      enqueueSnackbar("Removed from watchlist", { variant: "info" });
      loadWatchlist();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
  };

  const handleSimulateAlert = async (product: Product) => {
    try {
      await ApiService.simulateStatusChange(product.uuid, "IN_STOCK", product.currentPrice);
      enqueueSnackbar(`⚡ Simulated stock change fired for "${product.title}"! Alert sent to Telegram & Web.`, {
        variant: "success",
      });
      loadWatchlist();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
  };

  const handleAddUrl = async (url: string, category: string) => {
    try {
      setActionLoading(true);
      const product = await ApiService.addProduct(url, category);
      await ApiService.addToWatchlist(product.uuid);
      setDialogOpen(false);
      enqueueSnackbar(`Tracking added: "${product.title}" (${product.stockStatus})`, {
        variant: "success",
      });
      loadWatchlist();
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
        <Box className={styles.header}>
          <Box>
            <Typography variant="h5" className={styles.title}>
              ⭐ My Drone Parts Watchlist ({total})
            </Typography>
            <Typography variant="body2" className={styles.subtitle}>
              Continuously monitored for in-stock transitions, pre-order openings, and price reductions.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => setDialogOpen(true)}
            className={styles.addBtn}
          >
            ➕ Track New Retailer URL
          </Button>
        </Box>

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <WatchlistTable
              watchlist={watchlist}
              onRemove={handleRemove}
              onSimulateAlert={handleSimulateAlert}
              onBrowseCatalog={() => router.push("/")}
            />

            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </>
        )}
      </Box>

      <TrackUrlDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddUrl}
        loading={actionLoading}
      />
    </Box>
  );
}
