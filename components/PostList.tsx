'use client';

import React, { useState, useMemo } from 'react';
import { AnalyzedPost, SentimentFilter, SortOption } from '@/types/sentiment';
import FilterTabs from './FilterTabs';
import PostCard from './PostCard';
import EmptyState from './EmptyState';

interface PostListProps {
  posts: AnalyzedPost[];
}

export default function PostList({ posts }: PostListProps) {
  const [filter, setFilter] = useState<SentimentFilter>("all");
  const [sort, setSort] = useState<SortOption>("rank");

  // Keep track of the original rank (1-indexed index in the fetched list)
  const postsWithOriginalRank = useMemo(() => {
    return posts.map((post, index) => ({
      post,
      originalRank: index + 1
    }));
  }, [posts]);

  // Compute sentiment counts for tabs
  const counts = useMemo(() => {
    const counts = { all: posts.length, positive: 0, neutral: 0, negative: 0 };
    posts.forEach((p) => {
      if (p.sentiment === "positive") counts.positive++;
      else if (p.sentiment === "negative") counts.negative++;
      else counts.neutral++;
    });
    return counts;
  }, [posts]);

  // Filter and sort computation
  const filteredAndSorted = useMemo(() => {
    // 1. Filter
    let result = postsWithOriginalRank;
    if (filter !== "all") {
      result = result.filter(item => item.post.sentiment === filter);
    }

    // 2. Sort
    return [...result].sort((a, b) => {
      if (sort === "rank") {
        return a.originalRank - b.originalRank;
      }
      if (sort === "score") {
        return b.post.score - a.post.score;
      }
      if (sort === "comments") {
        return b.post.numComments - a.post.numComments;
      }
      if (sort === "sentiment") {
        return b.post.sentimentScore - a.post.sentimentScore;
      }
      return 0;
    });
  }, [postsWithOriginalRank, filter, sort]);

  return (
    <div className="space-y-6">
      <FilterTabs
        activeFilter={filter}
        onFilterChange={setFilter}
        activeSort={sort}
        onSortChange={setSort}
        counts={counts}
      />

      {filteredAndSorted.length === 0 ? (
        <EmptyState message={`No posts found matching the "${filter}" sentiment filter.`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAndSorted.map(({ post, originalRank }) => (
            <PostCard
              key={post.id}
              post={post}
              rank={originalRank}
            />
          ))}
        </div>
      )}
    </div>
  );
}
