"use client"

import { useAppSelector } from "@/redux/hooks.ts"
import { Box, Typography, } from "@mui/material"
import { RootState } from "@/redux/store";
import styles from "./home.module.css";
import HeaderComp from "@/component/header-comp/header-comp";

export default function Home() {
  const { user } = useAppSelector((state: RootState) => state.userReducer);

  return (
    <Box className={styles.container}>
      <Box className={styles.headerBox}>
        <HeaderComp />
      </Box>

      <Typography>Username - {user?.username}</Typography>
      <Typography>Email - {user?.email}</Typography>
      <Typography>Role - {user?.role}</Typography>
    </Box>
  )
}