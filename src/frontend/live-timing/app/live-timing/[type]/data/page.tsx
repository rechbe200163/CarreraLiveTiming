import InteractingComponent from "@/app/ui/dashboard/InteractingComponent";
import TableComponent from "@/app/ui/dashboard/TableComponent";
import AlertComponent from "@/app/ui/helper/AlertComponent";
import Breadcrumbs from "@/app/ui/helper/BreadCrumps";

export default async function LiveTimingData({
  params,
}: {
  params: { type: string };
}) {
  return (
    <>
      <div className="py-5">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Live Daten", href: "/live-timing/" },
            { label: params.type.toLocaleUpperCase(), href: "#" },
          ]}
        />
      </div>
      {params.type === "training" ? (
        <div className="pb-10">
          <AlertComponent
            title="Achtung!"
            message="Daten während des Trainings werden nicht gespeichert."
          />
        </div>
      ) : null}

      <div className="flex flex-row">
        <TableComponent type={params.type} />
        <div className="flex flex-row pl-10 space-x-10">
          <InteractingComponent action="start" />
          <InteractingComponent action="stop" />
        </div>
      </div>
    </>
  );
}
