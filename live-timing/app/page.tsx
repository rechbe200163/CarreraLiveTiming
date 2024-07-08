import TableComponent from "@/components/dashboard/tableComponent";

const CarreraData: React.FC = () => {
  return (
    <div className="flex flex-col items-center font-extrabold text-3xl gap-10">
      <div className="flex flex-row-reverse p-5">
        <h1>Live Daten</h1>
      </div>
      <TableComponent />
    </div>
  );
};

export default CarreraData;
