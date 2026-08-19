import Sentiment from 'sentiment';
import { RedditPost } from '../types/reddit';
import { AnalyzedPost, SentimentLabel } from '../types/sentiment';

// Create a singleton instance of Sentiment
const sentimentAnalyzer = new Sentiment();

/**
 * Analyzes a single Reddit post title and assigns a sentiment score and label.
 */
export function analyzePost(post: RedditPost): AnalyzedPost {
  const result = sentimentAnalyzer.analyze(post.title || "");
  const score = result.score;
  
  let label: SentimentLabel = "neutral";
  if (score > 0) {
    label = "positive";
  } else if (score < 0) {
    label = "negative";
  }

  return {
    ...post,
    sentimentScore: score,
    sentiment: label,
  };
}

/**
 * Interface representing aggregated sentiment metrics for a set of posts.
 */
export interface VibeMetrics {
  totalCount: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  averageScore: number;
  vibeScore: number;
  vibeLabel: "Very Positive" | "Positive" | "Neutral" | "Negative" | "Very Negative";
}

/**
 * Computes aggregated statistics and the overall classified vibe from a list of analyzed posts.
 */
export function calculateVibeMetrics(posts: AnalyzedPost[]): VibeMetrics {
  const totalCount = posts.length;

  if (totalCount === 0) {
    return {
      totalCount: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      positivePercentage: 0,
      neutralPercentage: 0,
      negativePercentage: 0,
      averageScore: 0,
      vibeScore: 0,
      vibeLabel: "Neutral",
    };
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let sumScore = 0;

  posts.forEach((post) => {
    sumScore += post.sentimentScore;
    if (post.sentiment === "positive") {
      positiveCount++;
    } else if (post.sentiment === "negative") {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  const positivePercentage = Math.round((positiveCount / totalCount) * 100);
  const neutralPercentage = Math.round((neutralCount / totalCount) * 100);
  const negativePercentage = Math.round((negativeCount / totalCount) * 100);
  
  const averageScore = Number((sumScore / totalCount).toFixed(2));
  
  // Vibe score formula: (positiveCount - negativeCount) / totalPosts
  const vibeScore = Number(((positiveCount - negativeCount) / totalCount).toFixed(4));
  
  let vibeLabel: "Very Positive" | "Positive" | "Neutral" | "Negative" | "Very Negative" = "Neutral";
  
  if (vibeScore >= 0.25) {
    vibeLabel = "Very Positive";
  } else if (vibeScore >= 0.05) {
    vibeLabel = "Positive";
  } else if (vibeScore > -0.05) {
    vibeLabel = "Neutral";
  } else if (vibeScore > -0.25) {
    vibeLabel = "Negative";
  } else {
    vibeLabel = "Very Negative";
  }

  return {
    totalCount,
    positiveCount,
    neutralCount,
    negativeCount,
    positivePercentage,
    neutralPercentage,
    negativePercentage,
    averageScore,
    vibeScore,
    vibeLabel,
  };
}
