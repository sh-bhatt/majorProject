import { CheckCircle, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/utils/file-validators";

interface FilePreviewProps {
  file: File;
}

export function FilePreview({ file }: FilePreviewProps) {
  return (
    <div className="max-w-md mx-auto mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-3">
      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
      <div className="flex-1 text-left">
        <p className="text-green-800 font-semibold text-sm">{file.name}</p>
        <p className="text-green-600 text-xs">{formatFileSize(file.size)}</p>
      </div>
      <FileText className="text-green-600" size={24} />
    </div>
  );
}
