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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
        ...processedData.map((data: RaceData) => data.bestlap)
      );
      const currentFastestLap = Math.min(
        ...raceData.map((data) => data.bestlap)
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
    <div className="w-full lg:w-2/3 font-normal antialiased">
      <Table>
        <TableCaption>Live Daten aus dem Rennen</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3">Position</TableHead>
            <TableHead className="w-3">Car</TableHead>
            <TableHead className="w-[100px]">Last Lap</TableHead>
            <TableHead className="w-[100px]">Best Lap</TableHead>
            <TableHead className="w-[100px]">Laps</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <Suspense fallback={<RacingDataSkeleton />}>
            {raceData.map((car: RaceData, index: number) => (
              <TableRow
                key={car.num}
                className={clsx("transition-colors duration-200", {
                  "bg-green-400 text-gray-500": car.has_fastest_lap === true,
                })}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{car.num}</TableCell>
                <TableCell>{formatTime(car.laptime, "laptime")}</TableCell>
                <TableCell>{formatTime(car.bestlap, "laptime")}</TableCell>
                <TableCell>{car.laps}</TableCell>
              </TableRow>
            ))}
          </Suspense>
        </TableBody>
      </Table>
    </div>
  );
}
