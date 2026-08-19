# The Subreddit Vibe Check

Discover the mood behind Reddit's hottest conversations. **The Subreddit Vibe Check** is a polished, production-quality full-stack web application built for a Full Stack Developer Internship take-home assignment. It fetches the top 50 Hot posts from any public subreddit and performs client-side sentiment analysis on their titles to determine the subreddit's current "vibe".

---

## 🚀 Live Demo & Deployment

The application is optimized for direct deployment to **Vercel** or any standard Next.js hosting provider. 

---

## 📖 Table of Contents
1. [Features](#-features)
2. [Architecture](#-architecture)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Setup & Installation](#-setup--installation)
6. [Environment Variables](#-environment-variables)
7. [API Endpoint Contract](#-api-endpoint-contract)
8. [Sentiment Method & Vibe Formulas](#-sentiment-method--vibe-formulas)
9. [Security Measures](#-security-measures)
10. [Testing](#-testing)

---

## ✨ Features

- **Dynamic Search**: Accept standard input (e.g. `technology`) or Reddit-style inputs (e.g. `r/gaming`, `https://www.reddit.com/r/movies/`). Normalization happens automatically.
- **Suggested Subreddits**: Quick-select tags representing popular communities (Technology, Gaming, Movies, AskReddit, Science, WorldNews, Programming) to view analysis in one click.
- **Client-Side Sentiment Analysis**: Sentiment scoring and categorizations are computed on the client side in the browser, keeping calculations lightweight and avoiding costly server AI API integrations.
- **Overall Vibe Classification**: Computes a total vibe score and translates it into descriptive vibes (*Very Positive, Positive, Neutral, Negative, Very Negative*).
- **Interactive Visualizations**: 
  - **Donut Chart**: Displays the proportion of positive, neutral, and negative posts.
  - **Rank Bar Chart**: Visualizes individual post sentiment scores ordered from Hottest rank #1 down to #50.
- **Advanced Filtering & Sorting**: Filter posts by sentiment category (*All, Positive, Neutral, Negative*) and sort them by rank, upvote score, comment counts, or sentiment score.
- **Robust Error Handling**: Distinct visual layouts for invalid subreddits, private subreddits, Reddit API rate limits, empty listings, and server errors.
- **Responsive Layout**: Designed with slate-colored dark themes, subtle gradient details, and accessible layouts that adapt smoothly to desktop, tablet, and mobile viewports.

---

## 🏗️ Architecture

The application adheres to a strict separation of concerns, ensuring data handling remains server-side while the interactive NLP processing and UI rendering take place on the client side.

```
┌──────────────────────────────────────────────────────────────┐
│                        Web Browser                           │
│                                                              │
│  [ r/technology ] [Submit]                                    │
│        │                                                     │
│        ▼ GET /api/subreddit/technology/hot?limit=50          │
└────────┼─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                   Next.js Backend Server                     │
│                                                              │
│  1. Check in-memory route cache (TTL: 60s)                   │
│  2. If cache miss, authenticate with Reddit (OAuth Client)   │
│  3. Fetch 50 Hot posts from Reddit API (or public fallback)  │
│  4. Normalize raw Reddit structure into client-safe JSON     │
│        │                                                     │
│        ▼ returns normalized RedditPost[]                     │
└────────┼─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                        Web Browser                           │
│                                                              │
│  1. Receives normalized posts JSON                           │
│  2. Runs sentiment analyzer client-side on post titles       │
│  3. Renders Dashboard (Vibe, distribution charts, posts)    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/) (dynamically imported with SSR disabled to prevent hydration issues)
- **NLP Library**: [sentiment](https://www.npmjs.com/package/sentiment) (AFINN-165 based tokenizing sentiment analyzer)

---

## 📂 Project Structure

```text
reddit/
├── app/
│   ├── api/
│   │   └── subreddit/
│   │       └── [name]/
│   │           └── hot/
│   │               └── route.ts        # Next.js API Route Handler
│   ├── globals.css                     # Custom styles, transitions, scrollbars
│   ├── layout.tsx                      # RootLayout (Fonts & metadata configuration)
│   └── page.tsx                        # Main client dashboard coordinator
├── components/
│   ├── Header.tsx                      # Branding Navigation
│   ├── SubredditSearch.tsx             # Text input form & validation
│   ├── SuggestedSubreddits.tsx         # Clickable subreddit tags
│   ├── VibeOverview.tsx                # Vibe classification & emoji display
│   ├── SentimentSummary.tsx            # Numerical stats summary cards
│   ├── SentimentChart.tsx              # Dynamic wrapper for Recharts
│   ├── SentimentChartImpl.tsx          # Recharts implementation
│   ├── PostList.tsx                    # Controls filtering & sorting states
│   ├── PostCard.tsx                    # Individual post representation
│   ├── FilterTabs.tsx                  # Buttons for filtering and sorting
│   ├── LoadingState.tsx                # Pulsating dashboard skeletons
│   ├── ErrorState.tsx                  # Accessible error layout mapper
│   └── EmptyState.tsx                  # Fallback when list has no records
├── lib/
│   ├── reddit-auth.ts                  # Server-side Reddit token caching
│   ├── reddit-mock.ts                  # Isolated Mock Adapter generator
│   ├── reddit.ts                       # Main Reddit API client service
│   ├── sentiment.ts                    # Client sentiment wrapper & math formulas
│   └── validation.ts                   # Input normalizer & validation filters
├── types/
│   ├── reddit.ts                       # Post types interfaces
│   └── sentiment.ts                    # Sentiment labels & sort interfaces
├── scratch/
│   └── test-core.ts                    # Local automated test script
├── .env.example                        # Template for environment variables
├── .gitignore                          # Standard git ignore definitions
├── package.json                        # Scripts & dependencies
└── tsconfig.json                       # TS configuration
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd reddit
npm install
```

### 2. Configure Environment Variables
Copy the template structure to create a local config file:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

The application can run in three different configurations depending on environment settings:

1. **Production (OAuth client)**: Configure `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`. The backend automatically requests, caches, and renews access tokens using the Client Credentials Flow.
2. **Public JSON Fallback**: If no credentials are configured, the app fetches public listings directly from `reddit.com/r/{subreddit}/hot.json` utilizing the defined `REDDIT_USER_AGENT` to bypass rate limit blocks.
3. **Mock Mode (Testing)**: Set `USE_MOCK_REDDIT=true`. The server will instantly return realistic, context-specific mock posts for design evaluation without making external network requests.

```env
# Reddit OAuth App Credentials (Generate at https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret

# Custom User Agent (Required to prevent Reddit API rate limit blocks)
REDDIT_USER_AGENT=web:subreddit-vibe-check:v1.0.0 (by /u/your_reddit_username)

# Optional: Hardcoded Token (Bypasses oauth token request)
REDDIT_ACCESS_TOKEN=

# Force Mock Adapter (true/false)
USE_MOCK_REDDIT=false
```

---

## 📡 API Endpoint Contract

The backend exposes a single normalized endpoint.

### Request
```text
GET /api/subreddit/{subreddit-name}/hot?limit=50
```

### Constraints
- Input `{subreddit-name}` is sanitized.
- Query parameter `limit` is clamped: `1 <= limit <= 50`.

### Success Response (`200 OK`)
```json
{
  "subreddit": "technology",
  "count": 50,
  "posts": [
    {
      "id": "abc123",
      "title": "Open Source AI Model Outperforms Competitors",
      "author": "username",
      "subreddit": "technology",
      "score": 1234,
      "numComments": 321,
      "url": "https://www.reddit.com/r/.../comments/...",
      "permalink": "/r/technology/comments/.../title/",
      "createdUtc": 1700000000,
      "thumbnail": null
    }
  ]
}
```

### Error Responses
- **Invalid Name (`400 Bad Request`)**:
  ```json
  { "error": "We couldn't find that subreddit. Check the name and try again.", "code": "INVALID_SUBREDDIT" }
  ```
- **Private Subreddit (`403 Forbidden`)**:
  ```json
  { "error": "This subreddit cannot be accessed. Try a public subreddit.", "code": "PRIVATE_SUBREDDIT" }
  ```
- **Not Found (`404 Not Found`)**:
  ```json
  { "error": "We couldn't find that subreddit. Check the name and try again.", "code": "NOT_FOUND" }
  ```
- **Rate Limited (`429 Too Many Requests`)**:
  ```json
  { "error": "Reddit API rate limit reached. Please wait a moment before trying again.", "code": "RATE_LIMITED" }
  ```

---

## 📊 Sentiment Method & Vibe Formulas

All sentiment analysis occurs **exclusively in the browser** on the retrieved titles list.

### Title Sentiment
Each title string is parsed using `sentiment` which tokenizes the text and scores words based on the AFINN-165 lexicon:
- **Positive**: Score $> 0$
- **Neutral**: Score $= 0$
- **Negative**: Score $< 0$

### Vibe Score
The overall subreddit vibe score is calculated by finding the net difference between positive and negative sentiments, relative to the total analyzed posts:

$$\text{Vibe Score} = \frac{\text{Positive Count} - \text{Negative Count}}{\text{Total Posts}}$$

The resulting score (ranging from $-1.0$ to $+1.0$) is classified into a human-readable vibe:
- $\ge 0.25 \longrightarrow$ **Very Positive** 😊
- $\ge 0.05 \longrightarrow$ **Positive** 🙂
- $> -0.05 \longrightarrow$ **Neutral** 😐
- $> -0.25 \longrightarrow$ **Negative** 🙁
- Otherwise $\longrightarrow$ **Very Negative** 😡

---

## 🔒 Security Measures

- **No Public Credentials**: All configuration keys (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, etc.) are read strictly in Server-Side code.
- **Next.js Safety**: No variables are prefixed with `NEXT_PUBLIC_`, ensuring they are never compiled into the client-side JavaScript bundles.
- **Git Ignore**: `.env` and `.env.local` files are explicitly excluded via `.gitignore` to prevent leaks on source repositories.
- **Credential Isolation**: Client queries only the backend `/api/subreddit/...` endpoint, meaning raw Reddit API credentials and OAuth tokens are never exposed in browser network inspection logs.

---

## 🧪 Testing

The codebase includes an automated unit test suite verifying subreddit normalization, validation constraints, and sentiment scoring behavior.

### Run Tests
```bash
npm run test
```

### Test Assertions
- Normalizes variations (`r/technology`, `  r/gaming/ `, `https://reddit.com/r/movies`) down to clean keys (`technology`, `gaming`, `movies`).
- Rejects invalid names (names too short, names $>21$ chars, invalid punctuation characters).
- Asserts core sentiment scores ("I absolutely love this!" -> `positive`, "This is terrible." -> `negative`).
