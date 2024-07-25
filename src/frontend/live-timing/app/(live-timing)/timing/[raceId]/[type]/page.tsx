"use client";

import ButtonComponent from "@/app/ui/dashboard/ButtonComponent";
import InteractingComponent from "@/app/ui/dashboard/InteractingComponent";
import TableComponent from "@/app/ui/dashboard/TableComponent";
import AlertComponent from "@/app/ui/helper/AlertComponent";
import Breadcrumbs from "@/app/ui/helper/BreadCrumps";
import { Button } from "@/components/ui/button";
import { connectToSocket } from "@/lib/utils";

export default async function LiveTimingData({
  params,
}: {
  params: { raceId: string; type: string };
}) {
  const socket = connectToSocket("http://localhost:8765");

  function onClick() {
    // Stop
    socket.emit("stop");
  }

  return (
    <>
      {params.raceId}
      {params.type}
      <div className="py-5 flex flex-row justify-between">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Wettkampf", href: "/races/" },
            { label: params.type.toUpperCase(), href: "#" },
          ]}
        />
        <ButtonComponent label="Stop Race" method={onClick} />
      </div>
      {params.type === "training" ? (
        <div className="pb-10">
          <AlertComponent
            title="Achtung!"
            message="Daten während des Trainings werden nicht gespeichert."
          />
        </div>
      ) : null}

      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-between">
          <InteractingComponent action="start" />
        </div>
        <TableComponent type={params.type} raceId={params.raceId} />
      </div>
    </>
  );
}
