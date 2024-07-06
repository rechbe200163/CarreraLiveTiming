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
      setRaceData((prevData) => {
        // Update or add new data based on car_id or any unique identifier
        return [
          ...prevData.filter((data) => data.car_id !== newData.car_id),
          newData,
        ];
      });
    }
  }, [lastMessage]);

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
