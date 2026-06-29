import type { GraphState } from "@/graph/state";
import type { Sentiment } from "@/types";

export async function sentimentAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { news } = state;
  if (!news || news.length === 0) return {};

  // Deterministic scoring from news items
  const total = news.length;
  const positiveCount = news.filter((n) => n.sentiment === "positive").length;
  const neutralCount = news.filter((n) => n.sentiment === "neutral").length;
  const negativeCount = news.filter((n) => n.sentiment === "negative").length;

  const positive = Math.round((positiveCount / total) * 100);
  const neutral = Math.round((neutralCount / total) * 100);
  const negative = Math.round((negativeCount / total) * 100);

  // Score: weighted sum (positive=1, neutral=0.5, negative=0)
  const rawScore = (positiveCount * 1 + neutralCount * 0.5) / total;
  const score = Math.round(rawScore * 100);

  let overall: Sentiment["overall"];
  if (score >= 65) overall = "bullish";
  else if (score >= 40) overall = "neutral";
  else overall = "bearish";

  const sentiment: Sentiment = { positive, neutral, negative, overall, score };
  console.log("Sentiment agent result:", sentiment);
  console.log("Sentiment agent raw response:", { positive, neutral, negative, overall, score });
  return { sentiment };
}
