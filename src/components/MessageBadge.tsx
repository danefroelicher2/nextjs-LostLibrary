// src/components/MessageBadge.tsx
"use client";

import { useState, useEffect } from "react";
import { getUnreadCount, markAllMessagesAsRead } from "@/lib/messageUtils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

interface MessageBadgeProps {
  className?: string;
}

export default function MessageBadge({ className = "" }: MessageBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    // Fetch unread message count on component mount
    fetchUnreadCount();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to message updates (mark as read)
    const messagesUpdateSubscription = supabase
      .channel("messages-update-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      messagesUpdateSubscription.unsubscribe();
    };
  }, [user]);

  // Clear badge when user visits the messages page
  useEffect(() => {
    if (pathname?.startsWith("/messages") && user && unreadCount > 0) {
      markAllMessagesAsRead().then(() => {
        setUnreadCount(0);
      });
    }
  }, [pathname, user, unreadCount]);

  const fetchUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  if (unreadCount === 0) return null;

  return (
    <div
      className={`bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center ${className}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </div>
  );
}
