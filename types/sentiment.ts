import { RedditPost } from './reddit';

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface AnalyzedPost extends RedditPost {
  sentimentScore: number;
  sentiment: SentimentLabel;
}

export type SentimentFilter = "all" | "positive" | "neutral" | "negative";

export type SortOption = "rank" | "score" | "sentiment" | "comments";
