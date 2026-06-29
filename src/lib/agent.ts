import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export interface ResearchSection {
  title: string;
  content: string;
  score?: number; // 0-10
  sentiment?: "positive" | "negative" | "neutral";
}

export interface InvestmentReport {
  company: string;
  ticker?: string;
  sector?: string;
  verdict: "INVEST" | "PASS" | "HOLD";
  confidence: number; // 0-100
  targetPrice?: string;
  currentPrice?: string;
  summary: string;
  sections: ResearchSection[];
  risks: string[];
  catalysts: string[];
  finalReasoning: string;
  generatedAt: string;
}

const SYSTEM_PROMPT = `You are Alpha Signal, an elite AI investment research analyst at a top-tier hedge fund. 
You conduct rigorous, data-driven investment research and make clear BUY/HOLD/PASS decisions.

Your analysis must be:
- Brutally honest and data-driven
- Based on fundamentals, competitive moat, management quality, and market dynamics
- Clear about risks and upside catalysts
- Culminating in a decisive INVEST, HOLD, or PASS verdict with confidence score

Format your response as valid JSON matching this exact schema:
{
  "ticker": "SYMBOL or null",
  "sector": "Technology/Finance/Healthcare/etc",
  "verdict": "INVEST" | "PASS" | "HOLD",
  "confidence": 0-100,
  "currentPrice": "approximate price or N/A",
  "targetPrice": "12-month target or N/A",
  "summary": "2-3 sentence executive summary",
  "sections": [
    {
      "title": "Business Overview",
      "content": "detailed paragraph",
      "score": 0-10,
      "sentiment": "positive" | "negative" | "neutral"
    },
    {
      "title": "Financial Health",
      "content": "detailed paragraph",
      "score": 0-10,
      "sentiment": "positive" | "negative" | "neutral"
    },
    {
      "title": "Competitive Moat",
      "content": "detailed paragraph",
      "score": 0-10,
      "sentiment": "positive" | "negative" | "neutral"
    },
    {
      "title": "Growth Trajectory",
      "content": "detailed paragraph",
      "score": 0-10,
      "sentiment": "positive" | "negative" | "neutral"
    },
    {
      "title": "Management & Governance",
      "content": "detailed paragraph",
      "score": 0-10,
      "sentiment": "positive" | "negative" | "neutral"
    },
    {
      "title": "Valuation Assessment",
      "content": "detailed paragraph",
      "score": 0-10,
      "sentiment": "positive" | "negative" | "neutral"
    },
    {
      "title": "Market & Macro Context",
      "content": "detailed paragraph",
      "score": 0-10,
      "sentiment": "positive" | "negative" | "neutral"
    }
  ],
  "risks": ["risk1", "risk2", "risk3", "risk4", "risk5"],
  "catalysts": ["catalyst1", "catalyst2", "catalyst3"],
  "finalReasoning": "3-4 paragraph detailed investment thesis explaining the verdict"
}

Be specific, use real metrics where possible, and make a confident decision. Never hedge excessively.`;

export async function runInvestmentAgent(
  companyName: string,
  apiKey: string
): Promise<InvestmentReport> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.3,
    apiKey,
    maxOutputTokens: 4000,
  });

  const userPrompt = `Conduct comprehensive investment research on: ${companyName}

Research and analyze this company thoroughly across all dimensions. Use your knowledge of:
- Their latest financial performance and balance sheet health
- Business model and revenue streams
- Competitive positioning and moat
- Industry dynamics and market size
- Key risks (regulatory, competitive, macro)
- Growth drivers and upcoming catalysts
- Valuation relative to peers

Make a clear INVEST / HOLD / PASS decision with your confidence level (0-100%).
Return ONLY valid JSON, no markdown, no explanation outside the JSON.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;

  // Strip any markdown code fences if present
  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  return {
    company: companyName,
    ticker: parsed.ticker,
    sector: parsed.sector,
    verdict: parsed.verdict,
    confidence: parsed.confidence,
    currentPrice: parsed.currentPrice,
    targetPrice: parsed.targetPrice,
    summary: parsed.summary,
    sections: parsed.sections,
    risks: parsed.risks,
    catalysts: parsed.catalysts,
    finalReasoning: parsed.finalReasoning,
    generatedAt: new Date().toISOString(),
  };
}
