# Alpha Signal — AI Investment Research Agent

> Built for the InsideIIM × Altuni AI Labs take-home assignment.

## Overview

**Alpha Signal** is a Next.js AI agent that takes any company name, conducts multi-dimensional investment research using GPT-4o-mini via LangChain.js, and returns a decisive **INVEST / HOLD / PASS** verdict with full reasoning.

**What it researches:**
- Business model & revenue streams
- Financial health & balance sheet
- Competitive moat & positioning
- Growth trajectory & catalysts
- Management quality & governance
- Valuation vs. peers
- Macro & market context

**What it returns:**
- Clear verdict: INVEST / HOLD / PASS
- Confidence score (0–100%)
- Section-by-section scores (0–10)
- Key risks & upside catalysts
- Full investment thesis
- Price estimates where applicable

---

## How to Run

### Prerequisites
- Node.js 18+
- An OpenAI API key (GPT-4o-mini)

### Setup

```bash
# 1. Clone / unzip
cd investment-agent

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY=sk-...

# 4. Run
npm run dev
# Open http://localhost:3000
```

You can also paste your API key directly in the UI — no `.env` needed.

### Deploy to Vercel

```bash
npm i -g vercel
vercel
# Set OPENAI_API_KEY in Vercel dashboard → Settings → Environment Variables
```

---

## How It Works — Architecture

```
User types company name
        ↓
Next.js Frontend (React)
        ↓ POST /api/research
Next.js API Route
        ↓
LangChain.js ChatOpenAI (GPT-4o-mini)
  - System prompt: elite hedge fund analyst persona
  - User prompt: multi-dimensional research request
  - Output: structured JSON with 7 analysis sections + verdict
        ↓
Parsed & validated JSON
        ↓
React UI renders:
  - Verdict badge (INVEST/HOLD/PASS)
  - Collapsible section cards with scores
  - Risk/catalyst panels
  - Full investment thesis
```

**AI Pattern Used:** Single-shot structured output via a carefully engineered system prompt that forces GPT-4o-mini to return a specific JSON schema. This is simpler than an agentic loop for this use case — it's fast, deterministic, and produces high-quality output in one call.

**LangChain.js Usage:** `ChatOpenAI` from `@langchain/openai` with `HumanMessage` / `SystemMessage` from `@langchain/core`. The LangChain layer provides a clean abstraction for swapping LLM providers and future tool integration (e.g., adding real-time web search via Tavily).

---

## Key Decisions & Trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| GPT-4o-mini (not GPT-4o) | Cost-efficient, still excellent for structured analysis | Slightly less nuanced than GPT-4 on edge cases |
| Single-shot vs. agentic loop | Faster UX, more reliable JSON output | Can't do real web search / live prices |
| JSON schema in system prompt | Consistent, parseable output | Rigid — model must follow exactly |
| Next.js App Router | Modern, colocated API + UI | Slightly more complex than Pages router |
| No vector DB / RAG | Simpler, no data infra needed | Relies on LLM's training knowledge |

**What I left out:**
- Real-time market data (Yahoo Finance / NSE API) — would require paid APIs
- Web search tool (Tavily) — adds latency, increases cost
- Historical report storage / portfolio tracking
- User authentication
- Streaming responses (SSE) — would improve perceived speed

---

## Example Runs

### Apple (AAPL) → INVEST (87% confidence)
> "Apple's ecosystem lock-in, $165B cash reserve, and expanding services revenue justify a premium. Services margin at ~72% vs hardware ~36% is shifting the mix favorably. Risk: China revenue (~19% of total) and Vision Pro adoption pace."

### Paytm → PASS (78% confidence)
> "Regulatory headwinds from RBI action on Paytm Payments Bank, combined with persistent losses and intensifying UPI competition from PhonePe and Google Pay, make this a speculative bet at current valuations."

### Reliance Industries → HOLD (65% confidence)
> "Strong energy + telecom + retail conglomerate with robust cash flows, but Jio Financial's path to profitability and retail margin pressure warrant monitoring before adding."

---

## What I Would Improve With More Time

1. **Real-time data integration** — Connect Yahoo Finance / NSE APIs for live price, P/E, revenue growth pulled into the prompt as context
2. **Web search tool** — Add Tavily search as a LangChain tool so the agent reads actual news and filings
3. **Agentic loop** — Use LangGraph to orchestrate: `search → extract → analyze → decide` as distinct graph nodes
4. **Streaming** — Stream the AI response token-by-token for a better UX (Next.js SSE + LangChain streaming)
5. **Report history** — Save past reports in a DB (Postgres / Supabase) for portfolio tracking
6. **Comparison mode** — Compare two companies head-to-head
7. **Indian market focus** — NSE/BSE data, SEBI filings, promoter holding alerts

---

## Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **AI:** LangChain.js (`@langchain/openai`, `@langchain/core`) + OpenAI GPT-4o-mini
- **Deployment:** Vercel-ready
