"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import React, { useState, useEffect } from "react";
import { connectToSocket, getFastestLapCars } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { RaceData, RaceDataStore } from "@/lib/types";
import DirverDisplayingComponent from "../helper/DirverDisplayingComponent";
import { postRaceData } from "@/lib/actions";
import { ToastAction } from "@radix-ui/react-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TableComponentProps {
  raceId: string;
  type: string;
}

export default function TableComponent({ raceId, type }: TableComponentProps) {
  const [raceData, setRaceData] = useState<RaceData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const socket = connectToSocket("http://localhost:8765");

    socket.on("connect", () => {
      console.log("WebSocket connection established.");
      socket.emit("update");
    });

    socket.on("session_over", () => {
      toast({
        title: "Rennen beendet",
        description: "Das Rennen wurde beendet.",
        variant: "success",
        action: (
          <ToastAction altText="Goto schedule to undo">
            <Link href={`/podium/${raceId}`}>Podium Anzeigen</Link>
          </ToastAction>
        ),
      });
    });

    socket.on("update", (newData: RaceData[]) => {
      console.log("Received update:", newData);
      const processedData = getFastestLapCars(newData);
      setRaceData(processedData);

      const storedData: RaceDataStore[] = newData.map((data) => {
        return {
          num: data.num,
          laptime: data.laptime,
          sector1: data.sector1,
          sector2: data.sector2,
        };
      });

      console.log("Stored data:", storedData);

      // Post updated race data to the server
      if (type === "rennen") {
        postRaceData(storedData, raceId);
      }

      // Check for new fastest lap
      const newFastestLap = Math.min(
        ...processedData.map((data) => data.bestlap || Infinity) // Handle null values
      );
      const currentFastestLap = Math.min(
        ...raceData.map((data) => data.bestlap || Infinity) // Handle null values
      );

      if (newFastestLap < currentFastestLap) {
        toast({
          title: "Neue schnellste Runde!",
          description: `Neue Bestzeit gesetzt! Rundenzeit: ${formatTime(
            newFastestLap,
            "laptime"
          )}`,
          variant: "success",
        });
      }
    });

    socket.on("start_success", (mes: string) => {
      toast({
        title: "Rennen gestartet",
        description: mes,
        variant: "success",
      });
    });

    socket.on("stop_success", (mes: string) => {
      toast({
        title: "Rennen gestoppt",
        description: mes,
        variant: "success",
      });
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed.");
    });

    return () => {
      socket.disconnect();
    };
  }, [toast, type, raceData]); // Include raceData in dependencies to track changes

  return (
    <div className="w-full font-semibold antialiased pt-5">
      <Table className="text-center">
        <TableCaption>Live Daten aus dem Rennen</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center text-black text-xl font-medium">
              P
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-1">
              Auto
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-5">
              Letzte Runde
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-5">
              Beste Runde
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-5">
              S1
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-5">
              S2
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-4">
              Runden
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-10">
              Tankinhalt
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium w-5">
              Pits
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {raceData.map((car: RaceData) => (
            <DirverDisplayingComponent
              key={car.num}
              data={car}
              index={raceData.indexOf(car)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
