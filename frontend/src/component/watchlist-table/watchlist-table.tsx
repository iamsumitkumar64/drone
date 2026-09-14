"use client";

import { Box, Paper, Typography, Chip, Button } from "@mui/material";
import { WatchlistItem, Product } from "@/service/api.service";
import styles from "./watchlist-table.module.css";

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  onRemove: (productUuid: string) => void;
  onSimulateAlert: (product: Product) => void;
  onBrowseCatalog: () => void;
}

export default function WatchlistTable({
  watchlist,
  onRemove,
  onSimulateAlert,
  onBrowseCatalog,
}: WatchlistTableProps) {
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

  if (watchlist.length === 0) {
    return (
      <Paper className={styles.emptyState}>
        <Typography variant="h6" className={styles.emptyTitle}>
          Your watchlist is currently empty.
        </Typography>
        <Typography variant="body2" className={styles.emptySubtitle}>
          Browse the catalog or track any product link to receive push alerts when parts become available.
        </Typography>
        <Button variant="outlined" onClick={onBrowseCatalog} className={styles.browseBtn}>
          Browse Catalog
        </Button>
      </Paper>
    );
  }

  return (
    <Box className={styles.listContainer}>
      {watchlist.map((item) => (
        <Paper key={item.uuid} className={styles.cardItem}>
          <Box className={styles.infoSection}>
            <Box className={styles.tagRow}>
              <Chip label={item.product?.retailer || "Retailer"} size="small" />
              {getStatusChip(item.product?.stockStatus || "UNKNOWN")}
            </Box>
            <Typography variant="subtitle1" className={styles.productTitle}>
              {item.product?.title || "Tracked Product"}
            </Typography>
            <Typography variant="caption" className={styles.productUrlText}>
              URL:{" "}
              <a
                href={item.product?.url}
                target="_blank"
                rel="noreferrer"
                className={styles.productLink}
              >
                {item.product?.url}
              </a>
            </Typography>
          </Box>

          <Box className={styles.actionsSection}>
            <Box className={styles.priceBox}>
              <Typography variant="h6" className={styles.priceText}>
                ₹{Number(item.product?.currentPrice || 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" className={styles.alertLabel}>
                Alerts: Telegram & Web
              </Typography>
            </Box>

            {item.product && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => onSimulateAlert(item.product!)}
                className={styles.testAlertBtn}
              >
                ⚡ Test Alert
              </Button>
            )}

            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onRemove(item.productUuid)}
              className={styles.removeBtn}
            >
              Remove
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
