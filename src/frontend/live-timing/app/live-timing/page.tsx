import InteractingComponent from "@/components/dashboard/ImteractingComponent";
import TableComponent from "@/components/dashboard/tableComponent";
import Breadcrumbs from "@/components/helper/BreadCrumps";
import prisma from "../../lib/prisma";

const CarreraData = () => {
  return (
    <div className="flex flex-col items-center font-extrabold text-3xl gap-10">
      <Breadcrumbs
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Live Daten", href: "/live-timing" },
        ]}
      />
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
