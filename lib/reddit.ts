import { RedditPost } from '../types/reddit';
import { getRedditAccessToken } from './reddit-auth';
import { isValidSubredditName, normalizeSubreddit } from './validation';
import { generateMockPosts } from './reddit-mock';

export class RedditAPIError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "RedditAPIError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Fetches the top Hot posts for a subreddit, enforcing standard validations.
 * Supports OAuth authenticated calls, public endpoint fallback, and mock data mode.
 */
export async function fetchHotPosts(
  subredditInput: string,
  limitInput: number = 50
): Promise<RedditPost[]> {
  const subreddit = normalizeSubreddit(subredditInput);
  
  if (!isValidSubredditName(subreddit)) {
    throw new RedditAPIError(
      "We couldn't find that subreddit. Check the name and try again.",
      "INVALID_SUBREDDIT",
      400
    );
  }

  // Enforce limits: 1 <= limit <= 50
  const limit = Math.min(50, Math.max(1, limitInput));

  // If mock mode is forced, return mock data immediately
  if (process.env.USE_MOCK_REDDIT === "true") {
    console.log(`[Reddit Service] Using forced Mock mode for r/${subreddit}`);
    return generateMockPosts(subreddit, limit);
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const hasOAuthCredentials = clientId && clientSecret && 
                              clientId !== "your_client_id" && 
                              clientSecret !== "your_client_secret";

  const userAgent = process.env.REDDIT_USER_AGENT || "web:subreddit-vibe-check:v1.0.0 (by /u/reddit-vibe-check-dev)";

  let response: Response;
  let useAuthenticatedFlow = false;

  try {
    if (hasOAuthCredentials) {
      // Authenticated OAuth Flow
      try {
        const token = await getRedditAccessToken();
        const url = `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`;
        console.log(`[Reddit Service] Fetching via OAuth API: ${url}`);
        
        response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": userAgent,
          },
          cache: "no-store",
        });
        useAuthenticatedFlow = true;
      } catch (authError: any) {
        console.warn("[Reddit Service] OAuth authentication failed, falling back to public endpoint:", authError.message);
        // Fall back to unauthenticated public endpoint
        const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
        response = await fetch(url, {
          headers: {
            "User-Agent": userAgent,
          },
          cache: "no-store",
        });
      }
    } else {
      // Unauthenticated Public JSON Flow
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      console.log(`[Reddit Service] Fetching via public endpoint: ${url}`);
      response = await fetch(url, {
        headers: {
          "User-Agent": userAgent,
        },
        cache: "no-store",
      });
    }

    // Handle redirects (e.g. public endpoint redirects search.json when subreddit does not exist)
    if (response.redirected || response.url.includes("search.json") || response.url.includes("/search?")) {
      throw new RedditAPIError(
        "We couldn't find that subreddit. Check the name and try again.",
        "NOT_FOUND",
        404
      );
    }

    // Handle HTTP status codes
    if (!response.ok) {
      if (response.status === 404) {
        throw new RedditAPIError(
          "We couldn't find that subreddit. Check the name and try again.",
          "NOT_FOUND",
          404
        );
      } else if (response.status === 403 || response.status === 401) {
        if (process.env.NODE_ENV !== "production" && !hasOAuthCredentials) {
          console.warn("[Reddit Service] Received 403 Forbidden for unauthenticated request. Falling back to Mock data.");
          return generateMockPosts(subreddit, limit);
        }
        throw new RedditAPIError(
          "This subreddit cannot be accessed. Try a public subreddit.",
          "PRIVATE_SUBREDDIT",
          403
        );
      } else if (response.status === 429) {
        if (process.env.NODE_ENV !== "production" && !hasOAuthCredentials) {
          console.warn("[Reddit Service] Received 429 Rate Limit for unauthenticated request. Falling back to Mock data.");
          return generateMockPosts(subreddit, limit);
        }
        throw new RedditAPIError(
          "Reddit API rate limit reached. Please wait a moment before trying again.",
          "RATE_LIMITED",
          429
        );
      } else {
        throw new RedditAPIError(
          "Reddit is temporarily unavailable. Please try again.",
          "REDDIT_API_ERROR",
          response.status
        );
      }
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.data || !data.data.children) {
      // If we got valid HTTP but empty/malformed structures
      if (data && data.error === 403) {
        throw new RedditAPIError(
          "This subreddit cannot be accessed. Try a public subreddit.",
          "PRIVATE_SUBREDDIT",
          403
        );
      }
      throw new RedditAPIError(
        "Reddit is temporarily unavailable. Please try again.",
        "REDDIT_API_ERROR",
        500
      );
    }

    const children = data.data.children;
    if (children.length === 0) {
      throw new RedditAPIError(
        "No Hot posts were returned for this subreddit.",
        "EMPTY_RESPONSE",
        200
      );
    }

    // Map and normalize fields
    const posts: RedditPost[] = children
      .filter((child: any) => child.kind === "t3") // Only link/post types (t3)
      .map((child: any) => {
        const p = child.data;
        return {
          id: p.id || "",
          title: p.title || "",
          author: p.author || null,
          subreddit: p.subreddit || subreddit,
          score: p.score ?? 0,
          numComments: p.num_comments ?? 0,
          url: p.url || `https://www.reddit.com/r/${subreddit}/comments/${p.id}`,
          permalink: p.permalink || `/r/${subreddit}/comments/${p.id}/`,
          createdUtc: p.created_utc || Math.floor(Date.now() / 1000),
          thumbnail: p.thumbnail && p.thumbnail.startsWith("http") ? p.thumbnail : null,
        };
      });

    if (posts.length === 0) {
      throw new RedditAPIError(
        "No Hot posts were returned for this subreddit.",
        "EMPTY_RESPONSE",
        200
      );
    }

    return posts;
  } catch (error: any) {
    if (error instanceof RedditAPIError) {
      throw error;
    }
    
    console.error("[Reddit Service] Error during fetch:", error);
    
    // If the API request failed but they didn't supply credentials, we could fallback to mock 
    // to give a perfect development experience, but let's check:
    // If they are on localhost and didn't supply credentials, falling back to mock upon failure 
    // makes it extremely robust. Let's do that only if not in production and not having keys.
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev && !hasOAuthCredentials) {
      console.warn("[Reddit Service] Network fetch failed in local dev. Falling back to Mock data.");
      return generateMockPosts(subreddit, limit);
    }
    
    throw new RedditAPIError(
      "Reddit is temporarily unavailable. Please try again.",
      "REDDIT_API_ERROR",
      500
    );
  }
}
