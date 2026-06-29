"use client";

import { useState, useRef, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SAMPLES = ["Apple", "Tesla", "Zomato", "HDFC Bank", "Nvidia", "Reliance Industries", "Amazon", "Infosys"];

// ── Safe helpers ─────────────────────────────────────────────────────────────
const s = (v: unknown, fallback = "N/A") => (v != null && v !== "" ? String(v) : fallback);
const n = (v: unknown, fallback = 0) => { const x = Number(v); return isFinite(x) ? x : fallback; };
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? v : []);
const clamp = (v: number) => Math.min(100, Math.max(0, v));

// ── Types (flexible) ─────────────────────────────────────────────────────────
type Report = Record<string, any>;

// ── Ticker tape ───────────────────────────────────────────────────────────────
function TickerTape() {
  const tickers = ["AAPL +1.2%","TSLA -0.8%","NVDA +3.4%","MSFT +0.6%","GOOGL +1.1%","AMZN +0.9%","META +2.1%","RELIANCE +0.4%","HDFC +0.7%","TCS -0.3%","INFY +0.5%","ZOMATO +1.8%"];
  const row = [...tickers, ...tickers];
  return (
    <div className="overflow-hidden py-1.5 border-b" style={{ background:"#f1f1f1", borderColor:"#f2f2f3" }}>
      <div className="flex gap-8 whitespace-nowrap" style={{ animation:"marquee 35s linear infinite" }}>
        {row.map((t,i) => (
          <span key={i} className="text-xs font-mono font-medium" style={{ color: t.includes("+") ? "#34d399" : "#f87171" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, label, weight }: { score: number; label?: string; weight?: string }) {
  const v = clamp(n(score));
  const color = v >= 70 ? "#059669" : v >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="mb-3">
      {(label || weight) && (
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-slate-700">{label}</span>
          <div className="flex items-center gap-2">
            {weight && <span className="text-slate-400">{weight}</span>}
            <span className="font-bold" style={{ color }}>{v}</span>
          </div>
        </div>
      )}
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width:`${v}%`, background:`linear-gradient(90deg, ${color}, ${color}cc)` }} />
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "#2563eb" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background:"white", borderColor:"#e2e8f0" }}>
      <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: string }) {
  const map: Record<string,string> = { Low:"#059669", Medium:"#d97706", High:"#dc2626" };
  const c = map[level] || "#64748b";
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:`${c}18`, color:c, border:`1px solid ${c}40` }}>{level}</span>
  );
}

// ── Verdict badge ─────────────────────────────────────────────────────────────
function VerdictBadge({ verdict }: { verdict?: string }) {
  const v = verdict || "HOLD";
  const map: Record<string,{ cls:string; color:string; bg:string; sub:string }> = {
    BUY:  { cls:"verdict-buy",  color:"#059669", bg:"#ecfdf5", sub:"STRONG BUY SIGNAL" },
    HOLD: { cls:"verdict-hold", color:"#d97706", bg:"#fffbeb", sub:"MONITOR POSITION" },
    PASS: { cls:"verdict-pass", color:"#dc2626", bg:"#fef2f2", sub:"AVOID" },
  };
  const { cls, color, sub } = map[v] || map.HOLD;
  return (
    <div className={`${cls} rounded-2xl px-12 py-6 text-center`}>
      <div className="text-6xl font-black tracking-widest" style={{ color }}>{v}</div>
      <div className="text-xs mt-2 font-bold tracking-widest" style={{ color, opacity:0.7 }}>{sub}</div>
    </div>
  );
}

// ── Radar chart ───────────────────────────────────────────────────────────────
function ScoreRadar({ breakdown }: { breakdown: Record<string,number> }) {
  const data = [
    { subject: "Financial", value: clamp(n(breakdown?.financial)) },
    { subject: "Growth",    value: clamp(n(breakdown?.growth)) },
    { subject: "Sentiment", value: clamp(n(breakdown?.sentiment)) },
    { subject: "Valuation", value: clamp(n(breakdown?.valuation)) },
    { subject: "Risk",      value: clamp(n(breakdown?.risk)) },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:"#64748b", fontWeight:600 }} />
        <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Sentiment pie ─────────────────────────────────────────────────────────────
