import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";

interface UploadActionsProps {
  file: File;
  loading: boolean;
  onView: () => void;
  onNext: () => void;
  onReupload: () => void;
}

export function UploadActions({ 
  file, 
  loading, 
  onView, 
  onNext, 
  onReupload 
}: UploadActionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      <Button
        onClick={onView}
        className="text-lg px-6 py-6 hover:scale-105 transition-transform"
        variant="outline"
        size="lg"
      >
        <FileText className="inline mr-2" size={20} />
        View Resume
      </Button>

      <Button
        onClick={onNext}
        disabled={loading}
        className="text-lg px-8 py-6 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {loading ? (
          <>
            <RefreshCw className="inline mr-2 animate-spin" size={20} />
            Extracting...
          </>
        ) : (
          "Next →"
        )}
      </Button>

      <Button
        onClick={onReupload}
        disabled={loading}
        className="text-lg px-6 py-6 hover:scale-105 transition-transform"
        variant="secondary"
        size="lg"
      >
        <RefreshCw className="inline mr-2" size={20} />
        Reupload
      </Button>
    </div>
  );
}
