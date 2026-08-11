// src/components/ProgressBar.tsx

"use client";

import React from "react";
import { Check } from "lucide-react";

interface ProgressBarProps {
  progress: number; // 0-100
  status: "queued" | "downloading" | "completed" | "error";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status }) => {
  const getColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "downloading":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded h-4 overflow-hidden">
      <div
        className={`h-full ${getColor()}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
