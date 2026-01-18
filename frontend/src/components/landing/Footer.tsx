import React from "react";

export const Footer = () => (
  <footer className="mt-24 bg-black dark:bg-white text-white dark:text-black px-6 py-12">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
      <div>
        <img src="/logo.png" className="w-24 mb-4" alt="Logo" />
        <p className="max-w-md opacity-70">
          Figma for AI Agents. Collaborative logic review.
        </p>
      </div>
    </div>
    <div className="mt-8 text-center text-sm opacity-60">
      © {new Date().getFullYear()} All rights reserved.
    </div>
  </footer>
);
