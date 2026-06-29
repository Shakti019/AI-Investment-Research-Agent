export interface CompanyInfo {
  company: string;
  ticker: string;
  country: string;
  industry: string;
  sector: string;
  valid: boolean;
}

export interface ResearchResult {
  summary: string;
  businessModel: string;
  products: string[];
  ceo: string;
  headquarters: string;
  founded: string;
  employees: string;
  competitors: string[];
  recentDevelopments: string[];
}

export interface FinancialData {
  revenue: string;
  netIncome: string;
  eps: number;
  peRatio: number;
  marketCap: string;
  debtLevel: string;
  cashFlow: string;
  roe: number;
  revenueGrowth: string;
  dividend: string;
  currentPrice: string;
  targetPrice: string;
  // Scores 0-100
  scores: {
    financial: number;
    growth: number;
    valuation: number;
  };
}

export interface NewsItem {
  title: string;
  summary: string;
  date: string;
  category: "earnings" | "product" | "acquisition" | "legal" | "general";
  sentiment: "positive" | "neutral" | "negative";
}

export interface Sentiment {
  positive: number;
  neutral: number;
  negative: number;
  overall: "bullish" | "neutral" | "bearish";
  score: number; // 0-100
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Risk {
  financial: { level: "Low" | "Medium" | "High"; detail: string };
  industry: { level: "Low" | "Medium" | "High"; detail: string };
  political: { level: "Low" | "Medium" | "High"; detail: string };
  competition: { level: "Low" | "Medium" | "High"; detail: string };
  innovation: { level: "Low" | "Medium" | "High"; detail: string };
  regulatory: { level: "Low" | "Medium" | "High"; detail: string };
  overallRisk: "Low" | "Medium" | "High";
  score: number; // 0-100, higher = less risk
}

export interface InvestmentDecision {
  recommendation: "BUY" | "HOLD" | "PASS";
  score: number; // 0-100
  confidence: number; // 0-100
  breakdown: {
    financial: number;
    growth: number;
    sentiment: number;
    valuation: number;
    risk: number;
  };
  reasoning: string[];
  thesis: string;
}

export interface FinalReport {
  generatedAt: string;
  company: CompanyInfo;
  research: ResearchResult;
  financials: FinancialData;
  news: NewsItem[];
  sentiment: Sentiment;
  swot: SWOT;
  risk: Risk;
  investment: InvestmentDecision;
}

export interface GraphState {
  company: string;
  companyInfo?: CompanyInfo;
  research?: ResearchResult;
  financials?: FinancialData;
  news?: NewsItem[];
  sentiment?: Sentiment;
  swot?: SWOT;
  risk?: Risk;
  investment?: InvestmentDecision;
  report?: FinalReport;
  error?: string;
}
