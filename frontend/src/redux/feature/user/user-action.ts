"use client"

import { createAsyncThunk } from "@reduxjs/toolkit"
import { SignupSchemaType } from "@/schemas/signup"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8090"

export const signupUser = createAsyncThunk(
    "auth/signup",
    async (data: SignupSchemaType, { rejectWithValue }) => {
        try {
            const { confirmPassword, ...payload } = data

            const res = await fetch(`${BACKEND_API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
            })

            const result = await res.json()

            if (!res.ok) throw new Error(result.message)

            return result
        } catch (error: any) {
            console.log(error);
            return rejectWithValue(error.message)
        }
    }
)

export const loginUser = createAsyncThunk(
    "auth/login",
    async (
        { email, password }: { email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email, password })
            })

            const result = await res.json()

            if (!res.ok) throw new Error(result.message)

            return result
        } catch (error: any) {
            console.log(error);
            return rejectWithValue(error.message)
        }
    }
)

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await fetch(`${BACKEND_API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            })
            const { persistor } = await import("@/redux/store");
            await persistor.purge();
            return null
        } catch (error: any) {
            console.log(error);
            return rejectWithValue(error.message)
        }
    }
)