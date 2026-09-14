"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paper, TextField, MenuItem } from "@mui/material";
import { catalogFilterSchema, CatalogFilterSchemaType } from "@/schemas/catalog-filter";
import styles from "./catalog-filter.module.css";

interface CatalogFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  retailer: string;
  onRetailerChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
}

export default function CatalogFilter({
  search,
  onSearchChange,
  retailer,
  onRetailerChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  maxPrice,
  onMaxPriceChange,
}: CatalogFilterProps) {
  const { register, watch } = useForm<CatalogFilterSchemaType>({
    resolver: zodResolver(catalogFilterSchema),
    defaultValues: {
      search,
      retailer,
      category,
      status,
      maxPrice,
    },
  });

  useEffect(() => {
    const subscription = watch((val) => {
      if (val.search !== undefined && val.search !== search) onSearchChange(val.search);
      if (val.retailer && val.retailer !== retailer) onRetailerChange(val.retailer);
      if (val.category && val.category !== category) onCategoryChange(val.category);
      if (val.status && val.status !== status) onStatusChange(val.status);
      if (val.maxPrice !== undefined && val.maxPrice !== maxPrice) onMaxPriceChange(val.maxPrice);
    });
    return () => subscription.unsubscribe();
  }, [watch, search, retailer, category, status, maxPrice, onSearchChange, onRetailerChange, onCategoryChange, onStatusChange, onMaxPriceChange]);

  return (
    <Paper className={styles.filterBar}>
      <TextField
        size="small"
        placeholder="Search parts (e.g. Pixhawk, Raspberry Pi)..."
        className={styles.searchField}
        {...register("search")}
      />

      <TextField
        select
        size="small"
        label="Retailer"
        defaultValue="all"
        className={styles.retailerField}
        {...register("retailer")}
      >
        <MenuItem value="all">All Retailers</MenuItem>
        <MenuItem value="robu.in">Robu.in</MenuItem>
        <MenuItem value="thinkrobotics.com">ThinkRobotics</MenuItem>
        <MenuItem value="zbotic.in">Zbotic.in</MenuItem>
        <MenuItem value="evelta.com">Evelta.com</MenuItem>
      </TextField>

      <TextField
        select
        size="small"
        label="Category"
        defaultValue="all"
        className={styles.categoryField}
        {...register("category")}
      >
        <MenuItem value="all">All Categories</MenuItem>
        <MenuItem value="flight_controller">Flight Controllers</MenuItem>
        <MenuItem value="raspberry_pi">Raspberry Pi 5</MenuItem>
        <MenuItem value="companion_computer">Companion Computers</MenuItem>
        <MenuItem value="hat">HATs & Carriers</MenuItem>
      </TextField>

      <TextField
        select
        size="small"
        label="Status"
        defaultValue="all"
        className={styles.statusField}
        {...register("status")}
      >
        <MenuItem value="all">All Status</MenuItem>
        <MenuItem value="IN_STOCK">In Stock</MenuItem>
        <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
        <MenuItem value="PRE_ORDER">Pre-Order</MenuItem>
      </TextField>

      <TextField
        size="small"
        placeholder="Max Price (₹)"
        type="number"
        className={styles.priceField}
        {...register("maxPrice")}
      />
    </Paper>
  );
}
