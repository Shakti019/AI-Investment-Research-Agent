import { NextRequest, NextResponse } from "next/server";
import { runInvestmentAgent } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const { company, apiKey } = await req.json();

    if (!company || typeof company !== "string") {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const resolvedKey = apiKey || process.env.OPENROUTER_API_KEY;

    if (!resolvedKey) {
      return NextResponse.json(
        {
          error:
            "Google Gemini API key required. Add it in the app or set GOOGLE_API_KEY in .env.local. Get a free key at https://aistudio.google.com/apikey",
        },
        { status: 400 }
      );
    }

    const report = await runInvestmentAgent(company.trim(), resolvedKey);
    return NextResponse.json({ report });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Agent research failed";

    // Surface API key errors clearly
    if (
      message.includes("401") ||
      message.includes("API key") ||
      message.includes("API_KEY_INVALID")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Google Gemini API key. Get a free one at https://aistudio.google.com/apikey",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
