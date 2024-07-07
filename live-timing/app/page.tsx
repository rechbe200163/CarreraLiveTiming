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
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

interface RaceData {
  car_id: number;
  position: number;
  last_lap_time: number;
  best_lap_time: number;
  laps: number;
}

const CarreraData: React.FC = () => {
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
      setRaceData(newData);
      console.log("Race data updated", raceData);
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
      <div>
        <h1>Live Daten</h1>
      </div>
      <div className="w-full lg:w-2/3">
        <Table>
          <TableCaption>Live Daten aus dem Rennen</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Car</TableHead>
              <TableHead className="w-[100px]">Position</TableHead>
              <TableHead className="w-[100px]">Last Lap</TableHead>
              <TableHead className="w-[100px]">Best Lap</TableHead>
              <TableHead className="w-[100px]">Laps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {raceData.map((car) => (
              <TableRow key={car.car_id}>
                <TableCell className="font-medium">{car.car_id}</TableCell>
                <TableCell>{car.position}</TableCell>
                <TableCell>{car.last_lap_time}</TableCell>
                <TableCell>{car.best_lap_time}</TableCell>
                <TableCell>{car.laps}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CarreraData;
