import { callLLM, parseJSON } from "@/services/llm";
import type { GraphState } from "@/graph/state";
import type { CompanyInfo } from "@/types";

export async function companyAgent(state: GraphState): Promise<Partial<GraphState>> {
  const prompt = `You are a company validation agent. Given a company name, return structured information about it.

Company: "${state.company}"

Return ONLY valid JSON (no markdown, no explanation):
{
  "company": "Full official company name",
  "ticker": "Stock ticker symbol or N/A",
  "country": "Country of headquarters",
  "industry": "Industry sector",
  "sector": "Broader sector (Technology/Finance/Healthcare/Energy/Consumer/Industrial)",
  "valid": true
}

If the company does not exist or is completely unknown, set "valid": false and fill other fields with "Unknown".`;

  try {
    const raw = await callLLM(prompt);
    const companyInfo = parseJSON<CompanyInfo>(raw);
    console.log("Company validation result:", companyInfo);
    console.log("Company validation raw response:", raw);
    return { companyInfo };
  } catch {
    console.error("Failed to validate company:", state.company);
    
    return {
      companyInfo: {
        company: state.company,
        ticker: "N/A",
        country: "Unknown",
        industry: "Unknown",
        sector: "Unknown",
        valid: false,
      },
      error: "Company validation failed",
    };
  }
}
