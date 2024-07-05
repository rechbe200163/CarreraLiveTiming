"use client";

import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { Suspense, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import SkeletonCard from "./loading";
import { Separator } from "@/components/ui/separator";

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
      setRaceData((prevData) => {
        const existingIndex = prevData.findIndex(
          (data) => data.car_id === newData.car_id
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
    <div className="flex flex-col items-center justify-center gap-10">
      <h1 className="font-bold text-3xl">
        Live Daten der Carrera Bahn
      </h1>
    <Separator className="w-2/3"/>
    <div className="w-2/3 shadow-lg">
      <Table >
        <TableHeader>
          <TableRow >
            <TableHead className="w-[100px]">Car</TableHead>
            <TableHead className="w-[100px]">Position</TableHead>
            <TableHead className="w-[100px]">Runden Zeit</TableHead>
            <TableHead className="w-[100px]">Schnellste Runde</TableHead>
            <TableHead className="w-[100px]">Letzte Runde</TableHead>
            <TableHead className="w-[100px]">Runden</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {raceData.map((car) => (
            <TableRow key={car.car_id}>
              <TableCell className="font-medium">{car.car_id}</TableCell>
              <TableCell>{car.position}</TableCell>
              <TableCell>{car.timestamp}</TableCell>
              <TableCell>{car.speed}</TableCell>
              <TableCell>{car.speed}</TableCell>
              <TableCell>{car.speed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
  );
};

export default CarreraData;
