"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, X, Send, User } from "lucide-react";

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
};

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isOpen) return;

    let isMounted = true;

    const loadChat = async () => {
      // Find open chat
      const { data: chats } = await supabase
        .from("support_chats")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(1);

      if (chats && chats.length > 0) {
        if (isMounted) setChatId(chats[0].id);
        
        // Load messages
        const { data: msgs } = await supabase
          .from("support_messages")
          .select("*")
          .eq("chat_id", chats[0].id)
          .order("created_at", { ascending: true });
        
        if (msgs && isMounted) setMessages(msgs);
      }
    };

    loadChat();

    return () => { isMounted = false; };
  }, [user, isOpen]);

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat_${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Prevent duplicates if we already added it optimistically
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    let currentChatId = chatId;

    try {
      // Create chat if it doesn't exist
      if (!currentChatId) {
        const { data: newChat, error: chatError } = await supabase
          .from("support_chats")
          .insert({
            user_id: user.id,
            user_email: user.email,
            status: "open",
          })
          .select()
          .single();

        if (chatError) throw chatError;
        currentChatId = newChat.id;
        setChatId(currentChatId);
      }

      const msgText = newMessage.trim();
      setNewMessage("");

      const { error: msgError } = await supabase
        .from("support_messages")
        .insert({
          chat_id: currentChatId,
          sender_id: user.id,
          sender_role: "user",
          content: msgText,
        });

      if (msgError) throw msgError;

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user && !isOpen) return null; // Only render button if not logged in if they open it

  // Do not show the support chat widget to the admin
  if (user?.email === "johnwilbertgamis2022@gmail.com") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-netflix-red text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-[#141414] border border-gray-700 rounded-lg shadow-2xl w-[350px] max-w-[calc(100vw-48px)] flex flex-col h-[500px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-netflix-dark p-4 border-b border-gray-800 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-netflix-red" />
              <span className="font-bold text-white">Live Support</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
            {!user ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <User className="w-12 h-12 mb-4 text-gray-600" />
                <p>Please log in to chat with support.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <MessageCircle className="w-12 h-12 mb-4 text-gray-600" />
                <p>Send a message to start chatting with our team!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender_role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isUser
                          ? "bg-netflix-red text-white rounded-br-none"
                          : "bg-gray-800 text-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer (Input) */}
          {user && (
            <div className="p-3 border-t border-gray-800 bg-netflix-dark rounded-b-lg">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-netflix-red"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className="bg-netflix-red text-white p-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
