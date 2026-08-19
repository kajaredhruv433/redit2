interface TokenCache {
  accessToken: string;
  expiresAt: number; // timestamp in ms
}

// Global cache variable that persists across API calls in the same Node process
let tokenCache: TokenCache | null = null;

/**
 * Gets a valid Reddit OAuth Access Token.
 * If a token exists in cache and is not expired, returns it.
 * Otherwise, requests a new one using Client Credentials flow.
 */
export async function getRedditAccessToken(): Promise<string> {
  // If access token is directly provided via environment variables, use it.
  if (process.env.REDDIT_ACCESS_TOKEN) {
    return process.env.REDDIT_ACCESS_TOKEN;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT || "web:subreddit-vibe-check:v1.0.0 (by /u/reddit-vibe-check-dev)";

  // Check if we have credentials
  if (!clientId || !clientSecret || clientId === "your_client_id" || clientSecret === "your_client_secret") {
    throw new Error("Reddit API credentials not configured. Please check REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in environment variables.");
  }

  // Check cache (with a 60-second buffer before actual expiry)
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.accessToken;
  }

  // Request new token
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  
  try {
    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": userAgent,
      },
      body: "grant_type=client_credentials",
      // Prevent caching this token request
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reddit Auth API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Reddit Auth API error: ${data.error_description || data.error}`);
    }

    if (!data.access_token) {
      throw new Error("Reddit Auth API did not return an access token.");
    }

    // Cache the token
    const expiresInMs = (data.expires_in || 3600) * 1000;
    tokenCache = {
      accessToken: data.access_token,
      expiresAt: now + expiresInMs,
    };

    console.log(`[Reddit Auth] Successfully retrieved new access token. Expires in ${data.expires_in} seconds.`);
    return tokenCache.accessToken;
  } catch (error: any) {
    console.error("[Reddit Auth] Error retrieving Reddit access token:", error);
    throw new Error(`Reddit authentication failed: ${error.message}`);
  }
}
