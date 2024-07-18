import { cn } from "@/lib/utils";
import React from "react";

type FuelStatusBarProps = {
  fuelLevel: number;
};

export default function FuelStatusBar({ fuelLevel }: FuelStatusBarProps) {
  return (
    <>
      <div className="w-24 bg-gray-700 h-4 rounded-full overflow-hidden">
        <div
          className={cn("h-full items-center justify-center text-white", {
            "bg-red-500": fuelLevel < 20,
            "bg-yellow-500": fuelLevel >= 20 && fuelLevel < 50,
            "bg-green-500": fuelLevel >= 50,
          })}
          style={{ width: `${fuelLevel}%` }}
        ></div>
      </div>
      <div className="ml-2">{fuelLevel}%</div>
    </>
  );
}
