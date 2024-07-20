import { cn } from "@/lib/utils";
import React from "react";

type FuelStatusBarProps = {
  fuelLevel: number;
};

export default function FuelStatusBar({ fuelLevel }: FuelStatusBarProps) {
  return (
    <div className="flex flex-row items-center justify-center -skew-x-6 my-13">
      <div className="relative w-full bg-gray-500/40 h-20 rounded overflow-hidden">
        <div
          className={cn("h-full flex items-center justify-center", {
            "bg-red-500": fuelLevel < 20,
            "bg-yellow-500": fuelLevel >= 20 && fuelLevel < 50,
            "bg-green-500": fuelLevel >= 50,
            "bg-red-600 animate-pulse": fuelLevel === 0, // Changed to animate-pulse
          })}
          style={{ width: `${fuelLevel}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {fuelLevel}%
        </div>
      </div>
    </div>
  );
}
