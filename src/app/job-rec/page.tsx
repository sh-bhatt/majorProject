"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Loader2, Briefcase, MapPin, DollarSign, Clock, ExternalLink, ArrowLeft, TrendingUp, Award, Target, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  skills: string[];
  matchScore: number;
  description: string;
  url?: string;
  source?: string;
  postedDate?: string;
}

export default function JobRecommendationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [interviewScore, setInterviewScore] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<boolean>(false);

  useEffect(() => {
    loadDataAndGenerateJobs();
  }, []);

  const loadDataAndGenerateJobs = async () => {
    try {
      const scoreStr = sessionStorage.getItem("interviewScore");
      const score = scoreStr ? parseFloat(scoreStr) : 0;
      
      if (score === 0) {
        setError("No interview data found. Please complete an interview first.");
        setIsLoading(false);
        return;
      }
      
      setInterviewScore(score);

      const techDataStr = sessionStorage.getItem("techData");
      const techData = techDataStr ? JSON.parse(techDataStr) : null;

      const interviewDataStr = sessionStorage.getItem("interviewData");
      const interviewData = interviewDataStr ? JSON.parse(interviewDataStr) : null;

      setUserData({ techData, interviewData });

      await generateJobRecommendations(score, techData);

    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load interview data.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateJobRecommendations = async (score: number, techData: any) => {
    try {
      console.log("🔍 Fetching job recommendations...");
      
      const response = await fetch("/api/recommend-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewScore: score,
          skills: techData,
        }),
      });

      const result = await response.json();
      
      // ✅ Handle different response scenarios
      if (!response.ok || result.source === "error") {
        console.error("API Error:", result.message);
        setApiError(true);
        setJobs([]);
      } else if (result.jobs.length === 0) {
        console.warn("No jobs found");
        setJobs([]);
      } else {
        console.log(`✅ Received ${result.jobs.length} jobs`);
        setJobs(result.jobs);
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setApiError(true);
      setJobs([]);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-gray-600">Finding perfect jobs for you...</p>
        <p className="text-sm text-gray-500 mt-2">Searching real-time listings from India</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 text-center px-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-2xl font-semibold text-gray-800 mb-2">{error}</p>
        <p className="text-gray-600 mb-6">Please complete an interview to get job recommendations.</p>
        <Link href="/interview">
          <Button size="lg">
            <Briefcase size={20} className="mr-2" />
            Start Interview
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/interview-simulation">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              Job Recommendations
              <Briefcase className="text-blue-600" size={36} />
            </h1>
            <p className="text-gray-600 mt-1">
              Based on your interview score of {interviewScore}% • India-based positions
            </p>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-2" />
              <p className="text-3xl font-bold">{interviewScore}%</p>
              <p className="text-sm text-blue-100">Interview Score</p>
            </div>
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-2" />
              <p className="text-3xl font-bold">{jobs.length}</p>
              <p className="text-sm text-blue-100">Matching Jobs</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p className="text-3xl font-bold">
                {jobs.length > 0 ? jobs[0].matchScore : 0}%
              </p>
              <p className="text-sm text-blue-100">Best Match</p>
            </div>
          </div>
        </div>

        {/* Recommendation Level */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Level</h2>
          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-lg font-semibold ${
              interviewScore >= 80 ? 'bg-green-100 text-green-700' :
              interviewScore >= 60 ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {interviewScore >= 80 ? '🏆 Senior Level' :
               interviewScore >= 60 ? '💼 Mid-Level' :
               '🌱 Entry Level'}
            </div>
            <p className="text-gray-600">
              {interviewScore >= 80 ? 'You\'re ready for senior positions with ₹15-35 LPA!' :
               interviewScore >= 60 ? 'Great for intermediate roles with ₹8-15 LPA!' :
               'Perfect for starting your career with ₹4-8 LPA!'}
            </p>
          </div>
        </div>

        {/* Job Listings Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Recommended Jobs</h2>
          {jobs.length > 0 && jobs[0].source === "adzuna" && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Jobs from Adzuna
            </span>
          )}
        </div>
        
        {/* ✅ Error States - NO FALLBACK */}
        {apiError ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-red-200">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">API Failed to Fetch Jobs</h3>
            <p className="text-gray-600 mb-4">
              Unable to connect to Adzuna job listings API.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your API configuration or try again later.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Link href="/interview">
                <Button variant="outline">Back to Interview</Button>
              </Link>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-yellow-200">
            <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Your Current Level is Not Suited for Any Available Jobs
            </h3>
            <p className="text-gray-600 mb-4">
              No job listings match your current interview performance and skill set.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Consider improving your interview score or updating your skills to get better matches.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/interview">
                <Button>Retake Interview</Button>
              </Link>
              <Link href="/resume">
                <Button variant="outline">Update Resume</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Actions */}
        {jobs.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/interview-simulation">
              <Button size="lg" variant="outline">
                Back to Results
              </Button>
            </Link>
            <Link href="/interview">
              <Button size="lg">
                Retake Interview
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg">
                <Home size={20} className="mr-2" />
                Home
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const hasValidUrl = job.url && job.url !== "#" && job.url.startsWith("http");

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-800">{job.title}</h3>
            
            {job.source === "adzuna" && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
            
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              job.matchScore >= 90 ? 'bg-green-100 text-green-700' :
              job.matchScore >= 80 ? 'bg-blue-100 text-blue-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {job.matchScore}% Match
            </span>
          </div>
          <p className="text-xl text-gray-600 font-semibold">{job.company}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={18} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign size={18} />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={18} />
          <span>{job.type} • {job.experience}</span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {job.skills && job.skills.length > 0 ? (
            job.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm italic">Skills not specified</span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {hasValidUrl ? (
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1"
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <ExternalLink size={18} className="mr-2" />
              Apply Now
            </Button>
          </a>
        ) : (
          <Button className="flex-1" disabled>
            <ExternalLink size={18} className="mr-2" />
            Apply Now
          </Button>
        )}
        
        <Button 
          variant="outline"
          onClick={() => {
            const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            if (!savedJobs.find((j: Job) => j.id === job.id)) {
              savedJobs.push(job);
              localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
              alert('Job saved! ✅');
            } else {
              alert('Job already saved!');
            }
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
