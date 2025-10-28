"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-md rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-400 focus:border-white focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-400 focus:border-white focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-all"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center mt-8 text-gray-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-white underline hover:opacity-80">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
