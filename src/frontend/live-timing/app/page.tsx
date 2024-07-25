import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 space-y-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-center">
        Welcome to Carrera Live Timing
      </h1>
      <span className="text-lg text-center text-gray-600">
        Start Live Timing
      </span>
      <div className="flex flex-col w-1/2 md:flex-row md:w-fit justify-center gap-4">
        <Link href="/races">
          <Button
            size="lg"
            color="primary"
            className="w-full gap-1 transition-all hover:gap-10 duration-"
          >
            Launch Live Timing
            <ArrowRightIcon className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
