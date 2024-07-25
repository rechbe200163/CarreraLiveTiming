import { type ClassValue, clsx } from "clsx";
import { format } from "path";
import { twMerge } from "tailwind-merge";
import { RaceData } from "./types";
import { connect } from "http2";
import { url } from "inspector";
import { io } from "socket.io-client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format time function provided in milliseconds
export function formatTime(
  time: number,
  type: string = "racetime" || "laptime"
) {
  if (time === null) {
    return "-";
  }

  if (type === "laptime") {
    return formatLapTime(time);
  }
  if (type === "racetime") {
    return formatRaceTime(time);
  }
}

function formatRaceTime(time: number): string {
  const seconds = ((time % 60000) / 1000).toFixed(3);
  return `${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
}

function formatLapTime(time: number) {
  const minutes = Math.floor(time / 60000);
  const seconds = ((time % 60000) / 1000).toFixed(3);
  return `${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
}

export function getFastestLapCars(raceData: RaceData[]) {
  const fastestLapTime = Math.min(...raceData.map((data) => data.bestlap));
  return raceData.map((data) => ({
    ...data,
    has_fastest_lap: data.bestlap === fastestLapTime,
  }));
}

export function connectToSocket(url: string) {
  return io(url, {
    transports: ["websocket", "polling"],
  });
}

export function formatCreatedAt(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("de-at", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
