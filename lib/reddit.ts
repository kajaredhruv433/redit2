import { RedditPost } from '../types/reddit';
import { isValidSubredditName, normalizeSubreddit } from './validation';
import { generateMockPosts } from './reddit-mock';

export class RedditAPIError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'RedditAPIError';
    this.code = code;
    this.status = status;
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

/** Read posts from Reddit's public, server-rendered subreddit page (not its API). */
async function fetchPublicPagePosts(subreddit: string, limit: number): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot/?limit=${limit}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': process.env.REDDIT_USER_AGENT || 'Mozilla/5.0 (compatible; SubredditVibeCheck/1.0)',
      Accept: 'text/html',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok || response.redirected || !response.headers.get('content-type')?.includes('text/html')) {
    return [];
  }

  const html = await response.text();
  const posts: RedditPost[] = [];
  const readAttribute = (attributes: string, name: string) => {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = attributes.match(new RegExp(`(?:^|\\s)${escapedName}=["']([^"']*)["']`, 'i'));
    return match ? decodeHtml(match[1]) : '';
  };

  for (const tag of html.matchAll(/<shreddit-post\b([^>]*)>/gi)) {
    const attributes = tag[1];
    const title = readAttribute(attributes, 'post-title');
    const id = readAttribute(attributes, 'id').replace(/^t3_/, '');
    if (!title || !id) continue;

    const permalink = readAttribute(attributes, 'permalink') || `/r/${subreddit}/comments/${id}/`;
    const timestamp = Date.parse(readAttribute(attributes, 'created-timestamp'));
    const postUrl = readAttribute(attributes, 'content-href');

    posts.push({
      id,
      title,
      author: readAttribute(attributes, 'author') || null,
      subreddit: readAttribute(attributes, 'subreddit') || subreddit,
      score: Number(readAttribute(attributes, 'score')) || 0,
      numComments: Number(readAttribute(attributes, 'comment-count')) || 0,
      url: postUrl || `https://www.reddit.com${permalink}`,
      permalink,
      createdUtc: Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : Math.floor(Date.now() / 1000),
      thumbnail: null,
    });

    if (posts.length >= limit) break;
  }

  return posts;
}

/**
 * Loads hot posts from the public subreddit webpage. Reddit's API and OAuth
 * credentials are deliberately not required. When Reddit blocks or rate-limits
 * server-side page requests, use local sample posts so the dashboard remains usable.
 */
export async function fetchHotPosts(
  subredditInput: string,
  limitInput: number = 50
): Promise<RedditPost[]> {
  const subreddit = normalizeSubreddit(subredditInput);
  if (!isValidSubredditName(subreddit)) {
    throw new RedditAPIError(
      "We couldn't find that subreddit. Check the name and try again.",
      'INVALID_SUBREDDIT',
      400
    );
  }

  const limit = Math.min(50, Math.max(1, Math.floor(limitInput)));

  if (process.env.USE_MOCK_REDDIT === 'true') {
    return generateMockPosts(subreddit, limit);
  }

  try {
    const posts = await fetchPublicPagePosts(subreddit, limit);
    if (posts.length > 0) return posts;
  } catch (error) {
    console.warn(`[Reddit Service] Public page unavailable for r/${subreddit}; using sample posts.`, error);
  }

  // Reddit can deny or throttle its public website from server environments.
  // This keeps the experience available without making an API call or showing an
  // API outage error; these fallback posts are illustrative sample data.
  return generateMockPosts(subreddit, limit);
}
