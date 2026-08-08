"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, User, MessageCircle, Clock, ChevronLeft } from "lucide-react";

type Chat = {
  id: string;
  user_id: string;
  user_email: string;
  status: string;
  created_at: string;
};

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
};

export default function AdminChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 1. Fetch Admin User & Open Chats
  useEffect(() => {
    let isMounted = true;

    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      if (isMounted) setAdminUser(session.user);

      // Load all open chats
      const { data: openChats } = await supabase
        .from("support_chats")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (openChats && isMounted) {
        setChats(openChats);
      }
    };

    initDashboard();

    return () => { isMounted = false; };
  }, []);

  // 2. Listen to new chats globally
  useEffect(() => {
    const channel = supabase
      .channel("admin_chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_chats",
        },
        (payload) => {
          const newChat = payload.new as Chat;
          setChats((prev) => [newChat, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Load messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    let isMounted = true;
    const loadMessages = async () => {
      const { data: msgs } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", selectedChat.id)
        .order("created_at", { ascending: true });

      if (msgs && isMounted) {
        setMessages(msgs);
      }
    };

    loadMessages();

    return () => { isMounted = false; };
  }, [selectedChat]);

  // 4. Listen to new messages for the selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const channel = supabase
      .channel(`admin_chat_msgs_${selectedChat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `chat_id=eq.${selectedChat.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminUser || !selectedChat) return;

    setLoading(true);
    const msgText = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase
        .from("support_messages")
        .insert({
          chat_id: selectedChat.id,
          sender_id: adminUser.id,
          sender_role: "admin",
          content: msgText,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeChat = async (chatId: string) => {
    try {
      await supabase
        .from("support_chats")
        .update({ status: "closed" })
        .eq("id", chatId);
      
      setChats(chats.filter((c) => c.id !== chatId));
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to close chat", error);
    }
  };

  return (
    <div className="flex w-full h-[600px] max-h-[70vh]">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-1/3 border-r border-gray-800 bg-[#141414] flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-netflix-red" />
            Active Tickets ({chats.length})
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No active support requests.
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedChat?.id === chat.id ? "bg-gray-800 border-l-4 border-l-netflix-red" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate pr-2">
                    {chat.user_email}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Status: <span className="text-green-500 capitalize">{chat.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area - Chat Window */}
      <div className={`flex-1 flex-col bg-gray-900 ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-800 bg-[#141414] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-1 rounded-full hover:bg-gray-800 text-gray-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                  <h3 className="font-medium">{selectedChat.user_email}</h3>
                  <p className="text-xs text-gray-500">Started at {new Date(selectedChat.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => closeChat(selectedChat.id)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-sm rounded transition-colors text-gray-300"
              >
                Close Ticket
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Loading messages...
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isAdmin
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

            <div className="p-4 border-t border-gray-800 bg-[#141414]">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a reply to the user..."
                  className="flex-1 bg-gray-800 text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-netflix-red"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className="bg-netflix-red text-white px-6 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-700" />
            <p className="text-lg">Select a chat from the sidebar to view messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
