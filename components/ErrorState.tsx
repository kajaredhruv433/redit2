import React from 'react';
import { AlertCircle, Lock, Clock, SearchX, ShieldAlert } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  code: string | null;
  onRetry?: () => void;
}

export default function ErrorState({ message, code, onRetry }: ErrorStateProps) {
  // Map specific error codes to appropriate layout configurations
  const config = {
    "INVALID_SUBREDDIT": {
      icon: SearchX,
      title: "Invalid Subreddit Name",
      colorClass: "bg-rose-500/10 text-rose-400 border-rose-950/40",
      description: "Subreddit names must follow Reddit's conventions: 3 to 21 characters, containing only letters, numbers, and underscores."
    },
    "NOT_FOUND": {
      icon: SearchX,
      title: "Subreddit Not Found",
      colorClass: "bg-rose-500/10 text-rose-400 border-rose-950/40",
      description: "We couldn't find that subreddit. Check the name and try again."
    },
    "PRIVATE_SUBREDDIT": {
      icon: Lock,
      title: "Private Subreddit",
      colorClass: "bg-amber-500/10 text-amber-400 border-amber-950/40",
      description: "This subreddit is set to private. It cannot be accessed without proper authorization from its moderators. Try a public subreddit."
    },
    "RATE_LIMITED": {
      icon: Clock,
      title: "Rate Limit Reached",
      colorClass: "bg-orange-500/10 text-orange-400 border-orange-950/40",
      description: "Reddit API rate limit reached. Please wait a moment before trying again."
    },
    "EMPTY_RESPONSE": {
      icon: ShieldAlert,
      title: "No Posts Returned",
      colorClass: "bg-slate-900/60 text-slate-400 border-slate-800",
      description: "No Hot posts were returned for this subreddit. It may be inactive or empty."
    },
    "REDDIT_API_ERROR": {
      icon: AlertCircle,
      title: "Reddit API Error",
      colorClass: "bg-rose-500/10 text-rose-400 border-rose-950/40",
      description: "Reddit is temporarily unavailable. Please try again in a few moments."
    }
  }[code || "REDDIT_API_ERROR"] || {
    icon: AlertCircle,
    title: "An Error Occurred",
    colorClass: "bg-rose-500/10 text-rose-400 border-rose-950/40",
    description: message || "Something went wrong while processing your request."
  };

  const IconComponent = config.icon;

  return (
    <div className={`rounded-2xl border p-6 flex flex-col items-center text-center backdrop-blur-sm max-w-lg mx-auto my-8 ${config.colorClass}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950/40 mb-4 border border-slate-850">
        <IconComponent className="h-6 w-6" />
      </div>
      
      <h3 className="text-base font-bold text-white">
        {config.title}
      </h3>
      
      <p className="mt-2 text-xs text-slate-300 leading-relaxed">
        {config.description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors duration-200 border border-slate-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
