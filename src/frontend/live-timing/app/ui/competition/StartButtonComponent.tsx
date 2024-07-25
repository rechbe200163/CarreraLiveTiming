import Link from "next/link";
import React from "react";

interface StartButtonComponentProps {
  id: string;
}

export default function StartButtonComponent({
  id,
}: StartButtonComponentProps) {
  return (
    <div>
      <Link
        href={`/timing/${id}/rennen`}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Start Live Timing
      </Link>
    </div>
  );
}
