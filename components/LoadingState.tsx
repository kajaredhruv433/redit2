import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  subredditName: string;
}

export default function LoadingState({ subredditName }: LoadingStateProps) {
  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex items-center justify-center gap-3 p-4 bg-slate-900/30 border border-slate-800 rounded-xl max-w-sm mx-auto">
        <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-200">
          Analyzing r/{subredditName}...
        </span>
      </div>

      {/* Vibe Overview Skeleton */}
      <div className="h-44 bg-slate-900/25 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-4">
        <div className="h-4 bg-slate-800 rounded w-20" />
        <div className="h-8 bg-slate-800 rounded w-60" />
        <div className="h-4 bg-slate-800 rounded w-full max-w-md" />
        <div className="h-4 bg-slate-800 rounded w-full max-w-sm" />
      </div>

      {/* Sentiment Summary Metrics Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-900/25 border border-slate-800 rounded-xl p-4 animate-pulse flex flex-col justify-between">
            <div className="h-3 bg-slate-800 rounded w-16" />
            <div className="h-7 bg-slate-800 rounded w-10" />
            <div className="h-3 bg-slate-800 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Chart Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-80 bg-slate-900/25 border border-slate-800 rounded-2xl p-5 animate-pulse flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-28" />
            <div className="h-3 bg-slate-800 rounded w-20" />
          </div>
          <div className="h-40 w-40 rounded-full border-[16px] border-slate-800 mx-auto flex items-center justify-center" />
          <div className="h-4 bg-slate-800 rounded w-32 mx-auto" />
        </div>

        <div className="lg:col-span-2 h-80 bg-slate-900/25 border border-slate-800 rounded-2xl p-5 animate-pulse flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-36" />
            <div className="h-3 bg-slate-800 rounded w-24" />
          </div>
          <div className="h-40 w-full bg-slate-800/40 rounded-lg flex items-end justify-between p-3 gap-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800 rounded-t w-full"
                style={{ height: `${Math.random() * 80 + 10}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between w-full">
            <div className="h-3 bg-slate-800 rounded w-20" />
            <div className="h-3 bg-slate-800 rounded w-20" />
          </div>
        </div>
      </div>

      {/* Post List Skeletons */}
      <div className="space-y-4">
        <div className="h-10 bg-slate-900/25 border border-slate-800 rounded-lg animate-pulse w-48" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900/25 border border-slate-800 rounded-xl p-5 animate-pulse flex gap-4">
              <div className="h-8 w-8 bg-slate-800 rounded-lg flex-shrink-0" />
              <div className="flex-grow space-y-3">
                <div className="h-3.5 bg-slate-800 rounded w-24" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
                <div className="h-3 bg-slate-800 rounded w-32 pt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
