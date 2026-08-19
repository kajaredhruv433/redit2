export interface RedditPost {
  id: string;
  title: string;
  author: string | null;
  subreddit: string;
  score: number;
  numComments: number;
  url: string;
  permalink: string;
  createdUtc: number;
  thumbnail?: string | null;
}

export interface SubredditHotResponse {
  subreddit: string;
  count: number;
  posts: RedditPost[];
}
