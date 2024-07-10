"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RacingDataSkeleton from "./RacingDataSkeleton";
import { useToast } from "@/components/ui/use-toast";
import React, { useState, useEffect, Suspense } from "react";
import { connectToSocket, getFastestLapCars } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { RaceData } from "@/lib/types";
import { postRaceData } from "@/lib/db";
import clsx from "clsx";

interface TableComponentProps {
  type: string;
}

export default function TableComponent({ type }: TableComponentProps) {
  const [raceData, setRaceData] = useState<RaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const socket = connectToSocket("http://localhost:8765");

    socket.on("connect", () => {
      console.log("WebSocket connection established.");
      socket.emit("update");
    });

    socket.on("update", (newData: RaceData[]) => {
      console.log("Received update:", newData);
      const processedData = getFastestLapCars(newData);
      setRaceData(processedData);
      setLoading(false);
      if (type === "race" || type === "qualifying") {
        postRaceData(processedData);
      }

      // Check for new fastest lap
      const newFastestLap = Math.min(
        ...processedData.map((data) => data.bestlap)
      );
      const currentFastestLap = Math.min(
        ...raceData.map((data) => data.bestlap)
      );

      if (newFastestLap < currentFastestLap) {
        toast({
          title: "New fastest lap",
          description: `New fastest lap time: ${formatTime(
            newFastestLap,
            "laptime"
          )}`,
          variant: "fastest",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed.");
    });

    return () => {
      socket.disconnect();
    };
  }, [toast, type, raceData]); // Include raceData in dependencies to track changes

  return (
    <div className="w-full lg:w-2/3 font-normal antialiased">
      <Table>
        <TableCaption>Live Daten aus dem Rennen</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3">Position</TableHead>
            <TableHead className="w-3">Car</TableHead>
            <TableHead className="w-[100px]">Last Lap</TableHead>
            <TableHead className="w-[100px]">Best Lap</TableHead>
            <TableHead className="w-[100px]">Laps</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <Suspense fallback={<RacingDataSkeleton />}>
            {raceData.map((car: RaceData, index: number) => (
              <TableRow
                key={car.num}
                className={clsx("transition-colors duration-200", {
                  "bg-green-400 text-gray-500": car.has_fastest_lap === true,
                })}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{car.num + 1}</TableCell>
                <TableCell>{formatTime(car.laptime, "laptime")}</TableCell>
                <TableCell>{formatTime(car.bestlap, "laptime")}</TableCell>
                <TableCell>{car.laps}</TableCell>
              </TableRow>
            ))}
          </Suspense>
        </TableBody>
      </Table>
    </div>
  );
}
