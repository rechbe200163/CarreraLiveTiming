import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCreatedAt } from "@/lib/utils";
import React from "react";
import StartButtonComponent from "./StartButtonComponent";

export const dynamic = "force-dynamic";
export default async function LoadCompetitionsComponents() {
  const races = await prisma.competition.findMany({});

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {races.map((race) => (
        <div key={race.id}>
          <Card>
            <CardHeader>
              <CardTitle>{race.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Lights Out At: {formatCreatedAt(race.createdAt.toISOString())}
              </p>
            </CardContent>
            <CardFooter>
              <StartButtonComponent id={race.id} />
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
}
