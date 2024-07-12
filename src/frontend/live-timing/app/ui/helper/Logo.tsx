import { raleway } from "../fonts";
import { ClockIcon } from "@radix-ui/react-icons";

export default function Logo() {
  return (
    <div
      className={`${raleway.className} flex flex-row items-center leading-none text-white`}
    >
      <ClockIcon className="h-12 w-12 rotate-[-15deg]" />
      <p className="text-[35px]">LiveLap</p>
    </div>
  );
}
