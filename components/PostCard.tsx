import React from 'react';
import { MessageSquare, ArrowUp, User, ExternalLink } from 'lucide-react';
import { AnalyzedPost } from '@/types/sentiment';

interface PostCardProps {
  post: AnalyzedPost;
  rank: number;
}

export default function PostCard({ post, rank }: PostCardProps) {
  const {
    id,
    title,
    author,
    score,
    numComments,
    permalink,
    sentimentScore,
    sentiment,
    subreddit
  } = post;

  // Sentiment styling configurations
  const sentimentConfig = {
    positive: {
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      badgeText: "🟢 Positive",
      scoreText: `+${sentimentScore}`,
      cardGlow: "group-hover:border-emerald-500/30"
    },
    neutral: {
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      badgeText: "🟡 Neutral",
      scoreText: `0`,
      cardGlow: "group-hover:border-amber-500/30"
    },
    negative: {
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      badgeText: "🔴 Negative",
      scoreText: `${sentimentScore}`,
      cardGlow: "group-hover:border-rose-500/30"
    }
  }[sentiment];

  const redditUrl = id.startsWith("mock")
    ? `https://www.reddit.com/r/${subreddit}`
    : `https://www.reddit.com${permalink}`;

  // Helper to format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  };

  return (
    <article className={`group relative rounded-xl border border-slate-800 bg-slate-900/20 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-slate-900/40 hover:translate-y-[-2px] ${sentimentConfig.cardGlow}`}>
      <div className="flex items-start gap-4">
        {/* Hottest Rank Badge */}
        <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-bold font-mono text-slate-300">
          #{rank}
        </span>

        {/* Content details */}
        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Sentiment Badges (Color + Text accessible) */}
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${sentimentConfig.badgeClass}`}>
              {sentimentConfig.badgeText}
            </span>
            
            <span className="text-[11px] text-slate-500 font-medium">
              Sentiment: <span className="font-semibold text-slate-300">{sentimentConfig.scoreText}</span>
            </span>
          </div>

          <h4 className="text-sm font-semibold leading-relaxed text-white group-hover:text-orange-400 transition-colors duration-200 break-words mb-3">
            {title}
          </h4>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/50">
            {/* Left metadata: Author & Counts */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3.5 w-3.5 text-orange-500" />
                <span className="font-bold text-slate-200">{formatNumber(score)}</span>
              </span>
              
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-bold text-slate-200">{formatNumber(numComments)}</span>
              </span>

              {author && (
                <span className="hidden sm:flex items-center gap-1.5 text-slate-500">
                  <User className="h-3.5 w-3.5" />
                  u/{author}
                </span>
              )}
            </div>

            {/* View post link */}
            <a
              href={redditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors duration-200 uppercase tracking-wider"
            >
              Reddit
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
