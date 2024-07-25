import Breadcrumbs from "@/app/ui/helper/BreadCrumps";
import React from "react";

const LiveDaten = () => {
  return (
    <>
      <div className="py-5 flex flex-row justify-between">
        <Breadcrumbs
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Live Daten", href: "/live-timing/" },
          ]}
        />
      </div>
      Hier werden die Live-Daten angezeigt welche von der DB kommen.
    </>
  );
};

export default LiveDaten;
