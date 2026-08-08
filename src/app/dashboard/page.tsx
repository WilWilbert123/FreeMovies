"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminChat from "@/components/AdminChat";
import AdminUsersList from "@/components/AdminUsersList";
import AdminAnalytics from "@/components/AdminAnalytics";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "users" | "analytics">("chat");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email === "johnwilbertgamis2022@gmail.com") {
        setIsAdmin(true);
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    checkAdmin();
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#141414] text-white">
        <Navbar />
        <div className="pt-24 px-4 md:px-12 flex justify-center items-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#141414] text-white flex flex-col">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 flex-1 flex flex-col pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto p-1 scrollbar-hide shrink-0 max-w-full">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === "chat"
                  ? "bg-netflix-red text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === "users"
                  ? "bg-netflix-red text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Users List
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === "analytics"
                  ? "bg-netflix-red text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden flex shadow-2xl min-h-[600px]">
          {activeTab === "chat" && <AdminChat />}
          {activeTab === "users" && <AdminUsersList />}
          {activeTab === "analytics" && <AdminAnalytics />}
        </div>
      </div>
    </main>
  );
}
