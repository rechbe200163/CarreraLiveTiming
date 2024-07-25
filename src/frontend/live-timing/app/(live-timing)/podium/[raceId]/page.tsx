import React from "react";

import { prisma } from "@/lib/prisma";
import { RaceDataStore } from "@/lib/types";

export default async function Podium({
  params,
}: {
  params: { raceId: string };
}) {
  const data: RaceDataStore[] = await prisma.raceData.findMany({
    where: {
      raceId: params.raceId,
    },
  });

  return (
    <>
      {data.map((data) => (
        <div key={data.num}>
          <p>{data.num}</p>
          <p>{data.laptime}</p>
          <p>{data.sector1}</p>
          <p>{data.sector2}</p>
        </div>
      ))}
    </>
  );
}
