"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";

interface RaceData {
  timestamp: number;
  car_id: number;
  speed: number;
  position: number;
}

const CarreraData: React.FC = () => {
  const [raceData, setRaceData] = useState<RaceData[]>([]);

  const { lastMessage } = useWebSocket("ws://localhost:8765", {
    onOpen: () => console.log("Connected to WebSocket"),
    onMessage: (event) => {
      const newData: RaceData = JSON.parse(event.data);
      setRaceData((prevData: any) => {
        const existingIndex = prevData.findIndex(
          (data: any) => data.car_id === newData.car_id
        );

        if (existingIndex !== -1) {
          const updatedData = [...prevData];
          updatedData[existingIndex] = newData;
          updatedData.sort((a, b) => a.position - b.position);
          return updatedData;
        } else {
          const updatedData = [...prevData, newData];
          updatedData.sort((a, b) => a.position - b.position);
          return updatedData;
        }
      });
    },
    onError: (error) => console.error("WebSocket error:", error),
  });

  useEffect(() => {
    if (!lastMessage) {
      setRaceData([]);
    }
  }, [lastMessage]);

  return (
    <div className="flex flex-col items-center  font-extrabold text-3xl   gap-10">
      <div className="">
        <h1>Live Daten</h1>
      </div>
      <div className="w-full lg:w-2/3">
        <Table>
          <TableCaption>Live Daten aus dem Rennen </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Car</TableHead>
              <TableHead className="w-[100px]">Position</TableHead>
              <TableHead className="w-[100px]">Letzte Runde</TableHead>
              <TableHead className="w-[100px]">Schnellste Runde</TableHead>
              <TableHead className="w-[100px]">Runden</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {raceData.map((car) => (
              <TableRow key={car.car_id}>
                <TableCell className="font-medium">{car.car_id}</TableCell>
                <TableCell>{car.position}</TableCell>
                <TableCell>{car.timestamp}</TableCell>
                <TableCell className="text-right">{car.speed}</TableCell>
                <TableCell className="text-right">{car.speed}</TableCell>
                <TableCell className="text-right">{car.speed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CarreraData;
