import { NextResponse } from 'next/server';
import { fetchHotPosts, RedditAPIError } from '@/lib/reddit';

interface CacheEntry {
  data: {
    subreddit: string;
    count: number;
    posts: any[];
  };
  timestamp: number;
}

// In-memory cache for API results
const routeCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 1000; // Cache for 60 seconds

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    
    if (!name) {
      return NextResponse.json(
        { error: "Subreddit name is required", code: "INVALID_SUBREDDIT" },
        { status: 400 }
      );
    }

    // Extract and validate limit query parameter (default 50)
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    let limit = 50;

    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit)) {
        // Enforce 1 <= limit <= 50
        limit = Math.min(50, Math.max(1, parsedLimit));
      }
    }

    const normalizedName = name.toLowerCase().trim();
    const cacheKey = `${normalizedName}:${limit}`;
    const now = Date.now();

    // Check Cache
    if (routeCache[cacheKey] && now - routeCache[cacheKey].timestamp < CACHE_TTL_MS) {
      console.log(`[API Route] Cache hit for ${cacheKey}`);
      return NextResponse.json(routeCache[cacheKey].data);
    }

    // Fetch posts
    console.log(`[API Route] Fetching posts for r/${normalizedName} (limit: ${limit})`);
    const posts = await fetchHotPosts(normalizedName, limit);

    const responseBody = {
      subreddit: normalizedName,
      count: posts.length,
      posts
    };

    // Store in Cache
    routeCache[cacheKey] = {
      data: responseBody,
      timestamp: now
    };

    return NextResponse.json(responseBody);
  } catch (error: any) {
    console.error(`[API Route] Error fetching subreddit posts:`, error);

    if (error instanceof RedditAPIError) {
      // Map specialized API errors
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 500 }
      );
    }

    // Fallback for general server errors
    return NextResponse.json(
      { error: "Unable to fetch subreddit posts", code: "REDDIT_API_ERROR" },
      { status: 500 }
    );
  }
}
