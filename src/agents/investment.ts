import { callLLM, parseJSON } from "@/services/llm";
import type { GraphState } from "@/graph/state";
import type { InvestmentDecision } from "@/types";

// Weights from the architecture document
const WEIGHTS = {
  financial: 0.35,
  growth: 0.20,
  sentiment: 0.15,
  valuation: 0.15,
  risk: 0.15,
};

function calcInvestmentScore(
  financial: number,
  growth: number,
  sentiment: number,
  valuation: number,
  risk: number
): number {
  return Math.round(
    financial * WEIGHTS.financial +
    growth * WEIGHTS.growth +
    sentiment * WEIGHTS.sentiment +
    valuation * WEIGHTS.valuation +
    risk * WEIGHTS.risk
  );
}

function scoreToRecommendation(score: number): "BUY" | "HOLD" | "PASS" {
  if (score >= 70) return "BUY";
  if (score >= 50) return "HOLD";
  return "PASS";
}

export async function investmentAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { companyInfo, financials, sentiment, risk, swot, research } = state;
  if (!companyInfo?.valid) return {};

  // Deterministic scoring
  const breakdown = {
    financial: financials?.scores.financial ?? 50,
    growth: financials?.scores.growth ?? 50,
    sentiment: sentiment?.score ?? 50,
    valuation: financials?.scores.valuation ?? 50,
    risk: risk?.score ?? 50,
  };

  const score = calcInvestmentScore(
    breakdown.financial,
    breakdown.growth,
    breakdown.sentiment,
    breakdown.valuation,
    breakdown.risk
  );

  const recommendation = scoreToRecommendation(score);

  // LLM generates qualitative reasoning
  const prompt = `You are a senior portfolio manager making a final investment recommendation.

Company: ${companyInfo.company} (${companyInfo.ticker})
Industry: ${companyInfo.industry}

QUANTITATIVE SCORES (0-100):
- Financial Health: ${breakdown.financial}/100 (weight 35%)
- Growth: ${breakdown.growth}/100 (weight 20%)
- News Sentiment: ${breakdown.sentiment}/100 (weight 15%)
- Valuation: ${breakdown.valuation}/100 (weight 15%)
- Risk-Adjusted: ${breakdown.risk}/100 (weight 15%)
- TOTAL WEIGHTED SCORE: ${score}/100

RECOMMENDATION: ${recommendation}

CONTEXT:
- Revenue: ${financials?.revenue}, Net Income: ${financials?.netIncome}
- PE Ratio: ${financials?.peRatio}, ROE: ${financials?.roe}%
- Debt: ${financials?.debtLevel}, Revenue Growth: ${financials?.revenueGrowth}
- Sentiment: ${sentiment?.overall} (${sentiment?.positive}% positive)
- Overall Risk: ${risk?.overallRisk}
- Key Strengths: ${swot?.strengths?.slice(0, 2).join("; ")}
- Key Threats: ${swot?.threats?.slice(0, 2).join("; ")}
- Recent Developments: ${research?.recentDevelopments?.slice(0, 2).join("; ")}

Return ONLY valid JSON (no markdown):
{
  "reasoning": [
    "Specific reason 1 referencing actual metrics",
    "Specific reason 2 referencing actual metrics",
    "Specific reason 3 referencing actual metrics",
    "Specific reason 4 referencing actual metrics"
  ],
  "thesis": "3-4 sentence investment thesis explaining the ${recommendation} recommendation with specific data points",
  "confidence": 85
}

The reasoning must be specific, data-driven, and reference actual company metrics. Confidence should reflect certainty in the recommendation (60-95 range).`;

  try {
    const raw = await callLLM(prompt);
    const llmOutput = parseJSON<{ reasoning: string[]; thesis: string; confidence: number }>(raw);

    const investment: InvestmentDecision = {
      recommendation,
      score,
      confidence: llmOutput.confidence,
      breakdown,
      reasoning: llmOutput.reasoning,
      thesis: llmOutput.thesis,
    };

    return { investment };
    console.log("Investment agent result:", investment);
    console.log("Investment agent raw response:", raw);
  } catch {
    console.error("Failed to analyze investment opportunity:", state.company);
    return { error: "Investment agent failed" };
  }
}
