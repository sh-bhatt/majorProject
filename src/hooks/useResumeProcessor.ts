import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadResumeForProcessing, saveResumeDataToSession } from "@/lib/services/resume-api";

export function useResumeProcessor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const processResume = async (file: File | null) => {
    if (!file) {
      setError("Please upload your resume first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await uploadResumeForProcessing(file);
      saveResumeDataToSession(data);
      
      console.log("✅ All data saved to sessionStorage, redirecting...");
      router.push("/extract-tech");

    } catch (err: any) {
      console.error("❌ Upload error:", err);
      setError(err.message || "Failed to extract tech stack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    processResume,
    setError
  };
}
