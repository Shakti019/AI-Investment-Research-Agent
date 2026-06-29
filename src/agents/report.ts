import type { GraphState } from "@/graph/state";
import type { FinalReport } from "@/types";

export async function reportAgent(
  state: GraphState
): Promise<Partial<GraphState>> {

  console.log("============== FINAL STATE ==============");
  console.dir(state, { depth: null });

  const missing: string[] = [];

  if (!state.companyInfo) missing.push("Company");
  if (!state.research) missing.push("Research");
  if (!state.financials) missing.push("Financial Analysis");
  if (!state.news) missing.push("News");
  if (!state.sentiment) missing.push("Sentiment");
  if (!state.swot) missing.push("SWOT");
  if (!state.risk) missing.push("Risk");
  if (!state.investment) missing.push("Investment Decision");

  const report: Partial<FinalReport> & {
    generatedAt: string;
    status: string;
    missingSections: string[];
  } = {
    generatedAt: new Date().toISOString(),

    company: state.companyInfo,
    research: state.research,
    financials: state.financials,
    news: state.news,
    sentiment: state.sentiment,
    swot: state.swot,
    risk: state.risk,
    investment: state.investment,

    status:
      missing.length === 0
        ? "SUCCESS"
        : "PARTIAL_SUCCESS",

    missingSections: missing,
  };

  console.log("============== FINAL REPORT ==============");
  console.dir(report, { depth: null });

  return {
    report: report as FinalReport,
    error:
      missing.length > 0
        ? `Some agents failed: ${missing.join(", ")}`
        : undefined,
  };
}