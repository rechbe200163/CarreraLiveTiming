import { cn } from "@/lib/utils";
import React from "react";
import { styleText } from "util";

export default function FuelStatusBar({ fuelLevel }: { fuelLevel: number }) {
  return (
    <div>
      <div className="bg-fuel-bar rounded-lg">
        <div
          className={cn(
            "bg-fuel-bar-fill items-center justify-center text-white",
            {
              "bg-red-500": fuelLevel < 20,
              "bg-yellow-500": fuelLevel >= 20 && fuelLevel < 50,
              "bg-green-500": fuelLevel >= 50,
            }
          )}
          style={{ width: `${fuelLevel}%` }}
        >
          {fuelLevel}%
        </div>
      </div>
    </div>
  );
}
