"use client";

import { useState, useEffect } from "react";
import { ResumeData } from "@/lib/types/resume.types";

export function useResumeData() {
  const [data, setData] = useState<ResumeData>({
    techData: null,
    experience: null,
    projects: null,
    stats: null,
    ats: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem("techData");
      const storedStats = sessionStorage.getItem("techStats");
      const storedATS = sessionStorage.getItem("atsData");
      const storedExperience = sessionStorage.getItem("experienceData");
      const storedProjects = sessionStorage.getItem("projectsData");

      if (storedData) {
        setData({
          techData: JSON.parse(storedData),
          stats: storedStats ? JSON.parse(storedStats) : {},
          ats: storedATS ? JSON.parse(storedATS) : null,
          experience: storedExperience ? JSON.parse(storedExperience) : null,
          projects: storedProjects ? JSON.parse(storedProjects) : null,
        });
      } else {
        setError("No tech stack data found. Please upload your resume first.");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please re-upload your resume.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error };
}
