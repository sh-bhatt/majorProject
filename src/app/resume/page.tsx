//@ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { House } from "lucide-react";
import Link from "next/link";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { FilePreview } from "@/components/upload/FilePreview";
import { UploadActions } from "@/components/upload/UploadActions";
import { UploadStatus } from "@/components/upload/UploadStatus";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useResumeProcessor } from "@/hooks/useResumeProcessor";

export default function ResumeUploadPage() {
  const {
    file,
    error: fileError,
    fileInputRef,
    handleFileChange,
    clearFile,
    triggerFileInput
  } = useFileUpload();

  const {
    loading,
    error: processingError,
    processResume
  } = useResumeProcessor();

  const error = fileError || processingError;

  const handleReupload = () => {
    clearFile();
    triggerFileInput();
  };

  const handleViewResume = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    }
  };

  const handleNext = () => {
    processResume(file);
  };

  return (
    <div
      className="min-h-screen bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url(/images/upload.png)" }}
    >
      <header className="p-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="hover:bg-white/20">
            <House size={32} />
          </Button>
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-16 text-center">
        <h1 className="text-6xl md:text-9xl font-bold mb-6">
          Upload Your Resume
        </h1>

        <p className="text-xl md:text-2xl mb-8 text-gray-700">
          Upload your resume and let AI extract skills, experience, and projects.
        </p>

        <UploadStatus error={error} loading={loading} />

        {file && !error && <FilePreview file={file} />}

        {!file && (
          <FileUploadZone 
            fileInputRef={fileInputRef} 
            onFileChange={handleFileChange} 
          />
        )}

        {file && (
          <UploadActions
            file={file}
            loading={loading}
            onView={handleViewResume}
            onNext={handleNext}
            onReupload={handleReupload}
          />
        )}
      </div>
    </div>
  );
}
