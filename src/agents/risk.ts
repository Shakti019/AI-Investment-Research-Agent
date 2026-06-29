import { callLLM, parseJSON } from "@/services/llm";
import type { GraphState } from "@/graph/state";
import type { Risk } from "@/types";

function calcRiskScore(risk: Omit<Risk, "score">): number {
  const levelMap: Record<string, number> = { Low: 90, Medium: 60, High: 25 };
  const categories = [
    risk.financial.level,
    risk.industry.level,
    risk.political.level,
    risk.competition.level,
    risk.innovation.level,
    risk.regulatory.level,
  ];
  const avg = categories.reduce((sum, l) => sum + (levelMap[l] ?? 50), 0) / categories.length;
  return Math.round(avg);
}

export async function riskAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { companyInfo, financials, swot, sentiment } = state;
  if (!companyInfo?.valid) return {};

  const prompt = `You are a risk management analyst. Assess investment risks for this company.

Company: ${companyInfo.company} (${companyInfo.ticker})
Industry: ${companyInfo.industry}
Country: ${companyInfo.country}
Debt Level: ${financials?.debtLevel || "N/A"}
Revenue Growth: ${financials?.revenueGrowth || "N/A"}
Threats: ${swot?.threats?.join("; ") || "N/A"}
News Sentiment: ${sentiment?.overall || "N/A"}

Return ONLY valid JSON (no markdown):
{
  "financial": { "level": "Low | Medium | High", "detail": "1 sentence explanation" },
  "industry": { "level": "Low | Medium | High", "detail": "1 sentence explanation" },
  "political": { "level": "Low | Medium | High", "detail": "1 sentence explanation" },
  "competition": { "level": "Low | Medium | High", "detail": "1 sentence explanation" },
  "innovation": { "level": "Low | Medium | High", "detail": "1 sentence explanation" },
  "regulatory": { "level": "Low | Medium | High", "detail": "1 sentence explanation" },
  "overallRisk": "Low | Medium | High"
}`;

  try {
    const raw = await callLLM(prompt);
    const base = parseJSON<Omit<Risk, "score">>(raw);
    const score = calcRiskScore(base);
    const risk: Risk = { ...base, score };
    console.log("Risk agent result:", risk);
    console.log("Risk agent raw response:", raw);
    return { risk };
  } catch {
    console.error("Failed to analyze investment risk:", state.company);
    return { error: "Risk agent failed" };
  }
}
