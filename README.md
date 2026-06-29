# Alpha Signal – AI Multi-Agent Investment Research System

> An AI-powered investment research platform built with **Next.js**, **LangGraph**, **LangChain**, and multiple LLM providers to generate comprehensive investment reports through collaborative AI agents.

---

# Overview

**Alpha Signal** is an AI-powered investment research engine that performs end-to-end company analysis using a **multi-agent architecture**.

Instead of relying on a single prompt, the system divides the research process into specialized AI agents that work independently and then combine their outputs into a unified investment report.

The system is designed to be:

* Modular
* Fault tolerant
* Provider independent
* Easily extendable with external financial APIs

The architecture supports multiple LLM providers including:

* OpenRouter

Future versions can integrate live financial APIs, SEC filings, Yahoo Finance, Alpha Vantage, Finnhub, News APIs, and other market intelligence sources.

---

# Features

## Multi-Agent Research Pipeline

The project uses independent AI agents for different research tasks.

Current agents include:

* Company Validation Agent
* Company Research Agent
* Financial Analysis Agent
* News Analysis Agent
* Market Sentiment Agent
* SWOT Analysis Agent
* Risk Assessment Agent
* Investment Decision Agent
* Final Report Generation Agent

Each agent is responsible for one research domain and returns structured JSON.

---

## Intelligent Report Generation

The system automatically combines outputs from all agents into a single investment report containing:

* Company profile
* Business overview
* Financial health
* SWOT analysis
* News analysis
* Market sentiment
* Risk assessment
* Investment recommendation
* Confidence score
* Overall investment thesis

---

## Fault Tolerant Architecture

Unlike traditional pipelines, Alpha Signal continues working even if one or more agents fail.

Examples:

* News API unavailable
* LLM timeout
* Financial API error

Instead of failing completely, the report is generated using all available information while clearly marking missing sections.

---

## Modular LLM Layer

Changing AI providers requires minimal code changes.

Supported providers include:

* OpenRouter


Future providers:

* OpenAI
* Claude
* DeepSeek
* Mistral
* Llama

---

## Designed for External API Integration

The architecture is prepared to merge AI reasoning with real-world data from APIs.

Examples:

* Alpha Vantage
* Finnhub
* TwelveData
* NewsAPI
* Yahoo Finance
* SEC EDGAR
* Polygon
* Financial Modeling Prep

The report generation layer merges:

```
LLM Knowledge
        +
External APIs
        +
Agent Reasoning
        =
Final Investment Report
```

---

# Technology Stack

## Frontend

* Next.js 14
* React
* TypeScript
* Tailwind CSS
* Recharts

## Backend

* Next.js API Routes

## AI Framework

* LangGraph
* LangChain.js

## LLM Providers

* OpenRouter


## Deployment

* Vercel

---

# Project Structure

```
investment-agent/

│
├── src/
│
├── agents/
│   ├── companyAgent
│   ├── researchAgent
│   ├── financialAgent
│   ├── newsAgent
│   ├── sentimentAgent
│   ├── swotAgent
│   ├── riskAgent
│   ├── investmentAgent
│   └── reportAgent
│
├── app/
│   ├── api/
│   ├── page.tsx
│   └── layout.tsx
│
├── graph/
│   ├── graph.ts
│   └── state.ts
│
├── services/
│   ├── llm.ts
│   └── ...
│
├── lib/
│
├── types/
│
├── package.json
└── README.md
```

---

# Agent Workflow

```
                User Input
                     │
                     ▼
           Company Validation Agent
                     │
                     ▼
         ┌──────────────────────────┐
         │ Parallel Execution       │
         │                          │
         │ Research Agent           │
         │ Financial Agent          │
         │ News Agent               │
         │ Sentiment Agent          │
         │ SWOT Agent               │
         │ Risk Agent               │
         └──────────────────────────┘
                     │
                     ▼
          Investment Decision Agent
                     │
                     ▼
           Report Generation Agent
                     │
                     ▼
           Final Investment Report
```

---

# How It Works

1. User enters a company name.

2. LangGraph initializes the graph state.

3. Company Validation Agent verifies the company.

4. Multiple agents execute in parallel.

5. Every agent returns structured JSON.

6. The Report Agent merges all successful outputs.

7. Missing sections are automatically handled.

8. A comprehensive investment report is generated.

---

# Running the Project

## Clone

```bash
git clone <repository-url>

cd investment-agent
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env.local` file.

Example:

```env
OPENROUTER_API_KEY=your_key
```

Only one provider is required depending on the configured LLM service.

---

## Start Development Server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# Build for Production

```bash
npm run build

npm start
```

---

# Deployment

The project is fully compatible with Vercel.

Deploy using:

```bash
vercel
```

Add the required environment variables in the Vercel dashboard before deployment.

---

# Current Limitations

The current version primarily relies on LLM-generated analysis.

Future versions will integrate:

* Live financial statements
* Real-time stock prices
* News APIs
* SEC filings
* Market indicators
* Analyst ratings
* Historical financial data

to improve factual accuracy and reduce reliance on model knowledge.

---

# Future Improvements

* Live financial API integration
* Real-time news aggregation
* SEC filing analysis
* Portfolio management
* Company comparison
* Historical report storage
* Multi-company benchmarking
* Explainable AI scoring
* Autonomous research agents
* Streaming responses
* PDF report export
* Advanced visualization dashboards

---

# License

This project is developed for educational  purposes.
