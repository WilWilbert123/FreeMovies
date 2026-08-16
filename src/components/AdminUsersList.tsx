"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, Mail, Calendar, Clock, Film, Tv, Trophy, TrendingUp, Activity } from "lucide-react";
import { useOnlineStore } from "@/store/useOnlineStore";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type GlobalWatchEvent = {
  id: string;
  user_id: string;
  user_email: string;
  media_id: string;
  media_type: string;
  title: string;
  started_at: string;
};

type TopTitle = {
  title: string;
  media_type: string;
  count: number;
};

export default function AdminUsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, any[]>>({});
  const [totalWatches, setTotalWatches] = useState<number>(0);
  const [globalHistory, setGlobalHistory] = useState<GlobalWatchEvent[]>([]);
  const [topTitles, setTopTitles] = useState<TopTitle[]>([]);
  const [movieCount, setMovieCount] = useState<number>(0);
  const [tvCount, setTvCount] = useState<number>(0);

  const onlineUsersArray = useOnlineStore((state) => state.onlineUsers);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchUsersAndProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch Users from RPC
        const { data: usersData, error: usersError } = await supabase.rpc("get_all_users");

        if (usersError) {
          throw usersError;
        }

        if (usersData && isMounted) {
          const usersArr = usersData as AdminUser[];
          setUsers(usersArr);

          // 2. Fetch Profiles for all these users
          const { data: profilesData, error: profilesError } = await supabase.rpc("get_all_profiles");

          if (!profilesError && profilesData) {
            const profilesMap: Record<string, any[]> = {};
            profilesData.forEach((p: any) => {
              if (!profilesMap[p.user_id]) profilesMap[p.user_id] = [];
              profilesMap[p.user_id].push(p);
            });
            if (isMounted) setProfiles(profilesMap);
          } else if (profilesError) {
            console.error("Profiles error:", profilesError);
          }

          // 3. Fetch Watch History for all users & compute analytics
          try {
            const historyPromises = usersArr.map(async (u) => {
              const res = await supabase.rpc("get_user_watch_history", { target_user_id: u.id });
              if (res.data) {
                return res.data.map((item: any) => ({
                  ...item,
                  user_email: u.email,
                }));
              }
              return [];
            });

            const historyResults = await Promise.all(historyPromises);
            const allEvents: GlobalWatchEvent[] = historyResults.flat();

            if (isMounted) {
              setTotalWatches(allEvents.length);

              // Sort newest first
              const sortedEvents = [...allEvents].sort(
                (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
              );
              setGlobalHistory(sortedEvents.slice(0, 20));

              // Compute movie vs tv and top titles
              let movies = 0;
              let tvs = 0;
              const titleMap: Record<string, { media_type: string; count: number }> = {};

              allEvents.forEach((evt) => {
                if (evt.media_type === "movie") movies++;
                else if (evt.media_type === "tv") tvs++;

                if (!titleMap[evt.title]) {
                  titleMap[evt.title] = { media_type: evt.media_type, count: 0 };
                }
                titleMap[evt.title].count += 1;
              });

              setMovieCount(movies);
              setTvCount(tvs);

              const sortedTitles: TopTitle[] = Object.entries(titleMap)
                .map(([title, info]) => ({
                  title,
                  media_type: info.media_type,
                  count: info.count,
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

              setTopTitles(sortedTitles);
            }
          } catch (e) {
            console.error("Failed to load total watches:", e);
          }
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

    fetchUsersAndProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex w-full flex-col bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-[#141414] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-netflix-red" />
            Admin Dashboard Overview
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time analytics and registered users on FiliFlix.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="bg-gray-800 flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg flex flex-col items-center border border-gray-700 shadow-md">
            <span className="text-2xl md:text-3xl font-bold text-netflix-red">
              {loading ? "-" : users.length}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400 uppercase font-semibold tracking-wider text-center">
              Total Users
            </span>
          </div>
          <div className="bg-gray-800 flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg flex flex-col items-center border border-gray-700 shadow-md">
            <span className="text-2xl md:text-3xl font-bold text-green-500">
              {loading ? "-" : onlineUsersArray.length}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400 uppercase font-semibold tracking-wider text-center">
              Total Online
            </span>
          </div>
          <div className="bg-gray-800 flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg flex flex-col items-center border border-gray-700 shadow-md">
            <span className="text-2xl md:text-3xl font-bold text-blue-500">
              {loading ? "-" : totalWatches}
            </span>
            <span className="text-[10px] md:text-xs text-gray-400 uppercase font-semibold tracking-wider text-center">
              Total Plays
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Registered Users Table (2 Cols on Large) */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-netflix-red" />
                Registered Users List ({users.length})
              </h3>
              <div className="bg-[#141414] border border-gray-800 rounded-lg overflow-x-auto shadow-xl">
                <table className="w-full text-left text-xs md:text-sm min-w-[500px]">
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
                          <Users className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                          Profiles
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
                    {users.map((u) => {
                      const onlineData = onlineUsersArray.find((ou) => ou.id === u.id);
                      const isOnline = !!onlineData;
                      const userProfiles = profiles[u.id] || [];

                      return (
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
                            {isOnline ? (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                  <span className="text-green-500 font-medium">Online</span>
                                </div>
                                <span className="text-[10px] text-gray-500 mt-1">{onlineData.device || "Unknown Device"}</span>
                                {onlineData.browser && <span className="text-[10px] text-gray-600">{onlineData.browser}</span>}
                                {onlineData.location && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[10px] text-blue-400 font-medium truncate max-w-[120px]">{onlineData.location}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                                <span className="text-gray-500">Offline</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2 md:px-6 md:py-4 text-gray-400">
                            <div className="flex flex-col">
                              <span className="text-gray-200 font-medium">{userProfiles.length} Profiles</span>
                              {userProfiles.length > 0 && (
                                <span className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                                  {userProfiles.map(p => p.name).join(", ")}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 md:px-6 md:py-4 text-gray-400">
                            {u.last_sign_in_at
                              ? new Date(u.last_sign_in_at).toLocaleString()
                              : "Never"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analytics Sidebar (1 Col on Large) */}
            <div className="space-y-6">
              {/* Movies vs TV Shows */}
              <div className="bg-[#141414] border border-gray-800 rounded-lg p-5 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-netflix-red" />
                  Movies vs. TV Shows
                </h3>
                {totalWatches === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No watch data available.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-gray-300">
                      <span className="flex items-center gap-1.5 text-netflix-red">
                        <Film className="w-4 h-4" />
                        Movies: {movieCount} ({Math.round((movieCount / totalWatches) * 100)}%)
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <Tv className="w-4 h-4" />
                        TV: {tvCount} ({Math.round((tvCount / totalWatches) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-netflix-red h-full transition-all duration-500"
                        style={{ width: `${(movieCount / totalWatches) * 100}%` }}
                      />
                      <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${(tvCount / totalWatches) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Top 5 Most Watched */}
              <div className="bg-[#141414] border border-gray-800 rounded-lg p-5 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top 5 Most Watched
                </h3>
                {topTitles.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No watch data available.</p>
                ) : (
                  <div className="space-y-2.5">
                    {topTitles.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded bg-gray-900/60 border border-gray-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${idx === 0
                                ? "bg-yellow-500 text-black"
                                : idx === 1
                                  ? "bg-gray-400 text-black"
                                  : idx === 2
                                    ? "bg-amber-700 text-white"
                                    : "bg-gray-800 text-gray-400"
                              }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-white font-medium truncate">{item.title}</span>
                        </div>
                        <span className="text-netflix-red font-bold shrink-0">{item.count} plays</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Global Recent Activity Feed */}
              <div className="bg-[#141414] border border-gray-800 rounded-lg p-5 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-green-500" />
                  Global Recent Activity
                </h3>
                {globalHistory.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">No recent activity detected.</p>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {globalHistory.map((event) => (
                      <div
                        key={event.id}
                        className="p-2.5 rounded bg-gray-900/60 border border-gray-800 text-xs space-y-1"
                      >
                        <div className="flex justify-between items-center text-gray-400">
                          <span className="font-semibold text-gray-300 truncate max-w-[150px]">
                            {event.user_email}
                          </span>
                          <span className="text-[10px] text-gray-500 shrink-0">
                            {new Date(event.started_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white font-medium truncate">
                          {event.media_type === "movie" ? (
                            <Film className="w-3.5 h-3.5 text-netflix-red shrink-0" />
                          ) : (
                            <Tv className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
