"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { trackUrlSchema, TrackUrlSchemaType } from "@/schemas/track-url";
import styles from "./track-url-dialog.module.css";

interface TrackUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string, category: string) => Promise<void>;
  loading: boolean;
}

export default function TrackUrlDialog({
  open,
  onClose,
  onSubmit,
  loading,
}: TrackUrlDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<TrackUrlSchemaType>({
    resolver: zodResolver(trackUrlSchema),
    mode: "onChange",
    defaultValues: {
      url: "",
      category: "general",
    },
  });

  useEffect(() => {
    if (open) {
      reset({ url: "", category: "general" });
    }
  }, [open, reset]);

  const onFormSubmit = async (data: TrackUrlSchemaType) => {
    await onSubmit(data.url, data.category);
    reset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogTitle className={styles.dialogTitle}>
          Track New Drone Product URL
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <Typography variant="body2" className={styles.description}>
            Paste any product link from Robu.in, ThinkRobotics.com, Zbotic.in, Evelta.com, or any electronics store. The system will scrape and classify specs with AI.
          </Typography>

          <Box className={styles.field}>
            <TextField
              label="Product URL"
              placeholder="https://robu.in/product/..."
              fullWidth
              size="small"
              error={!!errors.url}
              {...register("url")}
            />
            {errors.url && (
              <p className={styles.error}>{errors.url.message}</p>
            )}
          </Box>

          <Box className={styles.field}>
            <TextField
              select
              label="Category"
              fullWidth
              size="small"
              defaultValue="general"
              error={!!errors.category}
              {...register("category")}
            >
              <MenuItem value="flight_controller">Flight Controller</MenuItem>
              <MenuItem value="raspberry_pi">Raspberry Pi 5</MenuItem>
              <MenuItem value="companion_computer">Companion Computer</MenuItem>
              <MenuItem value="hat">HAT / Carrier Board</MenuItem>
              <MenuItem value="general">General Drone Part</MenuItem>
            </TextField>
            {errors.category && (
              <p className={styles.error}>{errors.category.message}</p>
            )}
          </Box>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || loading}
            className={styles.submitBtn}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Scrape & Track"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
