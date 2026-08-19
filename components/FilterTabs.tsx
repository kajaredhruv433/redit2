import React from 'react';
import { SentimentFilter, SortOption } from '@/types/sentiment';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';

interface FilterTabsProps {
  activeFilter: SentimentFilter;
  onFilterChange: (filter: SentimentFilter) => void;
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    positive: number;
    neutral: number;
    negative: number;
  };
}

export default function FilterTabs({
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
  counts
}: FilterTabsProps) {
  const filterOptions: { label: string; value: SentimentFilter; count: number; colorClass: string }[] = [
    { label: "All Posts", value: "all", count: counts.all, colorClass: "border-slate-800 text-slate-300" },
    { label: "🟢 Positive", value: "positive", count: counts.positive, colorClass: "border-emerald-500/20 text-emerald-400" },
    { label: "🟡 Neutral", value: "neutral", count: counts.neutral, colorClass: "border-amber-500/20 text-amber-400" },
    { label: "🔴 Negative", value: "negative", count: counts.negative, colorClass: "border-rose-500/20 text-rose-400" }
  ];

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Hot Rank", value: "rank" },
    { label: "Reddit Score", value: "score" },
    { label: "Comments", value: "comments" },
    { label: "Sentiment Score", value: "sentiment" }
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      {/* Filtering tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {filterOptions.map((opt) => {
          const isActive = activeFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? "bg-slate-800 text-white border-slate-700 shadow-sm"
                  : "bg-slate-900/40 text-slate-400 border-slate-800/60 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <span>{opt.label}</span>
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-950/60 ${isActive ? "text-orange-400" : "text-slate-500"}`}>
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sorting select */}
      <div className="flex items-center gap-2 self-start md:self-auto">
        <label htmlFor="sort-select" className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
          Sort by:
        </label>
        
        <select
          id="sort-select"
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
