import { RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

export function LoadingSpinner({ 
  message = "Processing...", 
  subMessage 
}: LoadingSpinnerProps) {
  return (
    <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg max-w-md mx-auto">
      <div className="flex items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-blue-600" size={24} />
        <div className="text-left">
          <p className="text-blue-800 font-semibold">{message}</p>
          {subMessage && <p className="text-blue-600 text-sm">{subMessage}</p>}
        </div>
      </div>
    </div>
  );
}
