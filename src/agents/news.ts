import { callLLM, parseJSON } from "@/services/llm";
import type { GraphState } from "@/graph/state";
import type { NewsItem } from "@/types";

export async function newsAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { companyInfo } = state;
  if (!companyInfo?.valid) return {};

  const prompt = `You are a financial news analyst. Generate realistic recent news items for this company based on your knowledge of events in the last 30 days and recent history.

Company: ${companyInfo.company} (${companyInfo.ticker})
Industry: ${companyInfo.industry}

Return ONLY valid JSON array (no markdown):
[
  {
    "title": "News headline",
    "summary": "2-3 sentence summary of the news",
    "date": "YYYY-MM-DD",
    "category": "earnings | product | acquisition | legal | general",
    "sentiment": "positive | neutral | negative"
  }
]

Generate 6-8 realistic, specific news items covering: earnings results, product launches, partnerships, analyst ratings, regulatory news, competitive developments. Make them specific and realistic for this company.`;

  try {
    const raw = await callLLM(prompt);
    const news = parseJSON<NewsItem[]>(raw);
    console.log("News agent result:", news);
    console.log("News agent raw response:", raw);
    return { news };
  } catch {
    return { error: "News agent failed" };
  }
}
