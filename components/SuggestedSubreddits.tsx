import React from 'react';

interface SuggestedSubredditsProps {
  onSelect: (name: string) => void;
  selectedSubreddit?: string;
  disabled: boolean;
}

const SUGGESTIONS = [
  "Technology",
  "Gaming",
  "Movies",
  "AskReddit",
  "Science",
  "WorldNews",
  "Programming"
];

export default function SuggestedSubreddits({ onSelect, selectedSubreddit = "", disabled }: SuggestedSubredditsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
        Try:
      </span>
      {SUGGESTIONS.map((sub) => {
        const isSelected = selectedSubreddit.toLowerCase() === sub.toLowerCase();
        return (
          <button
            key={sub}
            onClick={() => onSelect(sub)}
            disabled={disabled}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSelected
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm"
                : "bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-950"
            }`}
          >
            r/{sub}
          </button>
        );
      })}
    </div>
  );
}
