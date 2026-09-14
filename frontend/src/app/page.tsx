"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import HeaderComp from "@/component/header-comp/header-comp";
import ProductCard from "@/component/product-card/product-card";
import CatalogFilter from "@/component/catalog-filter/catalog-filter";
import TrackUrlDialog from "@/component/track-url-dialog/track-url-dialog";
import PaginationBar from "@/component/pagination-bar/pagination-bar";
import { ApiService, Product, WatchlistItem } from "@/service/api.service";
import { connectSocket } from "@/service/socket.service";
import styles from "./home.module.css";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [retailer, setRetailer] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  // Modals & Action States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodsRes, watchRes] = await Promise.all([
        ApiService.getProducts({
          search: search || undefined,
          retailer: retailer !== "all" ? retailer : undefined,
          category: category !== "all" ? category : undefined,
          stockStatus: status !== "all" ? status : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          page,
          limit,
        }),
        ApiService.getWatchlist(1, 100),
      ]);
      setProducts(prodsRes.data);
      setTotal(prodsRes.total);
      setTotalPages(prodsRes.totalPages);
      setWatchlist(watchRes.data);
    } catch (err: any) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, retailer, category, status, maxPrice]);

  useEffect(() => {
    loadData();

    const socket = connectSocket();
    socket.on("stock_alert", (data: any) => {
      enqueueSnackbar(`🚨 ALERT: ${data.title} is now ${data.newStatus}! Price: ₹${data.newPrice}`, {
        variant: "success",
      });
      loadData();
    });

    return () => {
      socket.off("stock_alert");
    };
  }, [page, limit, search, retailer, category, status, maxPrice]);

  const handleToggleWatchlist = async (productUuid: string) => {
    const isWatched = watchlist.some((w) => w.productUuid === productUuid);
    try {
      if (isWatched) {
        await ApiService.removeFromWatchlist(productUuid);
        enqueueSnackbar("Removed from watchlist", { variant: "info" });
      } else {
        await ApiService.addToWatchlist(productUuid);
        enqueueSnackbar("Added to watchlist with push alerts!", { variant: "success" });
      }
      loadData();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
  };

  const handleRunMonitoring = async () => {
    try {
      setActionLoading(true);
      const res = await ApiService.runMonitoringNow();
      enqueueSnackbar(
        `Daily check complete: ${res.result.checkedCount} checked, ${res.result.changedCount} changed.`,
        { variant: "success" },
      );
      loadData();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateAlert = async (targetProduct?: Product) => {
    try {
      setActionLoading(true);
      const prod = targetProduct || products.find((p) => p.stockStatus === "OUT_OF_STOCK") || products[0];
      if (!prod) return;

      await ApiService.simulateStatusChange(prod.uuid, "IN_STOCK", prod.currentPrice);
      enqueueSnackbar(`⚡ Alert fired for "${prod.title}"! Dispatched to Telegram & Web.`, {
        variant: "success",
      });
      loadData();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUrl = async (url: string, cat: string) => {
    try {
      setActionLoading(true);
      const product = await ApiService.addProduct(url, cat);
      await ApiService.addToWatchlist(product.uuid);
      setDialogOpen(false);
      enqueueSnackbar(`Tracking initialized: "${product.title}" (${product.stockStatus})`, {
        variant: "success",
      });
      loadData();
    } catch (err: any) {
      enqueueSnackbar(err.message, { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const inStockCount = products.filter((p) => p.stockStatus === "IN_STOCK").length;

  return (
    <Box className={styles.container}>
      <HeaderComp />

      <Box className={styles.contentWrapper}>
        {/* Banner */}
        <Box className={styles.banner}>
          <Box>
            <Typography variant="h5" className={styles.bannerTitle}>
              🎯 Drone Electronics Watcher & Parts Catalog
            </Typography>
            <Typography variant="body2" className={styles.bannerSubtitle}>
              Tracking availability across specialty Indian stores: Robu.in, ThinkRobotics, Zbotic, and Evelta.
            </Typography>
            <Box className={styles.statsRow}>
              <Chip label={`📦 ${total} Total Parts`} size="small" className={styles.statChipParts} />
              <Chip label={`🟢 ${inStockCount} In Stock (Page)`} size="small" className={styles.statChipStock} />
              <Chip label={`⭐ ${watchlist.length} In Watchlist`} size="small" className={styles.statChipWatch} />
            </Box>
          </Box>

          <Box className={styles.bannerActions}>
            <Button
              variant="contained"
              onClick={handleRunMonitoring}
              disabled={actionLoading}
              className={styles.runDailyBtn}
            >
              🔄 Run Daily Check
            </Button>
            <Button
              variant="contained"
              onClick={() => handleSimulateAlert()}
              disabled={actionLoading}
              className={styles.simulateAlertBtn}
            >
              ⚡ Simulate Stock Alert
            </Button>
            <Button
              variant="outlined"
              onClick={() => setDialogOpen(true)}
              className={styles.trackUrlBtn}
            >
              ➕ Track New URL
            </Button>
          </Box>
        </Box>

        {/* Filter Bar */}
        <CatalogFilter
          search={search}
          onSearchChange={setSearch}
          retailer={retailer}
          onRetailerChange={setRetailer}
          category={category}
          onCategoryChange={setCategory}
          status={status}
          onStatusChange={setStatus}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
        />

        {/* Product Grid */}
        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box className={styles.emptyState}>
            <Typography color="text.secondary">No drone parts match your current filter.</Typography>
          </Box>
        ) : (
          <>
            <Box className={styles.productsGrid}>
              {products.map((product) => (
                <ProductCard
                  key={product.uuid}
                  product={product}
                  isWatched={watchlist.some((w) => w.productUuid === product.uuid)}
                  onToggleWatchlist={handleToggleWatchlist}
                  onSimulateAlert={handleSimulateAlert}
                />
              ))}
            </Box>

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

      {/* Track URL Dialog */}
      <TrackUrlDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddUrl}
        loading={actionLoading}
      />
    </Box>
  );
}