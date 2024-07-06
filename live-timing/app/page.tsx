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
import useWebSocket, { ReadyState } from "react-use-websocket";
import React, { useState, useEffect } from "react";

interface RaceData {
  car_id: number;
  position: number;
  last_lap_time: number;
  best_lap_time: number;
  laps: number;
}

const CarreraData: React.FC = () => {
  const [raceData, setRaceData] = useState<RaceData[]>([]);
  const { lastMessage, readyState } = useWebSocket("ws://localhost:8765");

  useEffect(() => {
    if (lastMessage !== null) {
      const newData: RaceData = JSON.parse(lastMessage.data);
      console.log(newData);
      setRaceData((prevData) => {
        // Update or add new data based on car_id or any unique identifier
        const existingIndex = prevData.findIndex(
          (data) => data.car_id === newData.car_id
        );
        if (existingIndex !== -1) {
          // Update existing data
          prevData[existingIndex] = newData;
          return [...prevData];
        } else {
          // Add new data
          return [...prevData, newData];
        }
      });
    }
  }, [lastMessage]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      console.log("WebSocket connection established.");
    } else if (readyState === ReadyState.CLOSED) {
      console.log("WebSocket connection closed.");
    }
  }, [readyState]);
  
  return(
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
              <TableRow key={ raceData.indexOf(car) }>
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