function SentimentPie({ sentiment }: { sentiment: any }) {
  const data = [
    { name:"Positive", value: n(sentiment?.positive, 33) },
    { name:"Neutral",  value: n(sentiment?.neutral,  34) },
    { name:"Negative", value: n(sentiment?.negative, 33) },
  ];
  const COLORS = ["#059669","#64748b","#dc2626"];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
        <Tooltip formatter={(v:any) => `${v}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Risk bar chart ────────────────────────────────────────────────────────────
function RiskChart({ risk }: { risk: any }) {
  const levelToScore: Record<string,number> = { Low:85, Medium:50, High:20 };
  const data = [
    { name:"Financial",  score: levelToScore[risk?.financial?.level] ?? 50 },
    { name:"Industry",   score: levelToScore[risk?.industry?.level] ?? 50 },
    { name:"Political",  score: levelToScore[risk?.political?.level] ?? 50 },
    { name:"Competition",score: levelToScore[risk?.competition?.level] ?? 50 },
    { name:"Innovation", score: levelToScore[risk?.innovation?.level] ?? 50 },
    { name:"Regulatory", score: levelToScore[risk?.regulatory?.level] ?? 50 },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left:20, right:20 }}>
        <XAxis type="number" domain={[0,100]} tick={{ fontSize:10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:"#64748b" }} width={80} />
        <Tooltip formatter={(v:any) => [`${v}/100`, "Safety Score"]} />
        <Bar dataKey="score" radius={4}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.score >= 70 ? "#059669" : d.score >= 40 ? "#d97706" : "#dc2626"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Score bar chart ───────────────────────────────────────────────────────────
function ScoreBreakdownChart({ breakdown }: { breakdown: any }) {
  const data = [
    { name:"Financial", score: clamp(n(breakdown?.financial)), weight:35 },
    { name:"Growth",    score: clamp(n(breakdown?.growth)),    weight:20 },
    { name:"Sentiment", score: clamp(n(breakdown?.sentiment)), weight:15 },
    { name:"Valuation", score: clamp(n(breakdown?.valuation)), weight:15 },
    { name:"Risk",      score: clamp(n(breakdown?.risk)),      weight:15 },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left:0, right:20 }}>
        <XAxis dataKey="name" tick={{ fontSize:10, fill:"#64748b" }} />
        <YAxis domain={[0,100]} tick={{ fontSize:10 }} />
        <Tooltip formatter={(v:any, name:any, props:any) => [`${v}/100 (${props.payload.weight}% weight)`, name]} />
        <Bar dataKey="score" radius={[6,6,0,0]}>
          {data.map((d,i) => <Cell key={i} fill={d.score>=70?"#059669":d.score>=50?"#d97706":"#dc2626"} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── News card ─────────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: any }) {
  const sent = s(item?.sentiment, "neutral");
  const colorMap: Record<string,string> = { positive:"#059669", neutral:"#64748b", negative:"#dc2626" };
  const bgMap: Record<string,string> = { positive:"#ecfdf5", neutral:"#f8fafc", negative:"#fef2f2" };
  const c = colorMap[sent] || "#64748b";
  const bg = bgMap[sent] || "#f8fafc";
  return (
    <div className="rounded-lg p-3 border mb-2" style={{ background:bg, borderColor:`${c}30` }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-semibold text-slate-800 leading-snug">{s(item?.title,"Untitled")}</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold shrink-0" style={{ background:`${c}20`, color:c }}>{sent}</span>
      </div>
      <p className="text-xs text-slate-500 mb-1.5">{s(item?.summary)}</p>
      <div className="flex gap-2">
        <span className="text-xs text-slate-400">{s(item?.date)}</span>
        <span className="text-xs px-1.5 rounded bg-slate-100 text-slate-500">{s(item?.category)}</span>
      </div>
    </div>
  );
}

// ── SWOT card ─────────────────────────────────────────────────────────────────
function SwotCard({ label, items, color, bg }: { label:string; items:string[]; color:string; bg:string }) {
  const icons: Record<string,string> = { Strengths:"💪", Weaknesses:"⚠️", Opportunities:"🚀", Threats:"⛈️" };
  return (
    <div className="rounded-xl p-4 border" style={{ background:bg, borderColor:`${color}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <span>{icons[label]}</span>
        <span className="font-bold text-sm" style={{ color }}>{label}</span>
      </div>
      <ul className="space-y-1.5">
        {arr<string>(items).map((item,i) => (
          <li key={i} className="text-xs flex gap-2 text-slate-600">
            <span style={{ color, flexShrink:0 }}>▸</span>{item}
          </li>
        ))}
        {arr(items).length === 0 && <li className="text-xs text-slate-400">No data available</li>}
      </ul>
    </div>
  );
}

