"use client";
import React from "react";
import { connectToSocket } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const InteractingComponent = ({ action }: { action: string }) => {
  const socket = connectToSocket("http://localhost:8765");

  const startRace = (action: string) => {
    if (action === "start") {
      socket.emit("start");
    }
    if (action === "stop") {
      socket.emit("stop");
    }
  };

  socket.on("start_success", (mes: string) => {
    console.log(mes);
  });

  socket.on("stop_success", (mes: string) => {
    console.log(mes);
  });

  return (
    <div>
      <Button onClick={() => startRace(action)}>{action}</Button>
    </div>
  );
};

export default InteractingComponent;
