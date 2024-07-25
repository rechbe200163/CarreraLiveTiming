import React, { Suspense } from "react";
import { FormComponentCompetition } from "../../ui/helper/FormComponentCompetition";
import LoadCompetitionsComponents from "../../ui/competition/CompetitionComponent";
import CompetitionCardSkeleton from "../../ui/competition/CompetitionCardSkeleton";

const Competition = () => {
  return (
    <div className="flex flex-col items-start justify-between space-y-14">
      <FormComponentCompetition />
      <Suspense fallback={<CompetitionCardSkeleton />}>
        <LoadCompetitionsComponents />
      </Suspense>
    </div>
  );
};

export default Competition;
