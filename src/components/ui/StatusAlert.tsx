import { AlertCircle, CheckCircle } from "lucide-react";

interface StatusAlertProps {
  type: "error" | "success";
  message: string;
  subMessage?: string;
}

export function StatusAlert({ type, message, subMessage }: StatusAlertProps) {
  const isError = type === "error";
  
  const styles = isError
    ? "bg-red-50 border-red-300 text-red-800"
    : "bg-green-50 border-green-300 text-green-800";
  
  const Icon = isError ? AlertCircle : CheckCircle;
  const iconColor = isError ? "text-red-600" : "text-green-600";

  return (
    <div className={`max-w-md mx-auto mb-6 p-4 border-2 rounded-lg flex items-start gap-3 ${styles}`}>
      <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1 text-left">
        <p className="font-semibold text-sm">{message}</p>
        {subMessage && <p className="text-xs mt-1">{subMessage}</p>}
      </div>
    </div>
  );
}
