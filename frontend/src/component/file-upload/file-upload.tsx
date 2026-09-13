"use client"

import React, { useState } from "react";
import { Box, Button, CircularProgress, Link, Typography } from "@mui/material";
import { useAppDispatch } from "@/redux/hooks.ts";
import { uploadFile } from "@/redux/feature/upload/upload-action";
import { FileUploadProps } from "./file-upload.interface";
import styles from "./file-upload.module.css";

export default function FileUpload({ onSuccess }: FileUploadProps) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        try {
            const uploadedUrl = await dispatch(uploadFile(file)).unwrap();
            setUrl(uploadedUrl);
            onSuccess?.(uploadedUrl);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : typeof err === "string" ? err : "Upload failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className={styles.container}>
            <Button variant="contained" component="label" disabled={loading} className={styles.button}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Upload File"}
                <Box component="input" type="file" className={styles.hiddenInput} onChange={handleUpload} />
            </Button>

            {url && (
                <Typography className={styles.success}>
                    Uploaded: <Link href={url} target="_blank" rel="noreferrer" className={styles.link}>View File</Link>
                </Typography>
            )}

            {error && <Typography className={styles.error}>{error}</Typography>}
        </Box>
    );
}
