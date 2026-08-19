import { RedditPost } from '../types/reddit';

// Helper to generate realistic mock posts for popular subreddits to make UI testing rich
export function generateMockPosts(subreddit: string, limit: number = 50): RedditPost[] {
  const sub = subreddit.toLowerCase();
  const posts: RedditPost[] = [];
  
  // Custom templates based on subreddit name to make mock data feel authentic
  let templates: { title: string; scoreRange: [number, number]; commentRange: [number, number] }[] = [];
  
  if (sub.includes("tech") || sub.includes("prog") || sub.includes("sci")) {
    templates = [
      { title: "Open Source AI Model Outperforms Proprietary Competitors in New Benchmark", scoreRange: [4500, 15000], commentRange: [800, 2500] },
      { title: "We built a new compilation engine that is 10x faster than Rust's compiler - here is how we did it", scoreRange: [1200, 5000], commentRange: [300, 900] },
      { title: "Tech giant announces lay-offs of another 5,000 employees as it pivots to automated agents", scoreRange: [8000, 25000], commentRange: [1500, 4500] },
      { title: "Why JavaScript's new pipeline operator is going to completely change how you write clean code", scoreRange: [500, 2200], commentRange: [120, 600] },
      { title: "Researchers achieve room-temperature superconductivity breakthrough using new carbon lattice structure", scoreRange: [12000, 40000], commentRange: [2000, 6000] },
      { title: "European Union passes historic antitrust regulations targeting digital app stores", scoreRange: [3500, 11000], commentRange: [750, 2200] },
      { title: "This new framework is terrible and bloated. Why are we still doing this?", scoreRange: [1500, 4500], commentRange: [500, 1800] },
      { title: "Is anyone else feeling completely burned out by the constant churn of framework updates?", scoreRange: [2200, 6500], commentRange: [800, 2100] },
      { title: "Major security vulnerability discovered in open-source logging package, patch immediately", scoreRange: [9000, 18000], commentRange: [600, 1400] },
      { title: "I built a fully functional CPU inside a spreadsheet and it actually runs basic assembly programs", scoreRange: [5000, 15000], commentRange: [400, 1200] },
    ];
  } else if (sub.includes("game") || sub.includes("play") || sub.includes("nintendo") || sub.includes("xbox")) {
    templates = [
      { title: "The new open-world RPG has been delayed to late next year, developers cite polish issues", scoreRange: [8000, 22000], commentRange: [1500, 3900] },
      { title: "Next-gen console hardware details leaked: RDNA 4 graphics and custom 8-core CPU", scoreRange: [4500, 12000], commentRange: [900, 2800] },
      { title: "I finally beat the final boss on maximum difficulty without taking damage! [Video]", scoreRange: [1500, 4000], commentRange: [200, 750] },
      { title: "Microtransactions in modern gaming are getting completely out of hand, this is unacceptable", scoreRange: [12000, 35000], commentRange: [3000, 8500] },
      { title: "This indie game is an absolute masterpiece. Do not sleep on it!", scoreRange: [3000, 9500], commentRange: [450, 1200] },
      { title: "Unpopular opinion: The classic prequel is much better than the actual remake", scoreRange: [800, 3200], commentRange: [600, 1800] },
      { title: "Steam sets another concurrent user record with 38 million players online", scoreRange: [5500, 16000], commentRange: [500, 1500] },
      { title: "The developers just released a surprise update that fixes all the performance stuttering!", scoreRange: [4000, 11000], commentRange: [350, 900] },
      { title: "Why do modern game developers keep releasing broken PC ports? I am so tired of this.", scoreRange: [6500, 18000], commentRange: [1100, 3400] },
      { title: "A look back at the most influential multiplayer shooter of the last decade", scoreRange: [1800, 5200], commentRange: [250, 850] },
    ];
  } else if (sub.includes("movie") || sub.includes("cinema") || sub.includes("film") || sub.includes("actor")) {
    templates = [
      { title: "First official trailer released for the highly anticipated sci-fi sequel", scoreRange: [15000, 45000], commentRange: [2500, 7500] },
      { title: "Acclaimed director announces his retirement from filmmaking after one final project", scoreRange: [8500, 24000], commentRange: [1200, 3800] },
      { title: "This movie was absolute garbage. I want my two hours back. [Review]", scoreRange: [2500, 8000], commentRange: [900, 2400] },
      { title: "Outstanding performances from the main cast save an otherwise mediocre thriller", scoreRange: [1200, 4500], commentRange: [300, 950] },
      { title: "Why the cinematography in modern blockbusters feels so flat and uninspired", scoreRange: [4500, 14000], commentRange: [800, 2200] },
      { title: "The box office numbers are in, and the sequel has officially crossed $1 Billion worldwide", scoreRange: [10000, 28000], commentRange: [1400, 4100] },
      { title: "I can't believe they changed the ending from the book. It ruins the whole message.", scoreRange: [3000, 9000], commentRange: [850, 2500] },
      { title: "An amazing, heartwarming documentary that everyone needs to watch immediately", scoreRange: [2200, 6800], commentRange: [150, 550] },
      { title: "Does anyone else think the physical media resurgence is the best thing to happen to cinema?", scoreRange: [1500, 5000], commentRange: [400, 1300] },
      { title: "This is hands down the best horror movie of the year. Terrifying and brilliant.", scoreRange: [5000, 15000], commentRange: [700, 2000] },
    ];
  } else {
    // Default general templates (AskReddit / WorldNews mix)
    templates = [
      { title: "What is a small, insignificant thing that instantly ruins your day?", scoreRange: [15000, 65000], commentRange: [5000, 18000] },
      { title: "Scientists warn of unprecedented heatwaves in the northern hemisphere next summer", scoreRange: [20000, 50000], commentRange: [3500, 9500] },
      { title: "I did a good deed today and it backfired in the most bizarre way possible", scoreRange: [3000, 12000], commentRange: [450, 1900] },
      { title: "This is a friendly reminder to take a break, hydrate, and stretch your legs.", scoreRange: [1000, 4500], commentRange: [100, 400] },
      { title: "New government policy sparks major protests across multiple cities", scoreRange: [12000, 32000], commentRange: [2500, 7800] },
      { title: "What is the absolute best piece of advice you have ever received?", scoreRange: [8000, 28000], commentRange: [2200, 9000] },
      { title: "A beautiful photo of the morning fog rolling over the valley this morning [OC]", scoreRange: [5000, 18000], commentRange: [150, 600] },
      { title: "This company's new customer service policy is a total disaster. Avoid at all costs.", scoreRange: [4000, 13000], commentRange: [1100, 3100] },
      { title: "I am absolutely thrilled to announce that I finally got my dream job today!", scoreRange: [6000, 20000], commentRange: [300, 1100] },
      { title: "Is anyone else feeling completely overwhelmed by the state of the world right now?", scoreRange: [7500, 21000], commentRange: [1800, 4900] },
    ];
  }

  const authors = [
    "user_one", "gaming_fanatic", "tech_enthusiast", "movie_buff",
    "curious_mind", "pixel_perfect", "code_ninja", "science_rules",
    "wanderlust", "coffee_lover", "night_owl", "early_bird"
  ];

  for (let i = 1; i <= limit; i++) {
    const template = templates[(i - 1) % templates.length];
    
    // Introduce slight variations to the title so they aren't identical on repeats
    let title = template.title;
    if (i > templates.length) {
      const suffixes = ["!", "...", " - What do you think?", " (Discussion)", " [Update]", " and it's amazing.", " and it's terrible."];
      title += suffixes[(i - 1) % suffixes.length];
    }
    
    const score = Math.floor(Math.random() * (template.scoreRange[1] - template.scoreRange[0]) + template.scoreRange[0]);
    const numComments = Math.floor(Math.random() * (template.commentRange[1] - template.commentRange[0]) + template.commentRange[0]);
    const author = authors[Math.floor(Math.random() * authors.length)];
    const createdUtc = Math.floor(Date.now() / 1000) - (i * 3600 * 2); // staged hours back

    posts.push({
      id: `mock${i}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      author,
      subreddit,
      score,
      numComments,
      url: `https://www.reddit.com/r/${subreddit}/comments/mock_post_${i}`,
      permalink: `/r/${subreddit}/comments/mock_post_${i}/mock_title/`,
      createdUtc,
      thumbnail: null
    });
  }

  return posts;
}
