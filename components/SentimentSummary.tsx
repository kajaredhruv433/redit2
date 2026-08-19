import React from 'react';
import { VibeMetrics } from '@/lib/sentiment';
import { ArrowUpRight, TrendingUp, AlertCircle, HelpCircle } from 'lucide-react';

interface SentimentSummaryProps {
  metrics: VibeMetrics;
}

export default function SentimentSummary({ metrics }: SentimentSummaryProps) {
  const {
    totalCount,
    positiveCount,
    neutralCount,
    negativeCount,
    positivePercentage,
    neutralPercentage,
    negativePercentage,
    averageScore
  } = metrics;

  const cards = [
    {
      label: "Analyzed Posts",
      value: totalCount,
      subValue: "Top hot ranking",
      colorClass: "border-slate-800 text-white bg-slate-900/20",
      accentBar: "bg-slate-700"
    },
    {
      label: "Positive Sentiment",
      value: positiveCount,
      subValue: `${positivePercentage}% of posts`,
      colorClass: "border-emerald-900/30 text-emerald-400 bg-emerald-950/5",
      accentBar: "bg-emerald-500"
    },
    {
      label: "Neutral Sentiment",
      value: neutralCount,
      subValue: `${neutralPercentage}% of posts`,
      colorClass: "border-amber-900/30 text-amber-400 bg-amber-950/5",
      accentBar: "bg-amber-500"
    },
    {
      label: "Negative Sentiment",
      value: negativeCount,
      subValue: `${negativePercentage}% of posts`,
      colorClass: "border-red-900/30 text-rose-400 bg-rose-950/5",
      accentBar: "bg-red-500"
    },
    {
      label: "Average Score",
      value: averageScore > 0 ? `+${averageScore}` : averageScore,
      subValue: "Raw title sentiment avg",
      colorClass: "border-orange-900/30 text-orange-400 bg-orange-950/5",
      accentBar: "bg-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`glow-card relative overflow-hidden rounded-xl border p-4 flex flex-col justify-between backdrop-blur-sm ${card.colorClass}`}
        >
          {/* Top accent bar */}
          <div className={`absolute top-0 inset-x-0 h-1 ${card.accentBar}`} />
          
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              {card.label}
            </span>
            <div className="text-3xl font-extrabold font-mono mt-1">
              {card.value}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-slate-400 font-medium">
            {card.subValue}
          </div>
        </div>
      ))}
    </div>
  );
}
