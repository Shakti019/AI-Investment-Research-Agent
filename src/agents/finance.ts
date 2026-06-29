import { callLLM, parseJSON } from "@/services/llm";
import type { GraphState } from "@/graph/state";
import type { FinancialData } from "@/types";

function calcFinancialScore(data: Omit<FinancialData, "scores">): {
  financial: number;
  growth: number;
  valuation: number;
} {
  // Financial health score (0-100)
  let financial = 50;
  if (data.debtLevel === "Low") financial += 20;
  else if (data.debtLevel === "Medium") financial += 5;
  else financial -= 10;
  if (data.roe > 20) financial += 20;
  else if (data.roe > 10) financial += 10;
  if (data.cashFlow.includes("+") || data.cashFlow.includes("B")) financial += 10;
  financial = Math.min(100, Math.max(0, financial));

  // Growth score (0-100)
  let growth = 50;
  const growthNum = parseFloat(data.revenueGrowth.replace(/[^0-9.-]/g, ""));
  if (!isNaN(growthNum)) {
    if (growthNum > 20) growth = 90;
    else if (growthNum > 10) growth = 75;
    else if (growthNum > 5) growth = 60;
    else if (growthNum > 0) growth = 50;
    else growth = 30;
  }

  // Valuation score (0-100) — lower PE = better value
  let valuation = 50;
  if (data.peRatio > 0) {
    if (data.peRatio < 15) valuation = 85;
    else if (data.peRatio < 25) valuation = 70;
    else if (data.peRatio < 40) valuation = 55;
    else if (data.peRatio < 60) valuation = 40;
    else valuation = 25;
  }

  return { financial, growth, valuation };
}

export async function financeAgent(state: GraphState): Promise<Partial<GraphState>> {
  const { companyInfo, research } = state;
  if (!companyInfo?.valid) return {};

  const prompt = `You are a financial analyst at a hedge fund. Analyze the financials of this company based on your knowledge.

Company: ${companyInfo.company} (${companyInfo.ticker})
Industry: ${companyInfo.industry}
Competitors: ${research?.competitors?.join(", ") || "N/A"}

Return ONLY valid JSON (no markdown):
{
  "revenue": "Latest annual revenue (e.g. $391B)",
  "netIncome": "Latest net income (e.g. $98B)",
  "eps": 6.12,
  "peRatio": 29.5,
  "marketCap": "Market cap (e.g. $2.9T)",
  "debtLevel": "Low | Medium | High",
  "cashFlow": "Free cash flow description (e.g. +$107B)",
  "roe": 33.5,
  "revenueGrowth": "YoY revenue growth % (e.g. +8.1%)",
  "dividend": "Dividend yield or None",
  "currentPrice": "Approximate current stock price (e.g. $189)",
  "targetPrice": "Analyst consensus 12-month target (e.g. $215)"
}

Use real, known figures where possible. If unknown, make reasonable estimates based on industry norms.`;

  try {
    const raw = await callLLM(prompt);
    const base = parseJSON<Omit<FinancialData, "scores">>(raw);
    const scores = calcFinancialScore(base);
    const financials: FinancialData = { ...base, scores };
    console.log("Finance agent result:", financials);
    console.log("Finance agent raw response:", raw);
    return { financials };
  } catch {
    console.error("Failed to analyze company finances:", state.company);
    return { error: "Finance agent failed" };
  }
}
