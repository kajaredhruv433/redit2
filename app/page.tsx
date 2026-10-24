'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SubredditSearch from '@/components/SubredditSearch';
import SuggestedSubreddits from '@/components/SuggestedSubreddits';
import VibeOverview from '@/components/VibeOverview';
import SentimentSummary from '@/components/SentimentSummary';
import SentimentChart from '@/components/SentimentChart';
import PostList from '@/components/PostList';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';

import { RedditPost } from '@/types/reddit';
import { AnalyzedPost } from '@/types/sentiment';
import { analyzePost, calculateVibeMetrics } from '@/lib/sentiment';

export default function Home() {
  const [subreddit, setSubreddit] = useState("");
  const [searchedSubreddit, setSearchedSubreddit] = useState("");
  const [posts, setPosts] = useState<AnalyzedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Core search handler
  const handleSearch = useCallback(async (targetSubreddit: string) => {
    if (!targetSubreddit) return;
    
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setSubreddit(targetSubreddit);

    try {
      const response = await fetch(`/api/subreddit/${encodeURIComponent(targetSubreddit)}/hot?limit=50`, {
        cache: 'no-store'
      });
      const data = await response.json();

      if (!response.ok) {
        setPosts([]);
        setError(data.error || "Unable to fetch subreddit posts");
        setErrorCode(data.code || "REDDIT_API_ERROR");
        setSearchedSubreddit(targetSubreddit);
        setLoading(false);
        return;
      }

      const fetchedPosts: RedditPost[] = data.posts || [];
      
      if (fetchedPosts.length === 0) {
        setPosts([]);
        setError("No Hot posts were returned for this subreddit.");
        setErrorCode("EMPTY_RESPONSE");
        setSearchedSubreddit(data.subreddit || targetSubreddit);
        setLoading(false);
        return;
      }

      // CLIENT-SIDE SENTIMENT ANALYSIS (Crucial Requirement)
      // Every post title is analyzed in the browser
      const analyzed: AnalyzedPost[] = fetchedPosts.map((post) => analyzePost(post));
      
      setPosts(analyzed);
      setSearchedSubreddit(data.subreddit || targetSubreddit);
    } catch (err: any) {
      console.error("[App] Fetch failed:", err);
      setPosts([]);
      setError("Reddit is temporarily unavailable. Please check your connection and try again.");
      setErrorCode("REDDIT_API_ERROR");
      setSearchedSubreddit(targetSubreddit);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: fetch r/technology
  useEffect(() => {
    handleSearch("technology");
  }, [handleSearch]);

  // Calculate stats if we have posts
  const vibeMetrics = React.useMemo(() => {
    return calculateVibeMetrics(posts);
  }, [posts]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      {/* Premium Header */}
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Control Panel */}
        <section className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-2">
              Check Subreddit Sentiment
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              Enter a subreddit name below to retrieve its top 50 Hot posts and instantly analyze the tone and mood of the conversations.
            </p>
            
            <SubredditSearch
              onSearch={handleSearch}
              isLoading={loading}
              initialValue={subreddit}
            />
            
            <SuggestedSubreddits
              onSelect={handleSearch}
              selectedSubreddit={searchedSubreddit}
              disabled={loading}
            />
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="space-y-8">
          {loading ? (
            <LoadingState subredditName={subreddit || searchedSubreddit} />
          ) : error ? (
            <ErrorState
              message={error}
              code={errorCode}
              onRetry={() => handleSearch(subreddit || searchedSubreddit)}
            />
          ) : posts.length > 0 ? (
            <div className="space-y-8 animate-fadeIn">
              {/* Overall Vibe Classified */}
              <VibeOverview
                metrics={vibeMetrics}
                subreddit={searchedSubreddit}
              />

              {/* Numerical Metrics Summary */}
              <SentimentSummary metrics={vibeMetrics} />

              {/* Distribution Charts */}
              <SentimentChart
                posts={posts}
                positiveCount={vibeMetrics.positiveCount}
                neutralCount={vibeMetrics.neutralCount}
                negativeCount={vibeMetrics.negativeCount}
              />

              {/* Filterable Posts Grid */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Analyzed Hot Posts
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Browse posts and sort them by rank, sentiment, comments, or Reddit scores.
                  </p>
                </div>
                
                <PostList posts={posts} />
              </div>
            </div>
          ) : (
            <EmptyState message="Enter or select a subreddit to check its vibe." />
          )}
        </section>
      </main>

      {/* Footer details */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p className="max-w-7xl mx-auto px-4">
          The Subreddit Vibe Check &copy; {new Date().getFullYear()} &middot; Built for Full Stack Developer Internship Assignment.
        </p>
      </footer>
    </div>
  );
}
