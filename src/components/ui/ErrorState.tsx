import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 text-center">
      <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
      <p className="text-xl font-semibold text-gray-800 mb-2">{message}</p>
      <Link href="/resume">
        <Button size="lg" className="mt-2 flex items-center gap-2">
          <Home size={20} /> Go Back to Upload
        </Button>
      </Link>
    </div>
  );
}
