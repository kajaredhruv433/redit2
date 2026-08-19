'use client';

import React, { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { normalizeSubreddit, isValidSubredditName } from '@/lib/validation';

interface SubredditSearchProps {
  onSearch: (name: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export default function SubredditSearch({ onSearch, isLoading, initialValue = "" }: SubredditSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = normalizeSubreddit(query);

    if (!cleanName) {
      setError("Please enter a subreddit name.");
      return;
    }

    if (!isValidSubredditName(cleanName)) {
      setError("Subreddits must be 3-21 characters and contain only letters, numbers, or underscores.");
      return;
    }

    onSearch(cleanName);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            id="subreddit-input"
            name="subreddit"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter a subreddit, e.g. technology"
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-orange-600/20"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Checking...
            </>
          ) : (
            "Check Vibe"
          )}
        </button>
      </form>
      
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-1 font-medium animate-fadeIn">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
