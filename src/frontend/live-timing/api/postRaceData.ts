import { prisma } from "@/lib/prisma";
import { RaceData } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface RaceDataStore {
  carNum: number;
  laptime: number;
  sector1: number;
  sector2: number;
}

export default async function postData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const raceData: RaceData[] = req.body;

      await Promise.all(
        raceData.map(async (data) => {
          await prisma.raceDB.create({
            data: {
              carNum: data.num,
              laptime: data.laptime,
              sector1: data.sector1,
              sector2: data.sector2,
            } as Prisma.RaceDBCreateInput,
          });
        })
      );
      res.status(200).json({ message: "Race data posted successfully" });
    } catch (error) {
      console.error("Error posting race data:", error);
      res.status(500).json({ error: "Failed to post race data" });
    }
  } else {
    // Handle any other HTTP method
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
