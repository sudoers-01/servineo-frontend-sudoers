"use client";
import React from "react";
import { Github } from "lucide-react";

export default function GithubButton() {
  const handleGithub = () => {
    window.location.href = "http://localhost:8000/auth/github";
  };

  return (
    <button
      onClick={handleGithub}
      className="flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-gray-100"
      aria-label="Continuar con GitHub"
    >
      <Github size={18} />
      Continuar con GitHub
    </button>
  );
}