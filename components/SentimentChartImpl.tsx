'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { AnalyzedPost } from '@/types/sentiment';

interface SentimentChartImplProps {
  posts: AnalyzedPost[];
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export default function SentimentChartImpl({
  posts,
  positiveCount,
  neutralCount,
  negativeCount
}: SentimentChartImplProps) {
  // 1. Data for Donut Chart
  const pieData = [
    { name: 'Positive', value: positiveCount, color: '#10b981' },
    { name: 'Neutral', value: neutralCount, color: '#f59e0b' },
    { name: 'Negative', value: negativeCount, color: '#ef4444' }
  ].filter(d => d.value > 0); // Don't show empty categories in pie chart

  // 2. Data for Bar Chart: score by post index
  // We take the posts in original hot order
  const barData = posts.map((post, idx) => ({
    rank: idx + 1,
    title: post.title.length > 30 ? post.title.substring(0, 30) + "..." : post.title,
    score: post.sentimentScore,
    sentiment: post.sentiment
  }));

  // Custom tooltips for Recharts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs shadow-md">
          <span className="font-semibold" style={{ color: data.color }}>{payload[0].name}</span>: {payload[0].value} posts
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sentimentColors = {
        positive: 'text-emerald-400',
        neutral: 'text-amber-400',
        negative: 'text-rose-400'
      };
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs shadow-md max-w-xs">
          <p className="font-bold text-white mb-1">Post #{data.rank}</p>
          <p className="text-slate-300 italic mb-2">"{data.title}"</p>
          <p className="flex justify-between gap-4 font-semibold">
            <span>Score:</span>
            <span className={data.score > 0 ? "text-emerald-400" : data.score < 0 ? "text-rose-400" : "text-amber-400"}>
              {data.score > 0 ? `+${data.score}` : data.score}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Donut Chart */}
      <div className="lg:col-span-1 border border-slate-800 bg-slate-900/30 backdrop-blur-sm p-5 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Sentiment Proportions
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Percentage distribution of title sentiments.
          </p>
        </div>
        
        <div className="h-60 w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Label in center of donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-white">
              {posts.length}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mt-0.5">
              Analyzed
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs font-semibold">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-slate-300">{d.name} ({Math.round((d.value / posts.length) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart: score by rank */}
      <div className="lg:col-span-2 border border-slate-800 bg-slate-900/30 backdrop-blur-sm p-5 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Sentiment Scores by Hot Rank
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visualizes individual post sentiment scores from Hot rank #1 to #{posts.length}.
          </p>
        </div>

        <div className="h-60 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <XAxis dataKey="rank" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar dataKey="score">
                {barData.map((entry, index) => {
                  let cellColor = '#f59e0b'; // amber
                  if (entry.score > 0) cellColor = '#10b981'; // emerald
                  if (entry.score < 0) cellColor = '#ef4444'; // rose
                  return <Cell key={`cell-${index}`} fill={cellColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 mt-3 border-t border-slate-800/50 pt-2 font-medium">
          <span>← Hot Rank #1 (Hottest)</span>
          <span>Hot Rank #{posts.length} →</span>
        </div>
      </div>
    </div>
  );
}
