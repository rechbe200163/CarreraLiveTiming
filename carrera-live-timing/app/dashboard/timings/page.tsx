"use client";

import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

interface RaceData {
  timestamp: number;
  car_id: number;
  speed: number;
  position: number;
}

const CarreraData: React.FC = () => {
  const [raceData, setRaceData] = useState<RaceData[]>([]);

  const { lastMessage } = useWebSocket("ws://localhost:8765", {
    onOpen: () => console.log("Connected to WebSocket"),
    onMessage: (event) => {
      const newData: RaceData = JSON.parse(event.data);
      setRaceData((prevData) => {
        // Check if data for this car already exists in state
        const existingIndex = prevData.findIndex(
          (data) => data.car_id === newData.car_id
        );

        if (existingIndex !== -1) {
          // Update existing data for this car
          const updatedData = [...prevData];
          updatedData[existingIndex] = newData;
          // Sort by position
          updatedData.sort((a, b) => a.position - b.position);
          return updatedData;
        } else {
          // Add new data if not already present
          const updatedData = [...prevData, newData];
          // Sort by position
          updatedData.sort((a, b) => a.position - b.position);
          return updatedData;
        }
      });
    },
    onError: (error) => console.error("WebSocket error:", error),
  });

  useEffect(() => {
    // Clear raceData if there are no active WebSocket connections
    if (!lastMessage) {
      setRaceData([]);
    }
  }, [lastMessage]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Live Race Data</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {raceData.map((data, index) => (
            <li key={index} className="p-4">
              <p className="text-lg font-semibold text-gray-800">
                {`Car ${data.car_id}`}
              </p>
              <p className="text-gray-600">{`Position: ${data.position} | Schnelste Runde | Letzte Runde | Runden | `}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

CarreraData;
