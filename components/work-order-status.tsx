import { Badge } from "@/components/ui/badge";

interface WorkOrderStatusProps {
  isDelivered: boolean;
}

export function WorkOrderStatus({ isDelivered }: WorkOrderStatusProps) {
  return (
    <Badge
      variant={isDelivered ? "default" : "destructive"}
      className={`px-3 py-1 rounded-full ${
        isDelivered ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isDelivered ? "Received" : "Pending"}
    </Badge>
  );
}
