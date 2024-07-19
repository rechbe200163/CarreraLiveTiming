import { cn } from "@/lib/utils";
import React from "react";

type FuelStatusBarProps = {
  fuelLevel: number;
};

export default function FuelStatusBar({ fuelLevel }: FuelStatusBarProps) {
  return (
    <div className="flex flex-row items-center justify-center px-2 -skew-x-6 ">
      <div className="w-full bg-gray-500/40 h-4  rounded-md overflow-hidden my-6">
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
    </div>
  );
}
