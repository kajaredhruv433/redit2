import { Smile, Meh, Frown, Sparkles, SmilePlus, Angry } from 'lucide-react';
import { VibeMetrics } from '@/lib/sentiment';

interface VibeOverviewProps {
  metrics: VibeMetrics;
  subreddit: string;
}

export default function VibeOverview({ metrics, subreddit }: VibeOverviewProps) {
  const { vibeLabel, vibeScore, totalCount } = metrics;

  // Visual helper configurations based on vibe
  const config = {
    "Very Positive": {
      icon: SmilePlus,
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      gradient: "from-emerald-500/5 to-transparent",
      emoji: "😊",
      description: "Optimistic and enthusiastic. Titles contain strong positive verbs and excitement."
    },
    "Positive": {
      icon: Smile,
      colorClass: "text-green-400 bg-green-500/10 border-green-500/20",
      gradient: "from-green-500/5 to-transparent",
      emoji: "🙂",
      description: "Generally favorable and pleasant. The discussion leans constructive."
    },
    "Neutral": {
      icon: Meh,
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      gradient: "from-amber-500/5 to-transparent",
      emoji: "😐",
      description: "Balanced, factual, or objective. Titles are mostly headlines or queries without emotional load."
    },
    "Negative": {
      icon: Frown,
      colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      gradient: "from-orange-500/5 to-transparent",
      emoji: "🙁",
      description: "Leaning critical, concerned, or dissatisfied. A high frequency of negative terms."
    },
    "Very Negative": {
      icon: Angry,
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      gradient: "from-rose-500/5 to-transparent",
      emoji: "😡",
      description: "Highly hostile, frustrated, or alarmed. Major concerns or complaints dominate."
    }
  }[vibeLabel];

  const IconComponent = config.icon;

  return (
    <div className={`glow-card relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm bg-gradient-to-br ${config.gradient}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Subreddit Vibe
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
            r/{subreddit} is <span className="text-orange-500">{vibeLabel}</span>
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-lg">
            {config.description}
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-center">
          <div className="text-5xl select-none" role="img" aria-label={vibeLabel}>
            {config.emoji}
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Vibe Score
            </span>
            <span className="text-2xl font-bold font-mono text-white">
              {vibeScore > 0 ? `+${vibeScore.toFixed(2)}` : vibeScore.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Range: -1.0 to +1.0
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          Based on sentiment analysis of {totalCount} Hot post titles.
        </span>
        <span>
          Does not represent full subreddit opinion.
        </span>
      </div>
    </div>
  );
}
