'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AnalyzedPost } from '@/types/sentiment';

// Dynamically import Recharts charts implementation with SSR disabled
const SentimentChartImpl = dynamic(
  () => import('./SentimentChartImpl'),
  { 
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-1 h-80 bg-slate-900/40 border border-slate-800 rounded-2xl" />
        <div className="lg:col-span-2 h-80 bg-slate-900/40 border border-slate-800 rounded-2xl" />
      </div>
    )
  }
);

interface SentimentChartProps {
  posts: AnalyzedPost[];
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export default function SentimentChart({
  posts,
  positiveCount,
  neutralCount,
  negativeCount
}: SentimentChartProps) {
  return (
    <SentimentChartImpl
      posts={posts}
      positiveCount={positiveCount}
      neutralCount={neutralCount}
      negativeCount={negativeCount}
    />
  );
}
