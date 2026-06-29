import { NextRequest, NextResponse } from "next/server";
import { buildWorkflow } from "@/graph/workflow";

export async function POST(req: NextRequest) {
  try {
    const { company } = await req.json();

    if (!company || typeof company !== "string" || !company.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is not configured. Add it to your .env.local file. " +
            "Get a free key at https://openrouter.ai/apikey",
        },
        { status: 500 }
      );
    }

    const workflow = buildWorkflow();
    const result = await workflow.invoke({ company: company.trim() });
    console.log("Workflow result:", result);
    console.log("Workflow report:", result.report);
    console.log("Workflow error:", result.error);

    if (result.error && !result.report) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ report: result.report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Workflow failed";

    if (message.includes("OPENROUTER_API_KEY") || message.includes("API_KEY_INVALID")) {
      return NextResponse.json(
        { error: "Invalid or missing OpenRouter API key. Get a free one at https://openrouter.ai/apikey" },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
