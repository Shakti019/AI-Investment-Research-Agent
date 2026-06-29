import { StateGraph, END } from "@langchain/langgraph";
import { GraphStateAnnotation } from "./state";
import { companyAgent } from "@/agents/company";
import { researchAgent } from "@/agents/research";
import { financeAgent } from "@/agents/finance";
import { newsAgent } from "@/agents/news";
import { sentimentAgent } from "@/agents/sentiment";
import { swotAgent } from "@/agents/swot";
import { riskAgent } from "@/agents/risk";
import { investmentAgent } from "@/agents/investment";
import { reportAgent } from "@/agents/report";
import type { GraphState } from "./state";

// Parallel node: runs Finance + News concurrently
async function parallelFinanceNews(state: GraphState): Promise<Partial<GraphState>> {
  const [financeResult, newsResult] = await Promise.all([
    financeAgent(state),
    newsAgent(state),
  ]);
  return {
    ...financeResult,
    ...newsResult,
  };
}

export function buildWorkflow() {
  const workflow = new StateGraph(GraphStateAnnotation)
    // Node definitions — prefixed with "node_" to avoid clashing with state field names
    .addNode("node_company", companyAgent)
    .addNode("node_research", researchAgent)
    .addNode("node_finance_news", parallelFinanceNews)
    .addNode("node_sentiment", sentimentAgent)
    .addNode("node_swot", swotAgent)
    .addNode("node_risk", riskAgent)
    .addNode("node_investment", investmentAgent)
    .addNode("node_report", reportAgent)

    // Edges
    .addEdge("__start__", "node_company")
    .addEdge("node_company", "node_research")
    .addEdge("node_research", "node_finance_news")
    .addEdge("node_finance_news", "node_sentiment")
    .addEdge("node_sentiment", "node_swot")
    .addEdge("node_swot", "node_risk")
    .addEdge("node_risk", "node_investment")
    .addEdge("node_investment", "node_report")
    .addEdge("node_report", END);

  return workflow.compile();
}
