"use client"

import { createSlice } from "@reduxjs/toolkit"
import {
    signupUser,
    loginUser,
    logoutUser,
} from "./user-action"
import { UserState } from "./user-type";

const initialState: UserState = {
    user: null,
    loading: true,
    error: null,
    status: 'pending'
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        resetUser: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.status = "pending";
        },
        resetUserError: (state) => {
            state.error = null;
            state.status = "pending"
        }
    },
    extraReducers: (builder) => {
        builder
            .addAsyncThunk(signupUser, {
                pending: (state) => {
                    state.loading = true;
                    state.status = "pending";
                },
                fulfilled: (state, action) => {
                    state.loading = false;
                    state.user = action.payload.data.user;
                    state.error = null;
                    state.status = "succeed";
                },
                rejected: (state, action) => {
                    state.loading = false;
                    state.status = "rejected";
                    state.user = null;
                    state.error = action.payload as string;
                }
            })
            .addAsyncThunk(loginUser, {
                pending: (state) => {
                    state.loading = true;
                    state.status = "pending";
                },
                fulfilled: (state, action) => {
                    state.loading = false;
                    state.user = action.payload.data.user;
                    state.status = "succeed";
                    state.error = null;
                },
                rejected: (state, action) => {
                    state.loading = false;
                    state.status = "rejected";
                    state.error = action.payload as string;
                }
            })
            .addAsyncThunk(logoutUser, {
                pending: (state) => {
                    state.loading = true;
                    state.status = "pending";
                },
                fulfilled: (state) => {
                    state.user = null;
                    state.loading = false;
                    state.error = null;
                    state.status = "pending";
                },
                rejected: (state, action) => {
                    state.loading = false;
                    state.status = "rejected";
                    state.error = action.payload as string;
                }
            });
    }
})

export const { resetUser, resetUserError } = userSlice.actions;
export default userSlice.reducer
