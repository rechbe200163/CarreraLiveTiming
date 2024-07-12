import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AlertComponent({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Alert variant="info">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message} </AlertDescription>
    </Alert>
  );
}
