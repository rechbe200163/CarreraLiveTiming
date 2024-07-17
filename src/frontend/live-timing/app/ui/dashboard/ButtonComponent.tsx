"use client";

import { Button } from "@/components/ui/button";
import React from "react";

type ButtonProps = {
  method: () => void;
  className?: string;
  label: string;
};

export default function ButtonComponent({
  method,
  className,
  label,
}: ButtonProps) {
  return (
    <Button
      onClick={method}
      variant={"destructive"}
    >
      {label}
    </Button>
  );
}
