"use server";

import { prisma } from "@/lib/prisma";
import { RaceData, RaceDataStore } from "./types";

export async function postRaceData(raceData: RaceDataStore[], raceId: string) {
  await prisma.raceData.createMany({
    data: raceData.map((data) => ({
      num: data.num,
      laptime: data.laptime,
      sector1: data.sector1,
      sector2: data.sector2,
      raceId: raceId,
    })),
  });
}

export async function createRace(title: string) {
  const raceId = await prisma.competition.create({
    data: {
      title: title,
    },
  });
  return raceId;
}

export async function getRaces() {
  await prisma.competition.findMany({});
}
