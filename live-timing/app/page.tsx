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
import { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface RaceData {
  timestamp: number;
  car_id: number;
  position: number;
  last_lap_time: number; // Assuming last lap time is part of the data
  best_lap_time: number; // Assuming best lap time is part of the data
  laps: number; // Assuming total laps is part of the data
}

const CarreraData: React.FC = () => {
  const [raceData, setRaceData] = useState<RaceData[]>([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket("ws://localhost:8765", {
    onOpen: () => console.log("WebSocket connection opened"),
    shouldReconnect: (closeEvent) => true,
    onMessage: (event) => {
      console.log("Received message from WebSocket:", event.data);
      const newData: RaceData = JSON.parse(event.data);
      console.log("Parsed race data:", newData);

      setRaceData((prevData) => {
        const existingIndex = prevData.findIndex(
          (data) => data.car_id === newData.car_id
        );

        if (existingIndex !== -1) {
          const updatedData = [...prevData];
          updatedData[existingIndex] = newData;
          updatedData.sort((a, b) => a.position - b.position);
          console.log("Updated race data:", updatedData);
          return updatedData;
        } else {
          const updatedData = [...prevData, newData];
          updatedData.sort((a, b) => a.position - b.position);
          console.log("New race data:", updatedData);
          return updatedData;
        }
      });
    },
    onError: (error) => console.error("WebSocket error:", error),
    onClose: () => console.log("WebSocket connection closed"),
  });

  useEffect(() => {
    console.log("WebSocket ready state:", readyState);
    if (!lastMessage) {
      console.log("No last message, resetting race data");
      setRaceData([]);
    }
  }, [lastMessage, readyState]);

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
                <TableCell>{car.last_lap_time.toFixed(2)}s</TableCell>
                <TableCell>{car.best_lap_time.toFixed(2)}s</TableCell>
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
