"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Paper, Typography, TextField, Button, Chip } from "@mui/material";
import { ApiService } from "@/service/api.service";
import { chatMessageSchema, ChatMessageSchemaType } from "@/schemas/chat";
import styles from "./chat-box.module.css";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
  time: string;
}

interface ChatBoxProps {
  onWatchlistUpdated?: () => void;
}

export default function ChatBox({ onWatchlistUpdated }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "👋 Hello! I am your AI Drone Parts Assistant.\n\nAsk me anything:\n• \"Find flight controllers under ₹10,000 in stock\"\n• \"Is Holybro Pixhawk 6X available?\"\n• \"Compare Raspberry Pi 5 vs Pixhawk 6X\"\n• \"Track https://robu.in/...\"",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
  } = useForm<ChatMessageSchemaType>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  const messageValue = watch("message");

  const sendText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    reset();
    setLoading(true);

    try {
      const res = await ApiService.sendChatMessage(textToSend);
      const botMsg: ChatMessage = {
        sender: "bot",
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);

      if (res.intent === "ADD_WATCHLIST" && onWatchlistUpdated) {
        onWatchlistUpdated();
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Error: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ChatMessageSchemaType) => {
    await sendText(data.message);
  };

  const handleSuggestionClick = (prompt: string) => {
    setValue("message", prompt);
    sendText(prompt);
  };

  const promptSuggestions = [
    "Flight controllers in stock under ₹15,000",
    "Is Holybro Pixhawk 6X in stock?",
    "Compare Raspberry Pi 5 vs Pixhawk 6X",
    "Show my watchlist",
  ];

  return (
    <Paper className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          🤖 AI Shopping Assistant
        </Typography>
        <Typography variant="body2" className={styles.subtitle}>
          Search products, filter by specifications or price, check stock history, and track parts via natural conversation.
        </Typography>

        <Box className={styles.suggestions}>
          {promptSuggestions.map((prompt) => (
            <Chip
              key={prompt}
              label={prompt}
              onClick={() => handleSuggestionClick(prompt)}
              clickable
              size="small"
              className={styles.suggestionChip}
            />
          ))}
        </Box>
      </Box>

      {/* Messages Feed */}
      <Box className={styles.messagesFeed}>
        {messages.map((msg, idx) => (
          <Box
            key={idx}
            className={msg.sender === "user" ? styles.messageUser : styles.messageBot}
          >
            <Typography variant="body2" className={styles.messageText}>
              {msg.text}
            </Typography>
            <Typography
              variant="caption"
              className={msg.sender === "user" ? styles.messageTimeUser : styles.messageTimeBot}
            >
              {msg.time}
            </Typography>
          </Box>
        ))}
        {loading && (
          <Box className={styles.loadingBox}>
            <Typography variant="body2" className={styles.loadingText}>
              Analyzing catalog & formulating response...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Input Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask a question, search drone parts, or type URL..."
          className={styles.inputField}
          {...register("message")}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !messageValue?.trim()}
          className={styles.sendButton}
        >
          Send
        </Button>
      </form>
    </Paper>
  );
}
