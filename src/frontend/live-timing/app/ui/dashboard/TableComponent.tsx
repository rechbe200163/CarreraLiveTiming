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
import React, { useState, useEffect, Suspense } from "react";
import { connectToSocket, getFastestLapCars } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { PodiumData, RaceData } from "@/lib/types";
import clsx from "clsx";
import { ToastAction } from "@radix-ui/react-toast";
import { useRouter } from "next/navigation";
import FuelStatusBar from "./FuelBar";
import DirverDisplayingComponent from "../helper/DirverDisplayingComponent";

interface TableComponentProps {
  type: string;
}

export default function TableComponent({ type }: TableComponentProps) {
  const [raceData, setRaceData] = useState<RaceData[]>([]);
  const [raceId, setRaceId] = useState<number>(0);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const socket = connectToSocket("http://localhost:8765");

    socket.on("connect", () => {
      console.log("WebSocket connection established.");
      socket.emit("update");
    });

    socket.on("update", (newData: RaceData[]) => {
      console.log("Received update:", newData);
      const processedData = getFastestLapCars(newData);
      setRaceData(processedData);

      // Check for new fastest lap
      const newFastestLap = Math.min(
        ...processedData.map((data: RaceData) => data.bestlap || Infinity) // Handle null values
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

    socket.on("session_over", async (podiumData: PodiumData[]) => {
      if (type === "rennen" || type === "qualifying") {
        try {
          console.log("Podium data:", podiumData);
          const response = await fetch("/api/createRacePodium", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ podiumData }),
          });
          const data = await response.json();
          console.log("Podium created:", data.raceId);
          setRaceId(data.raceId);
        } catch (error) {
          console.error("Error creating podium:", error);
        }
        toast({
          title: "Rennen beendet",
          description: "rennen beendet",
          variant: "default",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => router.push(`/live-timing/podium/${raceId}`)}
            >
              Podium ansehen {raceId}
            </ToastAction>
          ),
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed.");
    });

    return () => {
      socket.disconnect();
    };
  }, [toast, type, raceData]); // Include raceData in dependencies to track changes

  return (
    <div className="w-full font-semibold antialiased ">
      <Table className="text-center">
        <TableCaption>Live Daten aus dem Rennen</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center text-black text-xl font-medium">
              P
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium">
              Auto
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium">
              Letzte Runde
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium">
              Beste Runde
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium">
              Runden
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium">
              Tankinhalt
            </TableHead>
            <TableHead className="text-center text-black text-xl font-medium">
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
