"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOnlineStore } from "@/store/useOnlineStore";

export default function PresenceTracker() {
  const supabase = createClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const setupPresence = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Clean up existing channel if any
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Sometimes in React Strict Mode, the Supabase client retains the channel.
      // So we make sure to grab the existing one and remove it.
      const existingChannel = supabase.getChannels().find(c => c.topic === "realtime:online-users");
      if (existingChannel) {
        await supabase.removeChannel(existingChannel);
      }

      const channel = supabase.channel("online-users", {
        config: {
          presence: {
            key: session?.user?.id || 'anonymous',
          },
        },
      });
      channelRef.current = channel;

      channel.on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const onlineIds = new Set<string>();

        for (const id in newState) {
          const presences: any[] = newState[id];
          presences.forEach((p) => {
            if (p.user_id) onlineIds.add(p.user_id);
          });
        }

        console.log("📡 [WebSocket] Presence Sync: Online Users =", Array.from(onlineIds));
        useOnlineStore.getState().setOnlineUsers(Array.from(onlineIds));
      });

      channel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED" && session?.user && isMounted) {
          await channel.track({
            user_id: session.user.id,
            email: session.user.email,
            online_at: new Date().toISOString(),
          });
        }
      });
    };

    setupPresence();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setupPresence();
        } else if (event === "SIGNED_OUT") {
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
          }
          useOnlineStore.getState().setOnlineUsers([]);
        }
      }
    );

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      subscription.unsubscribe();
    };
  }, [supabase]);

  return null; // This component doesn't render anything
}
