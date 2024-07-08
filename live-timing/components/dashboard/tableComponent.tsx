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
import { RaceData } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { getFastestLapCars } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const TableComponent = () => {
  const [raceData, setRaceData] = useState<RaceData[]>([]);

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

      setRaceData(getFastestLapCars(newData));
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center font-extrabold text-3xl gap-10">
      <div className="flex flex-row-reverse p-5">
        <h1>Live Daten</h1>
        {/* <p>{raceTime.toFixed(1)}</p> */}
      </div>
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
          <TableBody>
            {raceData.map((car) =>
              car.has_fastest_lap ? (
                <TableRow key={car.num}>
                  {/* Use real position here but sort list in backend */}
                  <TableCell>{raceData.indexOf(car) + 1}</TableCell>
                  <TableCell className="bg-purple-400">{car.num}</TableCell>
                  <TableCell>{formatTime(car.laptime, "laptime")}</TableCell>
                  <TableCell>{formatTime(car.bestlap, "laptime")}</TableCell>
                  <TableCell>{car.laps}</TableCell>
                </TableRow>
              ) : (
                <TableRow key={car.num}>
                  <TableCell>{raceData.indexOf(car) + 1}</TableCell>
                  <TableCell>{car.num}</TableCell>
                  <TableCell>{formatTime(car.laptime, "laptime")}</TableCell>
                  <TableCell>{formatTime(car.bestlap, "laptime")}</TableCell>
                  <TableCell>{car.laps}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TableComponent;
