import { normalizeSubreddit, isValidSubredditName } from '../lib/validation';
import { fetchHotPosts, RedditAPIError } from '../lib/reddit';
import Sentiment from 'sentiment';

const sentimentAnalyzer = new Sentiment();

async function testReddit403IsNotMisclassifiedAsPrivate(): Promise<boolean> {
  const env = process.env as Record<string, string | undefined>;
  const originalFetch = globalThis.fetch;
  const originalNodeEnv = env.NODE_ENV;
  const originalMockMode = env.USE_MOCK_REDDIT;
  const originalClientId = env.REDDIT_CLIENT_ID;
  const originalClientSecret = env.REDDIT_CLIENT_SECRET;

  env.NODE_ENV = "production";
  env.USE_MOCK_REDDIT = "false";
  env.REDDIT_CLIENT_ID = "";
  env.REDDIT_CLIENT_SECRET = "";
  globalThis.fetch = async () => new Response(null, { status: 403 });

  try {
    await fetchHotPosts("technology");
    console.error("❌ A 403 response should not return posts.");
    return false;
  } catch (error) {
    const passed = error instanceof RedditAPIError
      && error.code === "ACCESS_DENIED"
      && error.status === 403;
    console.log(passed
      ? "✅ Reddit 403 is reported as ACCESS_DENIED, not PRIVATE_SUBREDDIT."
      : `❌ Unexpected Reddit 403 result: ${String(error)}`);
    return passed;
  } finally {
    globalThis.fetch = originalFetch;
    if (originalNodeEnv === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = originalNodeEnv;
    if (originalMockMode === undefined) delete env.USE_MOCK_REDDIT;
    else env.USE_MOCK_REDDIT = originalMockMode;
    if (originalClientId === undefined) delete env.REDDIT_CLIENT_ID;
    else env.REDDIT_CLIENT_ID = originalClientId;
    if (originalClientSecret === undefined) delete env.REDDIT_CLIENT_SECRET;
    else env.REDDIT_CLIENT_SECRET = originalClientSecret;
  }
}

async function runTests() {
  console.log("=== STARTING THE SUBREDDIT VIBE CHECK UNIT TESTS ===\n");

  // 1. Test Subreddit Normalization
  console.log("--- Testing Subreddit Normalization ---");
  const normTests = [
    { input: "technology", expected: "technology" },
    { input: "r/technology", expected: "technology" },
    { input: "  r/gaming/ ", expected: "gaming" },
    { input: "https://www.reddit.com/r/movies/", expected: "movies" },
    { input: "/r/AskReddit/", expected: "AskReddit" },
    { input: "Science/", expected: "Science" }
  ];

  let normPassed = 0;
  normTests.forEach((t, i) => {
    const result = normalizeSubreddit(t.input);
    if (result === t.expected) {
      console.log(`✅ Test #${i + 1} Passed: "${t.input}" -> "${result}"`);
      normPassed++;
    } else {
      console.log(`❌ Test #${i + 1} Failed: "${t.input}" -> expected "${t.expected}", got "${result}"`);
    }
  });

  // 2. Test Subreddit Name Validation
  console.log("\n--- Testing Subreddit Name Validation ---");
  const valTests = [
    { name: "technology", expected: true },
    { name: "gaming_new", expected: true },
    { name: "123movies", expected: true },
    { name: "a", expected: false }, // too short
    { name: "this_is_a_very_long_subreddit_name", expected: false }, // too long (>21)
    { name: "gaming-bad", expected: false }, // invalid char "-"
    { name: "movies!", expected: false } // invalid char "!"
  ];

  let valPassed = 0;
  valTests.forEach((t, i) => {
    const result = isValidSubredditName(t.name);
    if (result === t.expected) {
      console.log(`✅ Test #${i + 1} Passed: "${t.name}" -> ${result}`);
      valPassed++;
    } else {
      console.log(`❌ Test #${i + 1} Failed: "${t.name}" -> expected ${t.expected}, got ${result}`);
    }
  });

  // 3. Test Sentiment Analysis Library
  console.log("\n--- Testing Sentiment Library Outputs ---");
  const sentTests = [
    { text: "I absolutely love this new technology, it's incredible!", expectedLabel: "positive" },
    { text: "This movie is terrible and complete garbage, do not watch it.", expectedLabel: "negative" },
    { text: "The cat sat on the mat.", expectedLabel: "neutral" }
  ];

  let sentPassed = 0;
  sentTests.forEach((t, i) => {
    const result = sentimentAnalyzer.analyze(t.text);
    const score = result.score;
    const label = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
    
    if (label === t.expectedLabel) {
      console.log(`✅ Test #${i + 1} Passed: "${t.text}" -> score: ${score} (${label})`);
      sentPassed++;
    } else {
      console.log(`❌ Test #${i + 1} Failed: "${t.text}" -> expected "${t.expectedLabel}", got "${label}" (score: ${score})`);
    }
  });

  const apiTestPassed = await testReddit403IsNotMisclassifiedAsPrivate();
  console.log("\n=== TEST SUMMARY ===");
  console.log(`Normalization Tests: ${normPassed}/${normTests.length} Passed`);
  console.log(`Validation Tests:    ${valPassed}/${valTests.length} Passed`);
  console.log(`Sentiment Tests:     ${sentPassed}/${sentTests.length} Passed`);

  const allPassed = (normPassed === normTests.length) && (valPassed === valTests.length) && (sentPassed === sentTests.length) && apiTestPassed;
  if (allPassed) {
    console.log("\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨");
    process.exit(0);
  } else {
    console.log("\n⚠️ SOME TESTS FAILED. PLEASE CHECK OUTPUT. ⚠️");
    process.exit(1);
  }
}

runTests();
