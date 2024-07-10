import InteractingComponent from "@/app/ui/dashboard/ImteractingComponent";
import TableComponent from "@/app/ui/dashboard/TableComponent";
import Breadcrumbs from "@/app/ui/helper/BreadCrumps";

export default async function LiveTimingData({
  params,
}: {
  params: { type: string };
}) {
  return (
    <div className="flex flex-col items-center font-extrabold text-3xl gap-10">
      <Breadcrumbs
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Live Daten", href: "/live-timing" },
        ]}
      />
      <div className="flex flex-row-reverse p-5">
        <h1>Live Daten | {params.type.toLocaleUpperCase()}</h1>
      </div>
      <div className="flex flex-row ">
        <InteractingComponent action="start" />
        <InteractingComponent action="stop" />
      </div>
      <TableComponent type={params.type} />
    </div>
  );
}
