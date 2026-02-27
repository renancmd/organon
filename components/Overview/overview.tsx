"use client";

import { useState } from "react";
import { CheckCircle2, Calendar as CalendarIcon } from "lucide-react";

// Define the available tabs to ensure type safety
type Tab = "today" | "tomorrow" | "next7";

// Mock data strictly for front-end UI testing
const mockData = {
  today: {
    tasks: ["Finish Next.js layout", "Setup Neovim transparency", "Review pull requests"],
    events: ["Team standup at 10 AM", "Dentist appointment at 3 PM"],
  },
  tomorrow: {
    tasks: ["Plan database schema", "Write ReChunk mod documentation"],
    events: ["Lunch with mentor at 1 PM"],
  },
  next7: {
    tasks: ["Build authentication flow", "Apply for backend internship", "Update resume"],
    events: ["Cybersecurity webinar on Thursday", "Hack The Box practice on Saturday"],
  },
};

export default function Overview() {
  // State to track which tab is currently active
  const [activeTab, setActiveTab] = useState<Tab>("today");

  // Get the data for the currently selected tab
  const currentData = mockData[activeTab];

  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
      {/* Outer Styled Box (Matches the Journal Widget) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">
        
        {/* Title */}
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Overview</h1>

        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-row gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton 
            label="Today" 
            isActive={activeTab === "today"} 
            onClick={() => setActiveTab("today")} 
          />
          <TabButton 
            label="Tomorrow" 
            isActive={activeTab === "tomorrow"} 
            onClick={() => setActiveTab("tomorrow")} 
          />
          <TabButton 
            label="Next 7 days" 
            isActive={activeTab === "next7"} 
            onClick={() => setActiveTab("next7")} 
          />
        </div>

        {/* Main Content Container (Tasks & Events) */}
        {/* Added a top border to separate the tabs from the content cleanly */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800/60">
          
          {/* Responsive Grid: 1 column on mobile, 2 on desktop */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            
            {/* Tasks Container */}
            <section>
              <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
                <CheckCircle2 className="text-brand" size={20} />
                <h2 className="text-xl font-semibold text-text-primary">Tasks</h2>
              </div>
              
              <ul className="flex flex-col gap-3">
                {currentData.tasks.length > 0 ? (
                  currentData.tasks.map((task, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <div className="h-4 w-4 rounded border border-gray-400 dark:border-gray-600 shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No tasks scheduled.</p>
                )}
              </ul>
            </section>

            {/* Events Container */}
            <section>
              <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
                <CalendarIcon className="text-brand" size={20} />
                <h2 className="text-xl font-semibold text-text-primary">Events</h2>
              </div>
              
              <ul className="flex flex-col gap-3">
                {currentData.events.length > 0 ? (
                  currentData.events.map((event, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <div className="h-2 w-2 rounded-full bg-brand shrink-0" />
                      <span>{event}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No events scheduled.</p>
                )}
              </ul>
            </section>

          </div>
        </div>
        
      </div>
    </div>
  );
}

// Helper component for the tab buttons
function TabButton({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-brand text-white shadow-md"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
