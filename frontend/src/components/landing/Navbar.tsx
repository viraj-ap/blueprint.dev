import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface NavbarProps {
  onJoinClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onJoinClick }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50 flex justify-center px-4 py-4">
      <div
        className={`w-[90vw] flex items-center justify-between rounded-xl px-6 py-3 transition-all ${
          scrolled
            ? "bg-background border shadow-md"
            : "bg-background/80 backdrop-blur"
        }`}
      >
        <img
          src="/logo.png"
          className="h-8 md:h-10 cursor-pointer"
          onClick={() => navigate("/")}
          alt="Logo"
        />

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onJoinClick}>
            Join
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </div>
  );
};
