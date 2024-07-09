import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 space-y-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-center">
        Welcome to Carrera Live Timing
      </h1>
      <span className="text-lg text-center text-gray-600">
        Choose your mode
      </span>
      <div className="flex flex-wrap justify-center gap-4">
        <Button>
          <Link href="live-timing/" passHref>
            Race
          </Link>
        </Button>
        <Button>Qualifying</Button>
        <Button>Practice</Button>
      </div>
    </div>
  );
};

export default Home;
