import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const CompetitionCardSkeleton = () => {
  return (
    <>
      <Card className="w-full h-full">
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-1/2 h-4" />
        <Skeleton className="w-1/4 h-4" />
      </Card>
    </>
  );
};

export default CompetitionCardSkeleton;
