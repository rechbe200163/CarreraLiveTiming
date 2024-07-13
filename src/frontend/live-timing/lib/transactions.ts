import { prisma } from "./prisma";
import { PodiumData } from "./types";

export async function getPodiumData(id: string): Promise<PodiumData[]> {
  const podiumData = await prisma.podium.findMany({
    where: {
      raceId: id,
    },
  });

  return podiumData;
}
