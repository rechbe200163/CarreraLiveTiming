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
import React, { useState, useEffect } from "react";
import { getFastestLapCars } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { RaceData } from "@/lib/types";
import io from "socket.io-client";
import clsx from "clsx";

const TableComponent = () => {
  const [raceData, setRaceData] = useState<RaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fastestLap, setFastestLap] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const socket = io("http://localhost:8765", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("WebSocket connection established.");
      socket.emit("update");
    });

    socket.on("update", (newData: RaceData[]) => {
      console.log("Received update:", newData);
      const processedData = getFastestLapCars(newData);
      const newFastestLap = Math.min(
        ...processedData.map((data) => data.bestlap)
      );

      // Check if there is a new fastest lap
      if (fastestLap === null || newFastestLap < fastestLap) {
        setFastestLap(newFastestLap);
        toast({
          title: "Fastest Lap!",
          description: `A new fastest lap has been set! ${formatTime(
            newFastestLap
          )}`,
          variant: "fastest",
        });
      }

      setRaceData(processedData);
      setLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed.");
    });

    return () => {
      socket.disconnect();
    };
  }, [fastestLap]);

  return (
    <>
      <div className="w-full lg:w-2/3 font-normal antialiased">
        <Table>
          <TableCaption>Live Daten aus dem Rennen</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Position</TableHead>
              <TableHead className="w-[100px]">Car</TableHead>
              <TableHead className="w-[100px]">Last Lap</TableHead>
              <TableHead className="w-[100px]">Best Lap</TableHead>
              <TableHead className="w-[100px]">Laps</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <RacingDataSkeleton />
          ) : (
            <TableBody>
              {raceData.map((car) =>
                car.has_fastest_lap ? (
                  <TableRow
                    key={car.num}
                    className={clsx({ "h-12 duration-1000": fastestLap })}
                  >
                    <TableCell>{raceData.indexOf(car) + 1}</TableCell>
                    <TableCell className="bg-purple-400">
                      {car.num + 1}
                    </TableCell>
                    <TableCell>{formatTime(car.laptime, "laptime")}</TableCell>
                    <TableCell>{formatTime(car.bestlap, "laptime")}</TableCell>
                    <TableCell>{car.laps}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={car.num}>
                    <TableCell>{raceData.indexOf(car) + 1}</TableCell>
                    <TableCell>{car.num + 1}</TableCell>
                    <TableCell>{formatTime(car.laptime, "laptime")}</TableCell>
                    <TableCell>{formatTime(car.bestlap, "laptime")}</TableCell>
                    <TableCell>{car.laps}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          )}
        </Table>
      </div>
    </>
  );
};

export default TableComponent;
