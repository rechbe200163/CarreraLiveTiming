import { RaceData } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";
import React from "react";
import FuelStatusBar from "../dashboard/FuelBar";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell } from "@/components/ui/table";

type DriverComponentProps = {
  data: RaceData | null;
  index: number;
};

const DriverDisplayingComponent = ({ data, index }: DriverComponentProps) => {
  if (!data) {
    return <Skeleton className="h-20" />;
  }

  return (
    <tr className="bg-gray-800 text-white text-3xl">
      <TableCell className={cn("p-2 w-10 text-center -skew-x-6 ")}>
        <span className="skew-x-6 inline-block">{index + 1}</span>
      </TableCell>
      <TableCell
        className={cn("p-2 text-center -skew-x-6 ", {
          "bg-green-500": data.num === 1,
          "bg-black": data.num === 2,
          "bg-red-600": data.num === 3,
          "bg-blue-600": data.num === 4,
          "bg-yellow-400": data.num === 5,
          "bg-purple-600": data.num === 6,
          "bg-indigo-600": data.num === 7,
        })}
      >
        <span className="skew-x-6 inline-block">{data.num}</span>
      </TableCell>
      <TableCell className={cn("p-2 text-center -skew-x-6 ")}>
        <span className="skew-x-6 inline-block">
          {formatTime(data.laptime, "laptime")}
        </span>
      </TableCell>
      <TableCell
        className={cn(
          "p-2 text-center -skew-x-6 transition-colors duration-1000 ",
          {
            "bg-green-500": data.has_fastest_lap,
          }
        )}
      >
        <span className="skew-x-6 inline-block">
          {formatTime(data.bestlap, "laptime")}
        </span>
      </TableCell>
      <TableCell className={cn("p-2 w-10 text-center -skew-x-6 ")}>
        <span className="skew-x-6 inline-block">{data.laps}</span>
      </TableCell>
      <TableCell className="-skew-x-6 ">
        <div className="skew-x-6">
          <FuelStatusBar fuelLevel={data.fuel} />
        </div>
      </TableCell>
    </tr>
  );
};

export default DriverDisplayingComponent;
