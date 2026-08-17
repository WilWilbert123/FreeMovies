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
        const onlineUsersMap = new Map<string, { device?: string, browser?: string, location?: string }>();

        for (const id in newState) {
          const presences: any[] = newState[id];
          presences.forEach((p) => {
            if (p.user_id) {
              onlineUsersMap.set(p.user_id, {
                device: p.device,
                browser: p.browser,
                location: p.location
              });
            }
          });
        }

        const onlineUsersList = Array.from(onlineUsersMap.entries()).map(([id, data]) => ({
          id,
          device: data.device,
          browser: data.browser,
          location: data.location
        }));
        
        console.log("📡 [WebSocket] Presence Sync: Online Users =", onlineUsersList);
        useOnlineStore.getState().setOnlineUsers(onlineUsersList);
      });

      channel.subscribe(async (status: string) => {
        if (status === "SUBSCRIBED" && session?.user && isMounted) {
          const UAParser = (await import('ua-parser-js')).UAParser;
          const parser = new UAParser();
          const result = parser.getResult();
          
          let baseDeviceName = result.os.name || "Unknown OS";
          if (result.device.vendor && result.device.model) {
            baseDeviceName = `${result.device.vendor} ${result.device.model}`;
          } else if (result.device.type === 'mobile') {
            baseDeviceName = result.os.name === 'iOS' ? 'iPhone (iOS)' : 'Mobile Device';
          } else if (result.device.type === 'tablet') {
            baseDeviceName = result.os.name === 'iOS' ? 'iPad (iOS)' : 'Tablet Device';
          }

          // Advanced Hardware Fingerprinting
          const getAdvancedDeviceInfo = async (fallback: string, os: string) => {
            // 1. High Entropy Client Hints (Android / Chromium)
            if (typeof navigator !== 'undefined' && (navigator as any).userAgentData && (navigator as any).userAgentData.getHighEntropyValues) {
              try {
                const uaData = await (navigator as any).userAgentData.getHighEntropyValues(['model']);
                if (uaData && uaData.model) {
                  const vendor = result.device.vendor ? result.device.vendor + " " : "";
                  return `${vendor}${uaData.model} (${os})`;
                }
              } catch (e) {}
            }
            // 2. WebGL GPU Chip Fingerprinting (Apple / Mac)
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
              if (gl) {
                const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                  const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                  if (renderer && renderer.length > 0) {
                    // If it's iOS and just says "Apple GPU", it's Apple's new privacy mask, so we keep fallback
                    if (renderer !== "Apple GPU" && renderer !== "Google SwiftShader") {
                      return `${fallback} [${renderer}]`;
                    }
                  }
                }
              }
            } catch (e) {}
            
            return fallback;
          };

          const exactDeviceName = await getAdvancedDeviceInfo(baseDeviceName, result.os.name || "Unknown OS");

          // 3. Location Tracking
          const getLocation = async () => {
            // First Try: Precise GPS Location (ONLY if permission was already granted previously)
            try {
              if (navigator.permissions && navigator.geolocation) {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                if (permission.state === 'granted') {
                  // Silently grab exact coordinates
                  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                  });
                  // Reverse Geocode using free OpenStreetMap API to get exact Barangay/City
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                  const data = await res.json();
                  if (data && data.address) {
                    const addr = data.address;
                    const village = addr.village || addr.suburb || addr.neighbourhood || addr.quarter || addr.residential;
                    const city = addr.city || addr.town || addr.municipality;
                    const province = addr.state || addr.province || addr.region;
                    
                    const parts = [];
                    if (village) parts.push(village);
                    if (city) parts.push(city);
                    if (province) parts.push(province);
                    
                    if (parts.length > 0) return parts.join(", ");
                  }
                }
              }
            } catch (e) {
              // Ignore GPS errors and silently fall back
            }

            // Fallback: Silent IP-based location (No popup required, gives general City)
            try {
              const res = await fetch('https://ipwho.is/');
              const data = await res.json();
              if (data && data.success && data.city && data.country) {
                return `${data.city}, ${data.country}`;
              }
            } catch (e) {
              console.error("Location fetch failed:", e);
            }
            return "Unknown Location";
          };
          const userLocation = await getLocation();

          await channel.track({
            user_id: session.user.id,
            email: session.user.email,
            online_at: new Date().toISOString(),
            device: exactDeviceName,
            browser: result.browser.name || "Unknown Browser",
            location: userLocation,
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