// ── Loading steps ─────────────────────────────────────────────────────────────
const STEPS = [
  { icon:"🏢", label:"Company Agent",    desc:"Validating identity & ticker" },
  { icon:"🔬", label:"Research Agent",   desc:"Gathering business intelligence" },
  { icon:"💰", label:"Finance Agent",    desc:"Extracting financial metrics (parallel)" },
  { icon:"📰", label:"News Agent",       desc:"Scanning recent news (parallel)" },
  { icon:"🧠", label:"Sentiment Agent",  desc:"Scoring news sentiment" },
  { icon:"⚔️", label:"SWOT Agent",      desc:"Building strategic analysis" },
  { icon:"⚠️", label:"Risk Agent",      desc:"Quantifying investment risks" },
  { icon:"📊", label:"Investment Agent", desc:"Computing weighted decision score" },
  { icon:"📋", label:"Report Agent",     desc:"Assembling final report" },
];

// ── PDF generator ─────────────────────────────────────────────────────────────
async function generatePDF(reportRef: React.RefObject<HTMLDivElement | null>, company: string) {
  if (!reportRef.current) return;
  const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / imgWidth;
  const totalHeight = imgHeight * ratio;
  let yPos = 0;
  while (yPos < totalHeight) {
    if (yPos > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, -yPos, pdfWidth, totalHeight);
    yPos += pdfHeight;
  }
  pdf.save(`AlphaSignal_${company.replace(/\s+/g, "_")}_Report.pdf`);
}

