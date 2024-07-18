import { RaceData } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";
import React from "react";
import FuelStatusBar from "../dashboard/FuelBar";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell } from "@/components/ui/table";

type DirverComponentProps = {
  data: RaceData | null;
};

const DirverDisplayingComponent = ({ data }: DirverComponentProps) => {
  if (!data) {
    return <Skeleton className="h-20" />;
  }

  return (
    <tr className="bg-gray-800 text-white text-2xl">
      <TableCell className={cn("p-2 w-10 text-center")}>{data.num}</TableCell>
      <TableCell
        className={cn("p-2  text-center", {
          "bg-green-500": data.has_fastest_lap,
        })}
      >
        {data.num}
      </TableCell>
      <TableCell className={cn("p-2 text-center")}>
        {formatTime(data.laptime, "laptime")}
      </TableCell>
      <TableCell className={cn("p-2 text-center")}>
        {formatTime(data.bestlap, "laptime")}
      </TableCell>
      <TableCell className={cn("p-2 w-10 text-center")}>{data.laps}</TableCell>
      <TableCell>
        <FuelStatusBar fuelLevel={data.fuel} />
      </TableCell>
    </tr>
  );
};

export default DirverDisplayingComponent;
