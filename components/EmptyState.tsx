import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "No items to display." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mb-4">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-white">No posts found</h3>
      <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
        {message}
      </p>
    </div>
  );
}
