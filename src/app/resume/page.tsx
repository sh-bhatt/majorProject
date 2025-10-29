"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { House, Upload, RefreshCw, FileText, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a valid PDF file");
      setFile(null);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleReupload = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleNext = async () => {
    if (!file) {
      setError("Please upload your resume first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📤 Uploading file:", file.name, "Size:", file.size);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-tech", {
        method: "POST",
        body: formData,
      });

      console.log("📥 Response status:", res.status);

      // Get response text first for better error handling
      const responseText = await res.text();
      console.log("📄 Response:", responseText);

      if (!res.ok) {
        let errorMessage = "Failed to process resume";
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Parse the successful response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      console.log("✅ Parsed data:", data);

      // Check for error in response
      if (data.error) {
        throw new Error(data.error);
      }

      // Validate response structure
      if (!data.success || !data.data) {
        throw new Error("Invalid response structure from server");
      }

      // ✅ Save all data to sessionStorage
      // 1. Tech skills data
      sessionStorage.setItem("techData", JSON.stringify(data.data));
      console.log("✅ Saved techData:", data.data);
      
      // 2. Stats data
      if (data.stats) {
        sessionStorage.setItem("techStats", JSON.stringify(data.stats));
        console.log("✅ Saved techStats:", data.stats);
      }

      // 3. ATS data
      if (data.ats) {
        sessionStorage.setItem("atsData", JSON.stringify(data.ats));
        console.log("✅ Saved atsData:", data.ats);
        console.log("   → ATS Score:", data.ats.score);
        console.log("   → Feedback:", data.ats.feedback);
      } else {
        console.warn("⚠️ No ATS data in response");
      }

      // 4. Experience data (NEW)
      if (data.experience) {
        sessionStorage.setItem("experienceData", JSON.stringify(data.experience));
        console.log("✅ Saved experienceData:", data.experience);
        console.log("   → Found:", data.experience.found);
        console.log("   → Count:", data.experience.count);
        console.log("   → Entries:", data.experience.entries?.length || 0);
      } else {
        console.warn("⚠️ No experience data in response");
      }

      // 5. Projects data (NEW)
      if (data.projects) {
        sessionStorage.setItem("projectsData", JSON.stringify(data.projects));
        console.log("✅ Saved projectsData:", data.projects);
        console.log("   → Found:", data.projects.found);
        console.log("   → Count:", data.projects.count);
        console.log("   → Entries:", data.projects.entries?.length || 0);
      } else {
        console.warn("⚠️ No projects data in response");
      }

      // Verify all data was saved
      const verifyATS = sessionStorage.getItem("atsData");
      const verifyExperience = sessionStorage.getItem("experienceData");
      const verifyProjects = sessionStorage.getItem("projectsData");
      
      console.log("🔍 Verification:");
      console.log("   - atsData:", verifyATS ? "✓" : "✗");
      console.log("   - experienceData:", verifyExperience ? "✓" : "✗");
      console.log("   - projectsData:", verifyProjects ? "✓" : "✗");

      console.log("✅ All data saved to sessionStorage, redirecting...");

      // Redirect to tech stack page
      router.push("/extract-tech");

    } catch (err: any) {
      console.error("❌ Upload error:", err);
      setError(err.message || "Failed to extract tech stack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url(/images/upload.png)" }}
    >
      <header className="p-6">
        <Link href={"/"}>
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

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-800 text-left text-sm">{error}</p>
          </div>
        )}

        {/* File Selected Display */}
        {file && !error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div className="flex-1 text-left">
              <p className="text-green-800 font-semibold text-sm">{file.name}</p>
              <p className="text-green-600 text-xs">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <FileText className="text-green-600" size={24} />
          </div>
        )}

        {/* Upload Button (when no file) */}
        {!file && (
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
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-600 mt-4">
              Supports PDF files up to 10MB
            </p>
          </div>
        )}

        {/* Action Buttons (when file is selected) */}
        {file && (
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button
              onClick={() => {
                const url = URL.createObjectURL(file);
                window.open(url, "_blank");
              }}
              className="text-lg px-6 py-6 hover:scale-105 transition-transform"
              variant="outline"
              size="lg"
            >
              <FileText className="inline mr-2" size={20} />
              View Resume
            </Button>

            <Button
              onClick={handleNext}
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
              onClick={handleReupload}
              disabled={loading}
              className="text-lg px-6 py-6 hover:scale-105 transition-transform"
              variant="secondary"
              size="lg"
            >
              <RefreshCw className="inline mr-2" size={20} />
              Reupload
            </Button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={24} />
              <div className="text-left">
                <p className="text-blue-800 font-semibold">Processing your resume...</p>
                <p className="text-blue-600 text-sm">Extracting skills, experience & projects</p>
              </div>
            </div>
          </div>
        )}

        
        
      </div>
    </div>
  );
}

// Add missing imports at the top

