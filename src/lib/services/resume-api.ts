export interface ResumeAPIResponse {
  success: boolean;
  data: any;
  stats?: any;
  ats?: any;
  experience?: any;
  projects?: any;
  error?: string;
}

export async function uploadResumeForProcessing(file: File): Promise<ResumeAPIResponse> {
  console.log("📤 Uploading file:", file.name, "Size:", file.size);

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/extract-tech", {
    method: "POST",
    body: formData,
  });

  console.log("📥 Response status:", res.status);

  const responseText = await res.text();
  console.log("📄 Response:", responseText.substring(0, 200));

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

  let data: ResumeAPIResponse;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Failed to parse response:", parseError);
    throw new Error("Invalid response from server");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.success || !data.data) {
    throw new Error("Invalid response structure from server");
  }

  return data;
}

export function saveResumeDataToSession(data: ResumeAPIResponse): void {
  // Save main tech data
  sessionStorage.setItem("techData", JSON.stringify(data.data));
  console.log("✅ Saved techData");
  
  // Save stats
  if (data.stats) {
    sessionStorage.setItem("techStats", JSON.stringify(data.stats));
    console.log("✅ Saved techStats");
  }

  // Save ATS data
  if (data.ats) {
    sessionStorage.setItem("atsData", JSON.stringify(data.ats));
    console.log("✅ Saved atsData - Score:", data.ats.score);
  } else {
    console.warn("⚠️ No ATS data in response");
  }

  // Save experience data
  if (data.experience) {
    sessionStorage.setItem("experienceData", JSON.stringify(data.experience));
    console.log("✅ Saved experienceData - Count:", data.experience.count);
  } else {
    console.warn("⚠️ No experience data in response");
  }

  // Save projects data
  if (data.projects) {
    sessionStorage.setItem("projectsData", JSON.stringify(data.projects));
    console.log("✅ Saved projectsData - Count:", data.projects.count);
  } else {
    console.warn("⚠️ No projects data in response");
  }

  // Verify saved data
  console.log("Verification:", {
    techData: !!sessionStorage.getItem("techData"),
    atsData: !!sessionStorage.getItem("atsData"),
    experienceData: !!sessionStorage.getItem("experienceData"),
    projectsData: !!sessionStorage.getItem("projectsData")
  });
}
