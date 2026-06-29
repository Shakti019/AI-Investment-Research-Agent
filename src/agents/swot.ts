import { callLLM, parseJSON } from "@/services/llm";
import type { GraphState } from "@/graph/state";
import type { SWOT } from "@/types";

export async function swotAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { companyInfo, research, financials } = state;
  if (!companyInfo?.valid) return {};

  const prompt = `You are a strategic analyst. Produce a SWOT analysis based on the data below.

Company: ${companyInfo.company} (${companyInfo.ticker})
Industry: ${companyInfo.industry}
Revenue: ${financials?.revenue || "N/A"}
Net Income: ${financials?.netIncome || "N/A"}
Debt Level: ${financials?.debtLevel || "N/A"}
ROE: ${financials?.roe || "N/A"}%
Revenue Growth: ${financials?.revenueGrowth || "N/A"}
Competitors: ${research?.competitors?.join(", ") || "N/A"}
Business Model: ${research?.businessModel || "N/A"}
Recent Developments: ${research?.recentDevelopments?.join("; ") || "N/A"}

Return ONLY valid JSON (no markdown):
{
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "threats": ["threat 1", "threat 2", "threat 3"]
}

Be specific and data-driven. Reference actual company characteristics.`;

  try {
    const raw = await callLLM(prompt);
    const swot = parseJSON<SWOT>(raw);
    return { swot };
  } catch {
    return { error: "SWOT agent failed" };
  }
}
