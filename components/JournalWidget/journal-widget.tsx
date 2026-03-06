"use client";

import { Paperclip, Save } from "lucide-react";

export default function JournalWidget() {
  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
      {/* Container Box */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-[#1a1a1a]">
        
        {/* Title */}
        <h2 className="mb-6 text-2xl font-bold text-text-primary">Journal</h2>

        {/* Inputs Column */}
        <div className="flex flex-col gap-6">
          
          {/* Input 1: Grateful */}
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="grateful-input" 
              className="text-sm font-medium text-text-primary"
            >
              What are you grateful for today?
            </label>
            <textarea
              id="grateful-input"
              rows={3}
              placeholder="Write down a few things..."
              className="w-full resize-y rounded-lg border border-gray-300 bg-transparent p-3 text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
            />
          </div>

          {/* Input 2: Memory */}
          <div className="flex flex-col gap-2">
            <label 
              htmlFor="memory-input" 
              className="text-sm font-medium text-text-primary"
            >
              What memory do you want to keep?
            </label>
            <textarea
              id="memory-input"
              rows={3}
              placeholder="Describe a moment from today..."
              className="w-full resize-y rounded-lg border border-gray-300 bg-transparent p-3 text-text-primary placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-gray-700 dark:placeholder:text-gray-500 transition-colors"
            />
          </div>

        </div>

        {/* Buttons Section */}
        {/* Uses flex-col on mobile (stacked) and sm:flex-row on desktop (side-by-side) */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          
          {/* Link Files Button */}
          <button 
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-text-primary hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
          >
            <Paperclip size={18} />
            <span>Link files</span>
          </button>

          {/* Save Journal Button (Primary Action) */}
          <button 
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Save size={18} />
            <span>Save journal</span>
          </button>
          
        </div>

      </div>
    </div>
  );
}
