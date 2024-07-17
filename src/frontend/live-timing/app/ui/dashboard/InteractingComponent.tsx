import FormComponent from "./FormComponent";
import { connectToSocket } from "@/lib/utils";

export default function InteractingComponent({
  action,
}: {
  action: "start" | "stop";
}) {
  const socket = connectToSocket("http://localhost:8765");

  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
      <FormComponent />
    </div>
  );
}
