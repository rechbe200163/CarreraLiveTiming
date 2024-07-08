import InteractingComponent from "@/components/dashboard/ImteractingComponent";
import TableComponent from "@/components/dashboard/tableComponent";
import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";

const CarreraData: React.FC = () => {
  return (
    <div className="flex flex-col items-center font-extrabold text-3xl gap-10">
      <div className="flex flex-row-reverse p-5">
        <h1>Live Daten</h1>
      </div>
      <div className="flex flex-row ">
        <InteractingComponent action="start" />
        <InteractingComponent action="stop" />
      </div>
      <TableComponent />
    </div>
  );
};

export default CarreraData;
