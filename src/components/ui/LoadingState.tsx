import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <p className="text-xl text-gray-600">Analyzing your resume...</p>
    </div>
  );
}
