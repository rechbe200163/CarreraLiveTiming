import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function RacingDataSkeleton() {
  return (
    <TableBody>
      <TableRow>
        <TableCell>
          <Skeleton className="h-6 w-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-full" />
        </TableCell>
      </TableRow>
    </TableBody>
  );
}
