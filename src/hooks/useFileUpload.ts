import { useState, useRef, ChangeEvent } from "react";
import { validatePDFFile } from "@/lib/utils/file-validators";

export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) return;

    const validation = validatePDFFile(selectedFile);
    
    if (!validation.isValid) {
      setError(validation.error!);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    file,
    error,
    fileInputRef,
    handleFileChange,
    clearFile,
    triggerFileInput,
    setError
  };
}
