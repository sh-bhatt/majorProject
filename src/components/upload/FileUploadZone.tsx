import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { RefObject } from "react";

interface FileUploadZoneProps {
  fileInputRef: RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadZone({ fileInputRef, onFileChange }: FileUploadZoneProps) {
  return (
    <div className="mt-8">
      <label htmlFor="file">
        <Button 
          asChild 
          className="text-xl px-8 py-6 cursor-pointer hover:scale-105 transition-transform"
          size="lg"
        >
          <span>
            Upload PDF <Upload className="inline ml-2" size={24} />
          </span>
        </Button>
      </label>
      <input
        ref={fileInputRef}
        type="file"
        id="file"
        accept="application/pdf"
        className="hidden"
        onChange={onFileChange}
      />
      <p className="text-sm text-gray-600 mt-4">
        Supports PDF files up to 10MB
      </p>
    </div>
  );
}
