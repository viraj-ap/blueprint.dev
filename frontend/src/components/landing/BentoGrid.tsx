import React from "react";
import {
  Compass,
  Building,
  Sun,
  Heart,
  Camera,
  MapPin,
  Moon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const BentoGrid = () => {
  const items = [
    {
      title: "AI-Powered Architecture",
      icon: <Compass className="w-6 h-6 text-blue-500" />,
      desc: "Instant implementation plans generated from your rough ideas using Gemini 2.5 Flash.",
      className:
        "md:col-span-2 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900",
    },
    {
      title: "Real-time Collaboration",
      icon: <Building className="w-6 h-6 text-green-500" />,
      desc: "Multiplayer cursors, live typing, and presence.",
      className: "md:col-span-1",
    },
    {
      title: "Whiteboard & Annotation",
      icon: <Sun className="w-6 h-6 text-orange-500" />,
      desc: "Draw diagrams and attach images directly to your specs.",
      className: "md:col-span-1",
    },
    {
      title: "Agentic Reasoning",
      icon: <Heart className="w-6 h-6 text-red-500" />,
      desc: "The AI acts as a Tech Lead, reviewing your logic for conflicts.",
      className:
        "md:col-span-2 bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900",
    },
    {
      title: "Live Preview",
      icon: <Camera className="w-6 h-6 text-pink-500" />,
      desc: "See your plan evolve in real-time.",
      className: "md:col-span-1",
    },
    {
      title: "Export to Code",
      icon: <MapPin className="w-6 h-6 text-indigo-500" />,
      desc: "Turn plans into actionable Markdown tasks.",
      className: "md:col-span-1",
    },
    {
      title: "Dark Mode Native",
      icon: <Moon className="w-6 h-6 text-gray-500" />,
      desc: "Built for late-night hacking sessions.",
      className: "md:col-span-1",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto py-24 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        Everything you need to{" "}
        <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-500 to-purple-500">
          plan faster
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
        {items.map((item, i) => (
          <Card
            key={i}
            className={`group hover:shadow-lg transition-all hover:-translate-y-1 duration-300 ${
              item.className || ""
            }`}
          >
            <CardHeader>
              <div className="mb-2 p-3 bg-background rounded-full w-fit shadow-sm group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg">{item.title}</h3>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              {item.desc}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
