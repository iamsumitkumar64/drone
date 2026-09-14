"use client";

import { Box, Card, CardContent, Typography, Chip, Button } from "@mui/material";
import { Product } from "@/service/api.service";
import styles from "./product-card.module.css";

interface ProductCardProps {
  product: Product;
  isWatched: boolean;
  onToggleWatchlist: (productUuid: string) => void;
  onSimulateAlert?: (product: Product) => void;
}

export default function ProductCard({
  product,
  isWatched,
  onToggleWatchlist,
  onSimulateAlert,
}: ProductCardProps) {
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
    <Card className={styles.card}>
      <CardContent>
        <Box className={styles.cardHeader}>
          <Chip label={product.retailer} size="small" variant="outlined" className={styles.retailerChip} />
          {getStatusChip(product.stockStatus)}
        </Box>

        <Typography variant="h6" className={styles.title}>
          {product.title}
        </Typography>

        <Typography variant="h5" className={styles.price}>
          ₹{Number(product.currentPrice).toLocaleString()}
        </Typography>

        {product.specs && Object.keys(product.specs).length > 0 && (
          <Box className={styles.specsContainer}>
            <Typography variant="caption" className={styles.specsTitle}>
              EXTRACTED SPECS:
            </Typography>
            {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
              <Typography key={k} variant="caption" className={styles.specItem}>
                • <strong>{k}:</strong> {String(v)}
              </Typography>
            ))}
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Category: <strong>{product.category}</strong>
        </Typography>
      </CardContent>

      <Box className={styles.cardFooter}>
        <Button
          variant={isWatched ? "contained" : "outlined"}
          color={isWatched ? "primary" : "inherit"}
          size="small"
          onClick={() => onToggleWatchlist(product.uuid)}
          className={styles.watchlistBtn}
        >
          {isWatched ? "⭐ Watching" : "☆ Add Watchlist"}
        </Button>

        {product.stockStatus === "OUT_OF_STOCK" && onSimulateAlert && (
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => onSimulateAlert(product)}
            className={styles.testAlertBtn}
            title="Simulate In-Stock transition to test alert"
          >
            ⚡ Test Alert
          </Button>
        )}

        <Button
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="text"
          size="small"
          className={styles.storeLinkBtn}
        >
          Visit Store ↗
        </Button>
      </Box>
    </Card>
  );
}
