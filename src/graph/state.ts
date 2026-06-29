import { Annotation } from "@langchain/langgraph";
import type {
  CompanyInfo,
  ResearchResult,
  FinancialData,
  NewsItem,
  Sentiment,
  SWOT,
  Risk,
  InvestmentDecision,
  FinalReport,
} from "@/types";

export const GraphStateAnnotation = Annotation.Root({
  company: Annotation<string>({
    reducer: (_, next) => next,
  }),
  companyInfo: Annotation<CompanyInfo | undefined>({
    reducer: (_, next) => next,
  }),
  research: Annotation<ResearchResult | undefined>({
    reducer: (_, next) => next,
  }),
  financials: Annotation<FinancialData | undefined>({
    reducer: (_, next) => next,
  }),
  news: Annotation<NewsItem[] | undefined>({
    reducer: (_, next) => next,
  }),
  sentiment: Annotation<Sentiment | undefined>({
    reducer: (_, next) => next,
  }),
  swot: Annotation<SWOT | undefined>({
    reducer: (_, next) => next,
  }),
  risk: Annotation<Risk | undefined>({
    reducer: (_, next) => next,
  }),
  investment: Annotation<InvestmentDecision | undefined>({
    reducer: (_, next) => next,
  }),
  report: Annotation<FinalReport | undefined>({
    reducer: (_, next) => next,
  }),
  error: Annotation<string | undefined>({
    reducer: (_, next) => next,
  }),
});

export type GraphState = typeof GraphStateAnnotation.State;
