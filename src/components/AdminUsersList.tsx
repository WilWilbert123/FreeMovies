"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Mail, Calendar, Clock } from "lucide-react";
import { useOnlineStore } from "@/store/useOnlineStore";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function AdminUsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const onlineUsersArray = useOnlineStore((state) => state.onlineUsers);
  const onlineUsers = new Set(onlineUsersArray);
  
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Call the RPC function we created in Supabase
        const { data, error } = await supabase.rpc("get_all_users");

        if (error) {
          throw error;
        }

        if (data && isMounted) {
          setUsers(data as AdminUser[]);
        }
      } catch (err: any) {
        console.error("Error fetching users:", err);
        if (isMounted) {
          setError(
            "Failed to load users. Did you run the SQL script in the Implementation Plan to create the get_all_users() function?"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex w-full h-[600px] max-h-[70vh] flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-[#141414] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-netflix-red" />
            Registered Users
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Overview of all users signed up on FiliFlix.
          </p>
        </div>
        <div className="bg-gray-800 px-6 py-3 rounded-lg flex flex-col items-center border border-gray-700 shadow-md">
          <span className="text-3xl font-bold text-netflix-red">
            {loading ? "-" : users.length}
          </span>
          <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">
            Total Users
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-6 rounded-lg max-w-2xl mx-auto text-center">
            <Users className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Access Error</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No users found.</p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-gray-800 rounded-lg overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs md:text-sm min-w-[500px] md:min-w-[700px]">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr>
                  <th className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                      Email
                    </div>
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                      Joined
                    </div>
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 md:w-4 md:h-4 text-gray-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      </div>
                      Status
                    </div>
                  </th>
                  <th className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                      Last Sign In
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-3 py-2 md:px-6 md:py-4 font-medium text-gray-200">
                      {u.email}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-gray-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-gray-400">
                      {onlineUsers.has(u.id) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          <span className="text-green-500 font-medium">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                          <span className="text-gray-500">Offline</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 text-gray-400">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleString()
                        : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
