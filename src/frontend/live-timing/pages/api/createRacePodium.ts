import { RaceData, PodiumData } from "@/lib/types";
import { prisma } from "./../../lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message: string;
  raceId?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const { podiumData } = req.body;

    try {
      const racePodium = await prisma.raceDB.create({
        data: {
          podium: {
            create: podiumData.map((data: PodiumData) => ({
              num: data.num,
              bestLap: data.bestlap,
              time: data.time,
              laps: data.laps,
              hasFastestLap: data.has_fastest_lap,
            })),
          },
        },
      });

      res.status(200).json({
        message: "Podium erfolgreich erstellt",
        raceId: racePodium.id,
      });
    } catch (error) {
      res.status(500).json({
        message: "Fehler beim Erstellen des Podiums: " + error,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
