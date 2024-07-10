"use server";
import { RaceData } from "./types";
import { prisma } from "./prisma"; // Import the prisma object from the appropriate module

export async function postRaceData(data: RaceData[]) {
  try {
    await prisma.raceDataDB.createMany({
      data: data,
    });
  } catch (error) {
    console.error("Error", error);
  }
}
