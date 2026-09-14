"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { logoutUser } from "@/redux/feature/user/user-action";
import { RootState } from "@/redux/store";
import styles from "./header-comp.module.css";
import { useAppDispatch, useAppSelector } from "@/redux/hooks.ts";

export default function HeaderComp() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.userReducer);

  const handleLogOut = async () => {
    await dispatch(logoutUser()).unwrap();
    localStorage.clear();
    router.replace("/login");
  };

  const navLinks = [
    { label: "📦 Parts Catalog", path: "/" },
    { label: "⭐ Watchlist", path: "/watchlist" },
    { label: "💬 AI Assistant", path: "/chat" },
    { label: "📊 Monitoring & Alerts", path: "/monitoring" },
  ];

  return (
    <header className={styles.header}>
      <Box className={styles.leftContainer}>
        <Typography
          onClick={() => router.push("/")}
          className={styles.title}
        >
          🚁 AeroHunt <span className={styles.subtitle}>AI Drone Assistant</span>
        </Typography>

        {/* Navigation Links */}
        <Box className={styles.navLinks}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Button
                key={link.path}
                size="small"
                onClick={() => router.push(link.path)}
                className={isActive ? styles.navButtonActive : styles.navButton}
              >
                {link.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box className={styles.rightContainer}>
        {user ? (
          <Button
            variant="outlined"
            size="small"
            className={styles.logoutBtn}
            onClick={handleLogOut}
          >
            Log Out
          </Button>
        ) : (
          <Button
            variant="outlined"
            size="small"
            className={styles.signInBtn}
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        )}
      </Box>
    </header>
  );
}