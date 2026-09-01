# 🍿 PopChoice - AI-Powered Group Movie Recommendation

An intelligent movie recommendation engine that uses AI embeddings and semantic search to suggest movies based on group preferences. PopChoice gathers input from multiple people, combines their movie tastes, and uses vector similarity search and LLM reasoning to recommend the perfect movie for everyone.



## About The Project

PopChoice solves the age-old problem of choosing what movie to watch when you're with a group of people. Instead of endless debates, PopChoice:

- Collects individual preferences from each group member through an engaging questionnaire
- Uses AI embeddings to convert preferences into semantic representations
- Performs vector similarity search to find movies that match the group's combined taste
- Generates personalized recommendations with explanations from an LLM
- Provides alternative movie suggestions to explore

The application is perfect for movie nights, team building events, or any scenario where a group needs to find a movie everyone will enjoy.

### Built With

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router and API routes
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Supabase](https://supabase.com/)** - PostgreSQL database with vector support (pgvector extension)
- **[Google Gemini API](https://ai.google.dev/)** - LLM for generating recommendation reasons and vector embeddings for semantic search
- **[OpenRouter API](https://openrouter.ai/)** - Access to multiple LLM models

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**/ **pnpm**
- **Git** - [Download here](https://git-scm.com/)

You'll also need accounts for:

- **Supabase** (free tier available) - [Sign up here](https://supabase.com/)
- **Google Cloud** (for Gemini API, LLM and embeddings) - [Get started here](https://console.cloud.google.com/)
- **OpenRouter** (for alternative LLM) - [Sign up here](https://openrouter.ai/)
- **OpenAI** (for embeddings) - [Sign up here](https://openai.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yy933/PopChoice
   cd popchoice
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Supabase:**
   - Create a new Supabase project
   - Enable the `vector` extension by running this in the SQL Editor:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```
   - Create the movies table (run `setup.sql` in your Supabase SQL editor)
   - Get your project URL and anon key from Project Settings

4. **Configure environment variables:**
   Create a `.env.local` file in the root directory with the following variables:

   ```
   LLM_PROVIDER=your_llm_provider
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_gemini_api_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   INGEST_SECRET_KEY=your_ingest_secret_key
   NEXT_PUBLIC_SITE_URL=your_site_url
   NEXT_PUBLIC_SITE_NAME=your_site_name
   ```

5. **Ingest movie data:**
   - Run the data ingestion endpoint to populate the database with movies and their embeddings:
     ```bash
     curl -X POST http://localhost:3000/api/ingest \
       -H "Content-Type: application/json"
     ```

6. **Start the development server:**

   ```bash
   npm run dev
   ```

7. **Open in your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users

1. **Start the application** and enter the number of people in your group and how much time you have
2. **Answer questions** - Each person in the group answers questions about:
   - Their favorite movie and why they love it
   - Preference for new movies vs. classics
   - Current mood (fun, serious, inspiring, scary, etc.)
   - Which famous actor they'd like to be stranded with on an island
3. **Get a recommendation** - PopChoice analyzes all responses and recommends a perfect movie with a personalized explanation
4. **Explore alternatives** - Use the "Next Movie" button to see alternative recommendations
5. **Start over** - Click "Start Over" to begin a new recommendation session

### For Developers

**Key API Endpoints:**

- `POST /api/ingest` - Ingests movie data and generates embeddings
- `POST /api/recommend/group` - Generates movie recommendations for a group
  - Request body:
    ```json
    {
      "config": { "peopleCount": 2, "timeLimit": "2 hours" },
      "answers": [
        {
          "favoriteMovie": "The Matrix",
          "eraPreference": "New",
          "moodPreference": "Sci-Fi Action",
          "strandedActor": "Keanu Reeves"
        }
      ]
    }
    ```

**Project Structure:**

```
app/
  ├── page.tsx          # Main client component
  ├── layout.tsx        # Root layout
  └── api/
      ├── ingest/       # Data ingestion endpoint
      └── recommend/    # Recommendation endpoints

components/            # React components
lib/                   # Utility functions and API clients
types/                 # TypeScript type definitions
data/                  # Movie data and database setup
```

## Roadmap

- [ ] **Enhanced Movie Database** - Expand movie collection and metadata
- [ ] **Collaborative Filtering** - Learn from past recommendations to improve future ones
- [ ] **User Ratings** - Allow users to rate recommendations and refine preferences
- [ ] **Genre Filtering** - Add genre preferences to narrow down recommendations
- [ ] **Streaming Platform Integration** - Show where to watch recommended movies
- [ ] **Movie Trailers** - Display trailers for recommended movies
- [ ] **Multi-language Support** - Support for different languages
- [ ] **Mobile App** - Native iOS/Android applications
- [ ] **Advanced Analytics** - Track recommendation accuracy and user satisfaction
- [ ] **Social Features** - Share recommendations and create watchlists with friends

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Vercel** - For Next.js and deployment platform
- **Supabase** - For the incredible PostgreSQL database with vector support
- **Google** - For Gemini API
- **OpenRouter** - For easy access to multiple LLM models
- **Tailwind CSS** - For the utility-first CSS framework
