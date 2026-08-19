import { normalizeSubreddit, isValidSubredditName } from '../lib/validation';
import Sentiment from 'sentiment';

const sentimentAnalyzer = new Sentiment();

function runTests() {
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

  console.log("\n=== TEST SUMMARY ===");
  console.log(`Normalization Tests: ${normPassed}/${normTests.length} Passed`);
  console.log(`Validation Tests:    ${valPassed}/${valTests.length} Passed`);
  console.log(`Sentiment Tests:     ${sentPassed}/${sentTests.length} Passed`);

  const allPassed = (normPassed === normTests.length) && (valPassed === valTests.length) && (sentPassed === sentTests.length);
  if (allPassed) {
    console.log("\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨");
    process.exit(0);
  } else {
    console.log("\n⚠️ SOME TESTS FAILED. PLEASE CHECK OUTPUT. ⚠️");
    process.exit(1);
  }
}

runTests();
