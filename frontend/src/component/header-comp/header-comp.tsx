"use client"

import { usePathname, useRouter } from "next/navigation"
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material"
import { logoutUser } from "@/redux/feature/user/user-action"
import { RootState } from "@/redux/store"
import styles from "./header-comp.module.css"
import { useAppDispatch, useAppSelector } from "@/redux/hooks.ts"

export default function HeaderComp() {
    const router = useRouter()
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.userReducer);

    const handleLogOut = async () => {
        await dispatch(logoutUser()).unwrap()
        localStorage.clear()
        router.replace("/login")
    }

    return (
        <header className={styles.header}>
            <Box className={styles.leftContainer}>
                <Typography
                    onClick={() => router.push('/')}
                    className={styles.title}
                >
                    Setup
                </Typography>
            </Box>

            <Box className={styles.rightContainer}>

                {user ? (
                    <>
                        <Button
                            variant="outlined"
                            sx={{ color: "#DB2D43", borderColor: "#DB2D43" }}
                            onClick={async () => {
                                await handleLogOut()
                            }}
                        >
                            Log Out
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={() => {
                            router.push("/login")
                        }}
                    >
                        Sign In
                    </Button>
                )}
            </Box>
        </header >
    )
}