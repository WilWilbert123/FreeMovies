"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type ChartData = {
  date: string;
  users: number;
  newUsers: number;
};

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChartData[]>([]);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: users, error } = await supabase.rpc("get_all_users");

        if (error) throw error;

        if (users && isMounted) {
          // Process data to group by date
          const countsByDate: Record<string, number> = {};

          users.forEach((u: AdminUser) => {
            const dateStr = new Date(u.created_at).toISOString().split("T")[0];
            countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
          });

          // Sort dates
          let sortedDates = Object.keys(countsByDate).sort();
          
          // Recharts AreaChart requires at least 2 data points to render.
          // If we only have users from 1 single day, add a dummy 'yesterday' with 0 users.
          if (sortedDates.length === 1) {
            const singleDate = new Date(sortedDates[0]);
            singleDate.setDate(singleDate.getDate() - 1);
            const yesterdayStr = singleDate.toISOString().split("T")[0];
            countsByDate[yesterdayStr] = 0;
            sortedDates = [yesterdayStr, sortedDates[0]];
          }

          let cumulative = 0;
          
          const chartData: ChartData[] = sortedDates.map((date) => {
            cumulative += countsByDate[date];
            return {
              date,
              users: cumulative,
              newUsers: countsByDate[date],
            };
          });

          setData(chartData);
        }
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        if (isMounted) setError("Failed to load analytics data.");
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
      <div className="p-6 border-b border-gray-800 bg-[#141414] flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-netflix-red" />
            User Growth Analytics
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Track user registrations over time.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2 md:p-6 flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-400">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Users className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Not enough data to display a chart.</p>
          </div>
        ) : (
          <div className="flex-1 w-full bg-[#141414] border border-gray-800 rounded-lg p-3 md:p-6 shadow-xl overflow-hidden">
            <h3 className="text-sm md:text-lg font-semibold mb-4 md:mb-6 text-gray-300">Cumulative User Signups</h3>
            <div className="w-full h-[250px] md:h-[400px] min-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E50914" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    tick={{ fill: '#888' }} 
                    tickLine={{ stroke: '#888' }}
                  />
                  <YAxis 
                    stroke="#888" 
                    tick={{ fill: '#888' }} 
                    tickLine={{ stroke: '#888' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#E50914' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#E50914"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    activeDot={{ r: 8, fill: "#E50914" }}
                    name="Total Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