// ── Full report panel (for PDF + display) ────────────────────────────────────
function ReportPanel({ report }: { report: Report }) {
  const co   = report?.company    ?? {};
  const res  = report?.research   ?? {};
  const fin  = report?.financials ?? {};
  const sent = report?.sentiment  ?? {};
  const sw   = report?.swot       ?? {};
  const risk = report?.risk       ?? {};
  const inv  = report?.investment ?? {};
  const news = arr<any>(report?.news);
  const breakdown = inv?.breakdown ?? {};

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className="rounded-2xl p-6 border" style={{ background:"white", borderColor:"#e2e8f0" }}>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <VerdictBadge verdict={s(inv?.recommendation)} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-2xl font-black text-slate-900">{s(co?.company, "Unknown")}</h2>
              {s(co?.ticker,"N/A") !== "N/A" && (
                <span className="text-sm font-mono px-2 py-0.5 rounded-lg font-bold" style={{ background:"#eff6ff", color:"#2563eb" }}>{s(co?.ticker)}</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{s(co?.industry)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{s(co?.country)}</span>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{s(res?.summary, "No summary available.")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Score"      value={`${n(inv?.score)}/100`}    color="#2563eb" />
              <StatCard label="Confidence" value={`${n(inv?.confidence)}%`}  color="#7c3aed" />
              <StatCard label="Price"      value={s(fin?.currentPrice)}       color="#059669" />
              <StatCard label="12M Target" value={s(fin?.targetPrice)}        color="#d97706" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
          <h3 className="font-bold text-sm mb-1 text-slate-700 uppercase tracking-wider">Score Radar</h3>
          <ScoreRadar breakdown={breakdown} />
        </div>
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
          <h3 className="font-bold text-sm mb-1 text-slate-700 uppercase tracking-wider">Score Breakdown</h3>
          <ScoreBreakdownChart breakdown={breakdown} />
        </div>
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
          <h3 className="font-bold text-sm mb-1 text-slate-700 uppercase tracking-wider">Sentiment Split</h3>
          <SentimentPie sentiment={sent} />
        </div>
      </div>

      {/* Score breakdown bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
          <h3 className="font-bold text-sm mb-4 text-blue-700 uppercase tracking-wider">Weighted Score Breakdown</h3>
          <ScoreBar score={n(breakdown?.financial)} label="Financial Health" weight="35%" />
          <ScoreBar score={n(breakdown?.growth)}    label="Growth"           weight="20%" />
          <ScoreBar score={n(breakdown?.sentiment)} label="News Sentiment"   weight="15%" />
          <ScoreBar score={n(breakdown?.valuation)} label="Valuation"        weight="15%" />
          <ScoreBar score={n(breakdown?.risk)}      label="Risk-Adjusted"    weight="15%" />
          <div className="mt-4 pt-4 border-t border-slate-100">
            <ScoreBar score={n(inv?.score)} label="Total Weighted Score" />
          </div>
        </div>

        {/* Financials */}
        <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
          <h3 className="font-bold text-sm mb-4 text-blue-700 uppercase tracking-wider">Financial Snapshot</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Revenue",    s(fin?.revenue)],
              ["Net Income", s(fin?.netIncome)],
              ["EPS",        `$${n(fin?.eps)}`],
              ["P/E Ratio",  s(fin?.peRatio)],
              ["Market Cap", s(fin?.marketCap)],
              ["ROE",        `${n(fin?.roe)}%`],
              ["Debt Level", s(fin?.debtLevel)],
              ["Rev Growth", s(fin?.revenueGrowth)],
              ["Dividend",   s(fin?.dividend)],
              ["Cash Flow",  s(fin?.cashFlow)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg p-2.5 bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                <div className="text-xs font-bold text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk chart */}
      <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-blue-700 uppercase tracking-wider">Risk Matrix</h3>
          <RiskBadge level={s(risk?.overallRisk,"Medium")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskChart risk={risk} />
          <div className="grid grid-cols-1 gap-2">
            {(["financial","industry","political","competition","innovation","regulatory"] as const).map((key) => (
              <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-700 capitalize">{key}</div>
                  <div className="text-xs text-slate-400">{s(risk?.[key]?.detail)}</div>
                </div>
                <RiskBadge level={s(risk?.[key]?.level,"Medium")} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investment thesis */}
      <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <h3 className="font-bold text-sm mb-4 text-blue-700 uppercase tracking-wider">Investment Thesis</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{s(inv?.thesis, "No thesis available.")}</p>
        <div className="space-y-2">
          {arr<string>(inv?.reasoning).map((r,i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <span className="font-mono font-black text-blue-600 shrink-0">{String(i+1).padStart(2,"0")}</span>
              <span className="text-sm text-slate-700">{r}</span>
            </div>
          ))}
          {arr(inv?.reasoning).length === 0 && <p className="text-sm text-slate-400">No reasoning available.</p>}
        </div>
      </div>

      {/* SWOT */}
      <div>
        <h3 className="font-bold text-sm mb-3 text-slate-500 uppercase tracking-wider">SWOT Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SwotCard label="Strengths"     items={arr(sw?.strengths)}    color="#059669" bg="#ecfdf5" />
          <SwotCard label="Weaknesses"    items={arr(sw?.weaknesses)}   color="#dc2626" bg="#fef2f2" />
          <SwotCard label="Opportunities" items={arr(sw?.opportunities)} color="#2563eb" bg="#eff6ff" />
          <SwotCard label="Threats"       items={arr(sw?.threats)}      color="#d97706" bg="#fffbeb" />
        </div>
      </div>

      {/* News */}
      <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <h3 className="font-bold text-sm mb-4 text-blue-700 uppercase tracking-wider">Recent News ({news.length})</h3>
        {news.length > 0
          ? news.map((item,i) => <NewsCard key={i} item={item} />)
          : <p className="text-sm text-slate-400">No news data available.</p>}
      </div>

      {/* Company profile */}
      <div className="rounded-xl p-5 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <h3 className="font-bold text-sm mb-4 text-blue-700 uppercase tracking-wider">Company Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[["CEO", s(res?.ceo)],["HQ", s(res?.headquarters)],["Founded", s(res?.founded)],["Employees", s(res?.employees)]].map(([label,value]) => (
            <div key={label} className="rounded-lg p-3 bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400 mb-1">{label}</div>
              <div className="text-xs font-bold text-slate-800">{value}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Products & Services</div>
            <div className="flex flex-wrap gap-1">
              {arr<string>(res?.products).map((p) => (
                <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{p}</span>
              ))}
              {arr(res?.products).length === 0 && <span className="text-xs text-slate-400">N/A</span>}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Key Competitors</div>
            <div className="flex flex-wrap gap-1">
              {arr<string>(res?.competitors).map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">{c}</span>
              ))}
              {arr(res?.competitors).length === 0 && <span className="text-xs text-slate-400">N/A</span>}
            </div>
          </div>
        </div>
        {arr<string>(res?.recentDevelopments).length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Recent Developments</div>
            <ul className="space-y-1">
              {arr<string>(res?.recentDevelopments).map((d,i) => (
                <li key={i} className="text-xs text-slate-600 flex gap-2"><span className="text-blue-400">▸</span>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Summary sidebar ───────────────────────────────────────────────────────────
function SummarySidebar({ report }: { report: Report }) {
  const inv  = report?.investment ?? {};
  const fin  = report?.financials ?? {};
  const sent = report?.sentiment  ?? {};
  const risk = report?.risk       ?? {};
  const co   = report?.company    ?? {};
  const rec  = s(inv?.recommendation, "HOLD");
  const recColor = rec === "BUY" ? "#059669" : rec === "PASS" ? "#dc2626" : "#d97706";
  const sentOverall = s(sent?.overall,"neutral");
  const sentColor = sentOverall === "bullish" ? "#059669" : sentOverall === "bearish" ? "#dc2626" : "#d97706";

  return (
    <div className="space-y-4">
      {/* Signal */}
      <div className="rounded-2xl p-5 border text-center" style={{ background:"white", borderColor:"#e2e8f0" }}>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI Signal</div>
        <div className="text-5xl font-black mb-1" style={{ color:recColor }}>{rec}</div>
        <div className="text-xs font-bold" style={{ color:recColor }}>{n(inv?.confidence)}% Confidence</div>
        <div className="mt-3 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full" style={{ width:`${clamp(n(inv?.score))}%`, background:recColor }} />
        </div>
        <div className="text-xs text-slate-400 mt-1">Score: {n(inv?.score)}/100</div>
      </div>

      {/* Quick stats */}
      <div className="rounded-xl p-4 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Stats</div>
        <div className="space-y-3">
          {[
            { label:"Market Cap",    value:s(fin?.marketCap) },
            { label:"Current Price", value:s(fin?.currentPrice) },
            { label:"Target Price",  value:s(fin?.targetPrice) },
            { label:"P/E Ratio",     value:s(fin?.peRatio) },
            { label:"Revenue",       value:s(fin?.revenue) },
            { label:"Rev Growth",    value:s(fin?.revenueGrowth) },
            { label:"Dividend",      value:s(fin?.dividend) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-bold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment summary */}
      <div className="rounded-xl p-4 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Market Mood</div>
        <div className="text-center mb-3">
          <span className="text-lg font-black" style={{ color:sentColor }}>{sentOverall.toUpperCase()}</span>
        </div>
        {[
          { label:"Positive", val:n(sent?.positive,0), color:"#059669" },
          { label:"Neutral",  val:n(sent?.neutral,0),  color:"#64748b" },
          { label:"Negative", val:n(sent?.negative,0), color:"#dc2626" },
        ].map(({ label, val, color }) => (
          <div key={label} className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">{label}</span>
              <span className="font-bold" style={{ color }}>{val}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100">
              <div className="h-1.5 rounded-full" style={{ width:`${val}%`, background:color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Risk summary */}
      <div className="rounded-xl p-4 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Risk Overview</div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500">Overall Risk</span>
          <RiskBadge level={s(risk?.overallRisk,"Medium")} />
        </div>
        <div className="space-y-2">
          {(["financial","industry","political","competition","innovation","regulatory"] as const).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-slate-500 capitalize">{key}</span>
              <RiskBadge level={s(risk?.[key]?.level,"Medium")} />
            </div>
          ))}
        </div>
      </div>

      {/* Company */}
      <div className="rounded-xl p-4 border bg-white" style={{ borderColor:"#e2e8f0" }}>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Company</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">Ticker</span><span className="font-bold text-blue-600">{s(co?.ticker)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Sector</span><span className="font-bold">{s(co?.sector)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Industry</span><span className="font-bold">{s(co?.industry)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Country</span><span className="font-bold">{s(co?.country)}</span></div>
        </div>
      </div>
    </div>
  );
}

// ── Loading steps ─────────────────────────────────────────────────────────────
function LoadingView({ company, step }: { company:string; step:number }) {
  return (
    <div className="rounded-2xl p-6 border bg-white slide-down" style={{ borderColor:"#e2e8f0" }}>
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 pulse-blue" style={{ background:"#eff6ff", border:"2px solid #2563eb" }}>
          <span className="text-xl">🤖</span>
        </div>
        <h3 className="font-bold text-lg text-slate-800">Researching <span style={{ color:"#2563eb" }}>{company}</span></h3>
        <p className="text-xs text-slate-400 mt-1">9-agent LangGraph pipeline running<span className="cursor-blink ml-1">|</span></p>
      </div>
      <div className="space-y-1.5 mb-4">
        {STEPS.map((s2, i) => {
          const done = i < step; const active = i === step;
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
              style={{ background: active ? "#eff6ff" : "transparent", border: active ? "1px solid #bfdbfe" : "1px solid transparent" }}>
              <span className="text-sm w-5">{done ? "✅" : active ? "⏳" : "○"}</span>
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: active ? "#2563eb" : done ? "#94a3b8" : "#64748b" }}>{s2.icon} {s2.label}</div>
                {active && <div className="text-xs text-slate-400">{s2.desc}</div>}
              </div>
              {active && <div className="w-3 h-3 rounded-full border-2 border-blue-500 border-t-transparent" style={{ animation:"spin 0.8s linear infinite" }} />}
            </div>
          );
        })}
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width:`${Math.round((step/STEPS.length)*100)}%`, background:"linear-gradient(90deg,#2563eb,#7c3aed)" }} />
      </div>
      <p className="text-center text-xs text-slate-400 mt-2">{Math.round((step/STEPS.length)*100)}% complete</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [company, setCompany]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState(0);
  const [report, setReport]     = useState<Report | null>(null);
  const [error, setError]       = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const hasResult = !!report || loading;

  const handleResearch = useCallback(async (name?: string) => {
    const target = (name || company).trim();
    if (!target) return;
    setLoading(true); setReport(null); setError(""); setStep(0);
    const iv = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2200);
    try {
      const res = await fetch("/api/analyze", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ company:target }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setReport(data.report);
    } catch(e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      clearInterval(iv); setLoading(false);
    }
  }, [company]);

  const handlePDF = async () => {
    setPdfLoading(true);
    await generatePDF(reportRef, s(report?.company?.company, "Report"));
    setPdfLoading(false);
  };

  return (
    <div style={{ background:"#f0f4f8", minHeight:"100vh" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top nav */}
      <nav style={{ background:"#f5f5f5" }} className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background:"#030303" }}></div>
          <div>
            <div className="font-bold text-sm tracking-widest text-black">ALPHA SIGNAL</div>
            <div className="text-xs" style={{ color:"#070c0e" }}>AI Investment Research Engine</div>
          </div>
        </div>
        <div className="text-xs px-3 py-1 rounded-full font-mono hidden md:block" style={{ background:"rgba(255,255,255,0.1)", color:"#7dd3fc", border:"1px solid rgba(255,255,255,0.2)" }}>
          9 AGENTS · LANGGRAPH · GEMINI 2.0
        </div>
      </nav>
      <TickerTape />

      {/* Search — sticky when results shown */}
      <div className={hasResult ? "search-top shadow-md py-3 px-6" : "py-10 px-6"} style={{ background: hasResult ? "white" : "transparent", borderBottom: hasResult ? "1px solid #e2e8f0" : "none" }}>
        {!hasResult && (
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <h1 className="text-4xl font-black text-slate-900 mb-2">Research Any Company.<br /><span style={{ color:"#2563eb" }}>Get a Clear Signal.</span></h1>
            <p className="text-sm text-slate-500">9-agent pipeline · Parallel execution · Hybrid deterministic + LLM scoring</p>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 mb-3">
            <input
              type="text" value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResearch()}
              placeholder="Enter company name (e.g. Apple, Zomato, Tesla...)"
              className="flex-1 px-4 py-2.5 rounded-xl outline-none font-medium text-slate-900"
              style={{ background:"white", border:"2px solid #e2e8f0", fontSize:"14px" }}
            />
            <button onClick={() => handleResearch()} disabled={loading || !company.trim()}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
              style={{ background: loading ? "#94a3b8" : "#2563eb", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Running..." : "Analyse →"}
            </button>
            {report && (
              <button onClick={handlePDF} disabled={pdfLoading}
                className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                style={{ background:pdfLoading?"#94a3b8":"#059669", color:"white", cursor:pdfLoading?"not-allowed":"pointer" }}>
                {pdfLoading ? "⏳" : "⬇"} PDF
              </button>
            )}
          </div>
          {!hasResult && (
            <div className="flex flex-wrap gap-2 justify-center">
              {SAMPLES.map((c) => (
                <button key={c} onClick={() => { setCompany(c); handleResearch(c); }} disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{ background:"white", border:"1px solid #e2e8f0", color:"#64748b", cursor:loading?"not-allowed":"pointer" }}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="rounded-xl p-4 mb-6 border" style={{ background:"#fef2f2", borderColor:"#fecaca" }}>
            <p className="text-sm font-medium" style={{ color:"#dc2626" }}>⚠ {error}</p>
          </div>
        )}

        {loading && <LoadingView company={company} step={step} />}

        {report && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 fade-in">
            {/* Left: full report */}
            <div className="lg:col-span-3" ref={reportRef}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-800 text-lg">Full Research Report</h2>
                <span className="text-xs text-slate-400">Generated {new Date(s(report?.generatedAt, new Date().toISOString())).toLocaleString()}</span>
              </div>
              <ReportPanel report={report} />
              <p className="text-center text-xs text-slate-400 mt-6">Alpha Signal is for informational purposes only, not financial advice.</p>
            </div>
            {/* Right: summary sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-16">
                <h2 className="font-black text-slate-800 text-sm mb-4 uppercase tracking-wider">Summary</h2>
                <SummarySidebar report={report} />
              </div>
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">📡</div>
            <p className="text-slate-400 font-medium">Enter a company name above to launch the 9-agent research pipeline.</p>
          </div>
        )}
      </main>
    </div>
  );
}