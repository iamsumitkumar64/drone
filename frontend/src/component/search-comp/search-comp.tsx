"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, Typography, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import { searchSchema } from "@/schemas/search";
import { SearchCompProps } from "./search-comp.interface";
import styles from "./search-comp.module.css";

export default function SearchComp({
    onSearch,
    placeholder = "Search...",
    debounceDelay = 500,
    schema = searchSchema,
}: SearchCompProps) {
    const [query, setQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [debouncedQuery] = useDebounce(query, debounceDelay);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const result = schema.safeParse(debouncedQuery);

        if (!result.success) {
            setError(result.error.issues[0]?.message || "Invalid search input");
            return;
        }

        setError(null);
        onSearch(result.data);
    }, [debouncedQuery, onSearch, schema]);

    return (
        <Box className={styles.container}>
            <TextField
                size="small"
                fullWidth
                value={query}
                placeholder={placeholder}
                error={Boolean(error)}
                onChange={(e) => setQuery(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: "#9e9e9e" }} />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            {error && <Typography className={styles.error}>{error}</Typography>}
        </Box>
    );
}