import { callLLM, parseJSON } from "@/services/llm";
import type { GraphState } from "@/graph/state";
import type { ResearchResult } from "@/types";

export async function researchAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { companyInfo } = state;
  if (!companyInfo?.valid) return { research: undefined };

  const prompt = `You are a senior equity research analyst. Provide comprehensive research on this company.

Company: ${companyInfo.company} (${companyInfo.ticker})
Industry: ${companyInfo.industry}
Country: ${companyInfo.country}

Return ONLY valid JSON (no markdown):
{
  "summary": "3-4 sentence company overview",
  "businessModel": "How the company makes money",
  "products": ["product/service 1", "product/service 2", "product/service 3", "product/service 4"],
  "ceo": "Current CEO name",
  "headquarters": "City, Country",
  "founded": "Year founded",
  "employees": "Approximate employee count",
  "competitors": ["competitor1", "competitor2", "competitor3", "competitor4"],
  "recentDevelopments": [
    "Recent development or strategic move 1",
    "Recent development or strategic move 2",
    "Recent development or strategic move 3"
  ]
}`;

  try {
    const raw = await callLLM(prompt);
    const research = parseJSON<ResearchResult>(raw);
    return { research };
    console.log("Research agent result:", research);
    console.log("Research agent raw response:", raw);
  } catch {
    console.error("Failed to analyze company research:", state.company);
    return { error: "Research agent failed" };
  }
}
