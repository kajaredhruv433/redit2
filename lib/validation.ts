/**
 * Normalizes a subreddit input string by trimming whitespace,
 * stripping leading URL paths or "r/", and removing trailing slashes.
 */
export function normalizeSubreddit(input: string): string {
  if (!input) return "";
  
  let normalized = input.trim();
  
  // Handle full URL inputs like https://www.reddit.com/r/technology/
  if (normalized.includes("reddit.com/r/")) {
    const parts = normalized.split("reddit.com/r/");
    if (parts[1]) {
      normalized = parts[1];
    }
  }
  
  // Remove leading /r/ or r/
  if (normalized.startsWith("/r/")) {
    normalized = normalized.substring(3);
  } else if (normalized.startsWith("r/")) {
    normalized = normalized.substring(2);
  }
  
  // Remove trailing slashes
  while (normalized.endsWith("/")) {
    normalized = normalized.substring(0, normalized.length - 1);
  }
  
  // Remove leading slashes if any
  while (normalized.startsWith("/")) {
    normalized = normalized.substring(1);
  }
  
  return normalized.trim();
}

/**
 * Validates a subreddit name according to Reddit's rules:
 * - 3 to 21 characters
 * - Only alphanumeric characters and underscores
 */
export function isValidSubredditName(name: string): boolean {
  if (!name) return false;
  const regex = /^[a-zA-Z0-9_]{3,21}$/;
  return regex.test(name);
}
