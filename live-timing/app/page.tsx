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
  car_id: number; // Reflecting the change from 'num'
  time: number;
  last_lap_time: number;
  best_lap_time: number;
  laps: number;
  pits: number;
  fuel: number;
  pit: boolean;
}

const CarreraData: React.FC = () => {
  const [raceData, setRaceData] = useState<RaceData[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("WebSocket connection established.");
      socket.emit("update");
    });

    socket.on("update", (newData: RaceData[]) => {
      console.log("Received update:", newData);
      setRaceData((prevData) => {
        const updatedData = [...prevData];
        newData.forEach((newCarData) => {
          const existingIndex = updatedData.findIndex(
            (data) => data.car_id === newCarData.car_id
          );
          if (existingIndex !== -1) {
            updatedData[existingIndex] = newCarData;
          } else {
            updatedData.push(newCarData);
          }
        });
        return updatedData;
      });
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
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead className="w-[100px]">Last Lap</TableHead>
              <TableHead className="w-[100px]">Best Lap</TableHead>
              <TableHead className="w-[100px]">Laps</TableHead>
              <TableHead className="w-[100px]">Pits</TableHead>
              <TableHead className="w-[100px]">Fuel</TableHead>
              <TableHead className="w-[100px]">In Pit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {raceData.map((car) => (
              <TableRow key={car.car_id}>
                <TableCell className="font-medium">{car.car_id}</TableCell>
                <TableCell>{car.time}</TableCell>
                <TableCell>{car.last_lap_time}</TableCell>
                <TableCell>{car.best_lap_time}</TableCell>
                <TableCell>{car.laps}</TableCell>
                <TableCell>{car.pits}</TableCell>
                <TableCell>{car.fuel}</TableCell>
                <TableCell>{car.pit ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CarreraData;
