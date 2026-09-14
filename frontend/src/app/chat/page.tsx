"use client";

import { Box, Typography } from "@mui/material";
import HeaderComp from "@/component/header-comp/header-comp";
import ChatBox from "@/component/chat-box/chat-box";
import styles from "./chat.module.css";

export default function ChatPage() {
  return (
    <Box className={styles.container}>
      <HeaderComp />

      <Box className={styles.contentWrapper}>
        <Box className={styles.header}>
          <Typography variant="h5" className={styles.title}>
            💬 Conversational AI Assistant
          </Typography>
          <Typography variant="body2" className={styles.subtitle}>
            Chat naturally to search parts, filter by price and availability, compare flight controllers, and add URLs to your watchlist.
          </Typography>
        </Box>

        <ChatBox />
      </Box>
    </Box>
  );
}
