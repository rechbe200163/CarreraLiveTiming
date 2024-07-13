import React from "react";
import { getPodiumData } from "@/lib/transactions";
import { PodiumData, RaceData } from "@/lib/types";

export default async function Podium({ params }: { params: { id: string } }) {
  // fetch raceData with this id from the backend
  const podiumData: PodiumData[] = await getPodiumData(params.id);
  return (
    <div>
      {podiumData.map((data) => (
        <div key={data.id}>
          <h1>Best Lap: {data.bestlap}</h1>
          <p>Fastest Lap: {data.has_fastest_lap}</p>
          <span>Num: {data.num}</span>
        </div>
      ))}
    </div>
  );
}
