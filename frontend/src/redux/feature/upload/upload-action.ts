"use client"

import { createAsyncThunk } from "@reduxjs/toolkit"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8090"

export const uploadFile = createAsyncThunk(
    "upload/file",
    async (file: File, { rejectWithValue }) => {
        try {
            const signRes = await fetch(`${BACKEND_API_URL}/upload/signed-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ folder: "setup" }),
            })
            const signData = await signRes.json()
            if (!signRes.ok) throw new Error(signData.message)

            const formData = new FormData()
            formData.append("file", file)
            formData.append("timestamp", String(signData.timestamp))
            formData.append("signature", signData.signature)
            formData.append("folder", signData.folder)
            formData.append("api_key", signData.apiKey || signData.api_key)

            const res = await fetch(signData.uploadUrl, { method: "POST", body: formData })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error?.message || "Upload failed")

            return result.secure_url as string
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : "Upload failed")
        }
    }
)
