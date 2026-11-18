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

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

/**
 * Reddit's public JSON endpoint can return a generic `reason: private` payload
 * for communities that are still readable on the website. In that case, extract
 * the public post data from Reddit's server-rendered listing instead.
 */
async function fetchPublicHtmlPosts(
  subreddit: string,
  limit: number,
  userAgent: string
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/hot/?limit=${limit}`;
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent, "Accept": "text/html" },
    cache: "no-store",
  });
  if (!response.ok || response.redirected) return [];

  const html = await response.text();
  const posts: RedditPost[] = [];
  const postTags = html.matchAll(/<shreddit-post\b([^>]*)>/gi);
  const readAttribute = (attributes: string, name: string) => {
    const escapedName = name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
    const match = attributes.match(new RegExp(`(?:^|\\\\s)${escapedName}=["']([^"']*)["']`, "i"));
    return match ? decodeHtml(match[1]) : "";
  };

  for (const tag of postTags) {
    const attributes = tag[1];
    const title = readAttribute(attributes, "post-title");
    const rawId = readAttribute(attributes, "id");
    const id = rawId.replace(/^t3_/, "");
    if (!title || !id) continue;

    const permalink = readAttribute(attributes, "permalink") || `/r/${subreddit}/comments/${id}/`;
    const timestamp = Date.parse(readAttribute(attributes, "created-timestamp"));
    const score = Number(readAttribute(attributes, "score")) || 0;
    const numComments = Number(readAttribute(attributes, "comment-count")) || 0;
    const postUrl = readAttribute(attributes, "content-href") || `https://www.reddit.com${permalink}`;

    posts.push({
      id,
      title,
      author: readAttribute(attributes, "author") || null,
      subreddit: readAttribute(attributes, "subreddit") || subreddit,
      score,
      numComments,
      url: postUrl,
      permalink,
      createdUtc: Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : Math.floor(Date.now() / 1000),
      thumbnail: null,
    });
    if (posts.length >= limit) break;
  }

  return posts;
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
  // A directly supplied access token is also a valid authenticated configuration.
  const hasOAuthCredentials = Boolean(
    process.env.REDDIT_ACCESS_TOKEN ||
    (clientId && clientSecret && clientId !== "your_client_id" && clientSecret !== "your_client_secret")
  );

  const userAgent = process.env.REDDIT_USER_AGENT || "web:subreddit-vibe-check:v1.0.0 (by /u/reddit-vibe-check-dev)";

  // Fetch the public subreddit page first; ordinary post browsing should not
  // depend on Reddit API credentials or JSON API availability.
  try {
    const htmlPosts = await fetchPublicHtmlPosts(subreddit, limit, userAgent);
    if (htmlPosts.length > 0) return htmlPosts;
  } catch (htmlError) {
    console.warn("[Reddit Service] Public listing fetch failed; trying the JSON fallback:", htmlError);
  }

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

    // OAuth credentials can be configured but rejected or unable to read a public
    // community. Retry through Reddit's public endpoint before treating the request
    // as inaccessible; this avoids misreporting an API-auth problem as a private sub.
    if (useAuthenticatedFlow && (response.status === 401 || response.status === 403)) {
      console.warn("[Reddit Service] OAuth request was denied; retrying through the public endpoint.");
      const publicUrl = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      response = await fetch(publicUrl, {
        headers: { "User-Agent": userAgent },
        cache: "no-store",
      });
      useAuthenticatedFlow = false;
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
        if (process.env.NODE_ENV !== "production" && !hasOAuthCredentials && response.status === 403) {
          console.warn("[Reddit Service] Received 403 Forbidden for unauthenticated request. Falling back to Mock data.");
          return generateMockPosts(subreddit, limit);
        }

        // A forbidden response does not by itself mean the subreddit is private; Reddit
        // can also deny API calls because of access restrictions or invalid credentials.
        const responseBody = await response.text().catch(() => "");
        let errorPayload: any = null;
        try {
          errorPayload = JSON.parse(responseBody);
        } catch {
          // Reddit may return an HTML block page; its prose is not proof that a
          // subreddit itself is private.
        }
        const isPrivateSubreddit =
          typeof errorPayload?.reason === "string" && errorPayload.reason.toLowerCase() === "private";
        if (response.status === 403 && isPrivateSubreddit) {
          throw new RedditAPIError(
            "This subreddit cannot be accessed. Try a public subreddit.",
            "PRIVATE_SUBREDDIT",
            403
          );
        }
        throw new RedditAPIError(
          "Reddit denied the API request. Check the Reddit API configuration and try again.",
          "REDDIT_API_ERROR",
          response.status
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

    let data = await response.json();

    // Some Reddit OAuth responses return a 200 response with a `private` reason
    // even when the community is publicly readable. Retry through the public
    // listing endpoint before presenting a private-community error to the user.
    if (
      useAuthenticatedFlow &&
      (!data?.data?.children) &&
      typeof data?.reason === "string" &&
      data.reason.toLowerCase() === "private"
    ) {
      const publicUrl = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      const publicResponse = await fetch(publicUrl, {
        headers: { "User-Agent": userAgent },
        cache: "no-store",
      });

      if (publicResponse.ok && !publicResponse.redirected) {
        response = publicResponse;
        useAuthenticatedFlow = false;
        data = await publicResponse.json();
      } else if (publicResponse.status === 404) {
        throw new RedditAPIError(
          "We couldn't find that subreddit. Check the name and try again.",
          "NOT_FOUND",
          404
        );
      } else if (!publicResponse.ok) {
        throw new RedditAPIError(
          "Reddit denied the API request. Check the Reddit API configuration and try again.",
          "REDDIT_API_ERROR",
          publicResponse.status
        );
      }
    }
    
    // Validate response structure
    if (!data || !data.data || !data.data.children) {
      // Development often receives Reddit's generic private-shaped response when
      // the public API is blocked. Keep the dashboard usable without credentials;
      // in production, preserve the explicit private-community error.
      if (
        process.env.NODE_ENV !== "production" &&
        !hasOAuthCredentials &&
        data &&
        typeof data.reason === "string" &&
        data.reason.toLowerCase() === "private"
      ) {
        console.warn("[Reddit Service] Private-shaped public API response in development. Falling back to Mock data.");
        return generateMockPosts(subreddit, limit);
      }

      // If Reddit explicitly marks the public listing as private, show that status.
      if (data && typeof data.reason === "string" && data.reason.toLowerCase() === "private") {
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
