"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cpu, Code, Wrench, Home, Database, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface TechData {
  languages: string[];
  frameworks: string[];
  tools: string[];
  databases: string[];
}

interface TechStats {
  pages?: number;
  textLength?: number;
}

export default function TechStackPage() {
  const [data, setData] = useState<TechData | null>(null);
  const [stats, setStats] = useState<TechStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("techData");
      const storedStats = sessionStorage.getItem("techStats");
      
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData(parsedData);
        
        if (storedStats) {
          setStats(JSON.parse(storedStats));
        }
      } else {
        setError("No tech stack data found. Please upload your resume first.");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load tech stack data. Please try uploading again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate total tech count
  const totalTechCount = data
    ? Object.values(data).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-xl text-gray-600">Loading your tech stack...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100">
        <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
        <p className="text-2xl mb-2 font-semibold text-gray-800">
          {error || "No data found"}
        </p>
        <p className="text-gray-600 mb-6">Please upload your resume first.</p>
        <Link href="/resume">
          <Button size="lg" className="flex items-center gap-2">
            <Home size={20} /> Go to Upload
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Your Tech Stack
            </h1>
            <p className="text-gray-600">
              {totalTechCount} technologies detected across {stats?.pages || "multiple"} pages
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2" size="lg">
              <Home size={20} /> Home
            </Button>
          </Link>
        </header>

        {/* Stats Bar */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-4 mb-8 flex justify-around items-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{totalTechCount}</p>
              <p className="text-sm text-gray-600">Total Skills</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.pages}</p>
              <p className="text-sm text-gray-600">Pages Scanned</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {Math.round((stats.textLength || 0) / 1000)}k
              </p>
              <p className="text-sm text-gray-600">Characters</p>
            </div>
          </div>
        )}

        {/* Tech Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Category
            icon={<Code className="text-blue-600" size={28} />}
            title="Languages"
            list={data.languages}
            color="blue"
          />
          <Category
            icon={<Cpu className="text-green-600" size={28} />}
            title="Frameworks"
            list={data.frameworks}
            color="green"
          />
          <Category
            icon={<Wrench className="text-orange-600" size={28} />}
            title="Tools"
            list={data.tools}
            color="orange"
          />
          <Category
            icon={<Database className="text-purple-600" size={28} />}
            title="Databases"
            list={data.databases}
            color="purple"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/resume">
            <Button variant="outline" size="lg">
              Upload New Resume
            </Button>
          </Link>
          <Button
            size="lg"
            onClick={() => {
              const dataStr = JSON.stringify(data, null, 2);
              const blob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "tech-stack.json";
              a.click();
            }}
          >
            Export as JSON
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CategoryProps {
  icon: React.ReactNode;
  title: string;
  list: string[];
  color: "blue" | "green" | "orange" | "purple";
}

function Category({ icon, title, list, color }: CategoryProps) {
  const colorClasses = {
    blue: "border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    green: "border-green-200 hover:border-green-400 hover:shadow-green-100",
    orange: "border-orange-200 hover:border-orange-400 hover:shadow-orange-100",
    purple: "border-purple-200 hover:border-purple-400 hover:shadow-purple-100",
  };

  const badgeColors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div
      className={`bg-white shadow-md rounded-2xl p-6 border-2 transition-all duration-300 ${colorClasses[color]} hover:shadow-xl`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h2>
        <span className={`text-sm font-bold px-3 py-1 rounded-full border ${badgeColors[color]}`}>
          {list?.length || 0}
        </span>
      </div>

      {list?.length > 0 ? (
        <ul className="space-y-2">
          {list.map((item: string, i: number) => (
            <li
              key={i}
              className="text-base text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 hover:bg-gray-100 transition-colors capitalize"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">None detected</p>
        </div>
      )}
    </div>
  );
}